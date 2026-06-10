import { Role } from '@common/enums/role.enum';
import { UserRepository } from '@modules/users/user.repository';
import { User } from '@modules/users/user.types';
import { PhoneOtp, PhoneOtpModel } from '@modules/auth/phone-otp.model';

export class AuthRepository {
  constructor(private readonly userRepository = new UserRepository()) {}

  async findUserByEmail(email: string, tenantId?: string): Promise<User | null> {
    return this.userRepository.findOne({ email, ...(tenantId ? { tenantId } : {}) });
  }

  async findSystemUserByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ email, tenantId: { $exists: false }, role: Role.SYSTEM_ADMIN });
  }

  async findUsersByEmail(email: string): Promise<User[]> {
    return this.userRepository.findManyByEmail(email);
  }

  async findUserByPhone(tenantId: string, phone: string): Promise<User | null> {
    return this.userRepository.findOne({ tenantId, phone });
  }

  async findUserById(id: string): Promise<User | null> {
    return this.userRepository.findOne({ _id: id });
  }

  async createUser(payload: Partial<User>): Promise<User> {
    return this.userRepository.create(payload);
  }

  async findLatestOtp(tenantId: string, phone: string): Promise<PhoneOtp | null> {
    return PhoneOtpModel.findOne({ tenantId, phone, consumedAt: { $exists: false } })
      .sort({ createdAt: -1 })
      .lean<PhoneOtp | null>()
      .exec();
  }

  async createOtp(payload: Partial<PhoneOtp>): Promise<PhoneOtp> {
    const otp = await PhoneOtpModel.create(payload);
    return otp.toObject() as PhoneOtp;
  }

  async updateOtp(id: string, payload: Partial<PhoneOtp>): Promise<void> {
    await PhoneOtpModel.updateOne({ _id: id }, payload).exec();
  }
}
