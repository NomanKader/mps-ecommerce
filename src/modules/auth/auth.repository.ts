import { Role } from '@common/enums/role.enum';
import { getTenantModels, registerTenantDatabaseAlias } from '@core/database/tenant-database';
import { TenantRepository } from '@modules/tenants/tenant.repository';
import { UserRepository } from '@modules/users/user.repository';
import { User } from '@modules/users/user.types';
import { PhoneOtp } from '@modules/auth/phone-otp.model';
import { Types } from 'mongoose';

export class AuthRepository {
  constructor(
    private readonly systemUserRepository = new UserRepository(),
    private readonly tenantRepository = new TenantRepository()
  ) {}

  async findUserByEmail(email: string, tenantId?: string): Promise<User | null> {
    if (!tenantId) return this.findSystemUserByEmail(email);
    return new UserRepository(await this.tenantDatabaseKey(tenantId)).findOne({ email, tenantId });
  }

  async findSystemUserByEmail(email: string): Promise<User | null> {
    return this.systemUserRepository.findOne({
      email,
      tenantId: { $exists: false },
      role: Role.SYSTEM_ADMIN
    });
  }

  async findUsersByEmail(email: string): Promise<User[]> {
    const systemUser = await this.findSystemUserByEmail(email);
    const tenants = await this.tenantRepository.find({ isDeleted: { $ne: true } });
    const tenantUsers = await Promise.all(
      tenants.map((tenant) => {
        const tenantId = tenant.tenantId ?? String(tenant._id);
        return new UserRepository(tenant.slug).find({ email, tenantId });
      })
    );
    return [...(systemUser ? [systemUser] : []), ...tenantUsers.flat()];
  }

  async findUserByPhone(tenantId: string, phone: string): Promise<User | null> {
    return new UserRepository(await this.tenantDatabaseKey(tenantId)).findOne({ tenantId, phone });
  }

  async findUserById(id: string, tenantId?: string): Promise<User | null> {
    if (tenantId)
      return new UserRepository(await this.tenantDatabaseKey(tenantId)).findOne({
        _id: id,
        tenantId
      });
    return this.systemUserRepository.findOne({
      _id: id,
      tenantId: { $exists: false },
      role: Role.SYSTEM_ADMIN
    });
  }

  async createUser(payload: Partial<User>): Promise<User> {
    if (!payload.tenantId) return this.systemUserRepository.create(payload);
    return new UserRepository(await this.tenantDatabaseKey(payload.tenantId)).create(payload);
  }

  async updateUserById(id: string, tenantId: string | undefined, payload: Partial<User>): Promise<User | null> {
    if (!tenantId) return this.systemUserRepository.updateById(id, payload);
    return new UserRepository(await this.tenantDatabaseKey(tenantId)).updateById(id, payload);
  }

  async findLatestOtp(tenantId: string, phone: string): Promise<PhoneOtp | null> {
    const { PhoneOtpModel } = getTenantModels(await this.tenantDatabaseKey(tenantId));
    return PhoneOtpModel.findOne({ tenantId, phone, consumedAt: { $exists: false } })
      .sort({ createdAt: -1 })
      .lean<PhoneOtp | null>()
      .exec();
  }

  async createOtp(payload: Partial<PhoneOtp>): Promise<PhoneOtp> {
    const { PhoneOtpModel } = getTenantModels(
      await this.tenantDatabaseKey(String(payload.tenantId))
    );
    const otp = await PhoneOtpModel.create(payload);
    return otp.toObject() as PhoneOtp;
  }

  async updateOtp(tenantId: string, id: string, payload: Partial<PhoneOtp>): Promise<void> {
    const { PhoneOtpModel } = getTenantModels(await this.tenantDatabaseKey(tenantId));
    await PhoneOtpModel.updateOne({ _id: id }, payload).exec();
  }

  private async tenantDatabaseKey(tenantIdentifier: string): Promise<string> {
    const value = tenantIdentifier.trim();
    const tenant = await this.tenantRepository.findOne({
      isDeleted: { $ne: true },
      $or: [
        { tenantId: value },
        { slug: value.toLowerCase() },
        ...(Types.ObjectId.isValid(value) ? [{ _id: value }] : [])
      ]
    });

    if (!tenant) return value;

    const tenantId = tenant.tenantId ?? String(tenant._id);
    registerTenantDatabaseAlias(tenantId, tenant.slug);
    return tenant.slug;
  }
}
