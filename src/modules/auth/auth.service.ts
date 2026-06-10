import { createHash, randomInt } from 'crypto';

import { env } from '@config/env';
import { Role } from '@common/enums/role.enum';
import { HTTP_STATUS } from '@core/response/http-status';
import { AuthRepository } from '@modules/auth/auth.repository';
import { LoginInput, RegisterInput, RequestOtpInput } from '@modules/auth/auth.types';
import { UserResponse } from '@modules/users/user.types';
import { ApiError } from '@utils/ApiError';
import { generateAccessToken } from '@utils/jwt';
import { comparePassword, hashPassword } from '@utils/password';

export class AuthService {
  constructor(private readonly authRepository = new AuthRepository()) {}

  async requestOtp(payload: RequestOtpInput): Promise<{ expiresInSeconds: number; developmentOtp?: string }> {
    const tenantId = payload.tenantId || 'demo';
    const phone = this.normalizePhone(payload.phone);
    const existingUser = await this.authRepository.findUserByPhone(tenantId, phone);

    if (existingUser) {
      throw new ApiError(HTTP_STATUS.CONFLICT, 'Phone number is already registered');
    }

    const existingOtp = await this.authRepository.findLatestOtp(tenantId, phone);
    const resendDelayMs = env.OTP_RESEND_DELAY_SECONDS * 1000;

    if (existingOtp && Date.now() - new Date(existingOtp.createdAt).getTime() < resendDelayMs) {
      throw new ApiError(HTTP_STATUS.TOO_MANY_REQUESTS, 'Please wait before requesting another OTP');
    }

    const otp = String(randomInt(100000, 1000000));
    const expiresInSeconds = env.OTP_EXPIRES_IN_MINUTES * 60;

    await this.authRepository.createOtp({
      tenantId,
      phone,
      codeHash: this.hashOtp(phone, otp),
      expiresAt: new Date(Date.now() + expiresInSeconds * 1000),
      attempts: 0
    });

    return {
      expiresInSeconds,
      ...(env.NODE_ENV !== 'production' ? { developmentOtp: otp } : {})
    };
  }

  async register(payload: RegisterInput): Promise<{ user: UserResponse; accessToken: string }> {
    const tenantId = payload.tenantId || 'demo';
    const email = payload.email.trim().toLowerCase();
    const phone = this.normalizePhone(payload.phone);
    const existingUser = await this.authRepository.findUserByEmail(email, tenantId);

    if (existingUser) {
      throw new ApiError(HTTP_STATUS.CONFLICT, 'User already exists');
    }

    if (await this.authRepository.findUserByPhone(tenantId, phone)) {
      throw new ApiError(HTTP_STATUS.CONFLICT, 'Phone number is already registered');
    }

    await this.verifyOtp(tenantId, phone, payload.otp);

    const { firstName, lastName } = this.splitName(payload.name);
    const user = await this.authRepository.createUser({
      tenantId,
      email,
      phone,
      phoneVerifiedAt: new Date(),
      firstName,
      lastName,
      role: Role.CUSTOMER,
      password: await hashPassword(payload.password)
    });

    const { password: _password, ...safeUser } = user;

    return {
      user: safeUser,
      accessToken: generateAccessToken({
        sub: user._id,
        role: user.role,
        tenantId: user.tenantId
      })
    };
  }

  async login(payload: LoginInput): Promise<{ user: UserResponse; accessToken: string }> {
    const email = payload.email.trim().toLowerCase();
    const user = payload.tenantId
      ? await this.authRepository.findUserByEmail(email, payload.tenantId)
      : await this.resolveUserByEmail(email);

    if (!user || user.isDeleted || !user.isActive || !(await comparePassword(payload.password, user.password))) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Invalid credentials');
    }

    const { password: _password, ...safeUser } = user;

    return {
      user: safeUser,
      accessToken: generateAccessToken(
        {
          sub: user._id,
          role: user.role,
          tenantId: user.tenantId
        },
        payload.rememberMe
      )
    };
  }

  private async resolveUserByEmail(email: string) {
    const users = await this.authRepository.findUsersByEmail(email);
    const usableUsers = users.filter((user) => !user.isDeleted && user.isActive);

    if (usableUsers.length === 1) {
      return usableUsers[0];
    }

    const systemUser = usableUsers.find((user) => !user.tenantId && user.role === Role.SYSTEM_ADMIN);

    if (systemUser && usableUsers.length === 1) {
      return systemUser;
    }

    if (usableUsers.length > 1) {
      throw new ApiError(HTTP_STATUS.CONFLICT, 'Multiple accounts found for this email');
    }

    return null;
  }

  async me(userId?: string): Promise<UserResponse> {
    if (!userId) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Authorization token is required');
    }

    const user = await this.authRepository.findUserById(userId);

    if (!user || user.isDeleted || !user.isActive) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'User session is no longer active');
    }

    const { password: _password, ...safeUser } = user;
    return safeUser;
  }

  private async verifyOtp(tenantId: string, phone: string, otp: string): Promise<void> {
    const record = await this.authRepository.findLatestOtp(tenantId, phone);

    if (!record || new Date(record.expiresAt).getTime() < Date.now()) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'OTP is invalid or expired');
    }

    if (record.attempts >= 5) {
      throw new ApiError(HTTP_STATUS.TOO_MANY_REQUESTS, 'OTP verification attempts exceeded');
    }

    if (record.codeHash !== this.hashOtp(phone, otp)) {
      await this.authRepository.updateOtp(record._id, { attempts: record.attempts + 1 });
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'OTP is invalid or expired');
    }

    await this.authRepository.updateOtp(record._id, { consumedAt: new Date() });
  }

  private hashOtp(phone: string, otp: string): string {
    return createHash('sha256').update(`${phone}:${otp}:${env.JWT_ACCESS_SECRET}`).digest('hex');
  }

  private normalizePhone(phone: string): string {
    const normalized = phone.replace(/[\s()-]/g, '');

    if (!/^\+\d{7,15}$/.test(normalized)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Phone number must include a valid country code');
    }

    return normalized;
  }

  private splitName(name: string): { firstName: string; lastName: string } {
    const parts = name.trim().split(/\s+/);
    const firstName = parts.shift() || '';
    return { firstName, lastName: parts.join(' ') || firstName };
  }
}
