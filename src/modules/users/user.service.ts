import { Role } from '@common/enums/role.enum';
import { BaseService } from '@core/base/BaseService';
import { HTTP_STATUS } from '@core/response/http-status';
import { TenantRepository } from '@modules/tenants/tenant.repository';
import { UserRepository } from '@modules/users/user.repository';
import { User, UserResponse } from '@modules/users/user.types';
import { ApiError } from '@utils/ApiError';
import { hashPassword } from '@utils/password';
import { Types } from 'mongoose';

type CreateTenantAdminInput = {
  tenantId?: string;
  tenantSlug?: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
};

type CreateSystemUserInput = {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
};

export class UserService extends BaseService {
  constructor(
    private readonly userRepository = new UserRepository(),
    private readonly tenantRepository = new TenantRepository(),
    private readonly tenantUserRepositoryFactory = (tenantDatabaseKey: string): UserRepository =>
      new UserRepository(tenantDatabaseKey)
  ) {
    super();
  }

  async listUsers(tenantId?: string): Promise<UserResponse[]> {
    const users = await (tenantId
      ? new UserRepository(tenantId).find({ tenantId })
      : this.userRepository.find({}));
    return users.map(({ password: _password, ...user }) => user);
  }

  async createUser(payload: Partial<User>): Promise<User> {
    return this.userRepository.create(payload);
  }

  async createSystemUser(payload: CreateSystemUserInput): Promise<UserResponse> {
    const email = payload.email.trim().toLowerCase();

    if (await this.userRepository.findOne({ tenantId: { $exists: false }, email })) {
      throw new ApiError(HTTP_STATUS.CONFLICT, 'System user already exists');
    }

    const user = await this.userRepository.create({
      email,
      firstName: payload.firstName,
      lastName: payload.lastName,
      password: await hashPassword(payload.password),
      role: Role.SYSTEM_ADMIN
    });
    const { password: _password, ...safeUser } = user;

    return safeUser;
  }

  async createTenantAdmin(
    payload: CreateTenantAdminInput,
    routeTenantId?: string
  ): Promise<UserResponse> {
    const tenantIdentifier = (payload.tenantId ?? routeTenantId ?? payload.tenantSlug)?.trim();

    if (!tenantIdentifier) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Tenant id is required');
    }

    const tenant = await this.tenantRepository.findOne({
      isDeleted: { $ne: true },
      $or: [
        { tenantId: tenantIdentifier },
        { slug: tenantIdentifier.toLowerCase() },
        ...(Types.ObjectId.isValid(tenantIdentifier) ? [{ _id: tenantIdentifier }] : [])
      ]
    });

    if (!tenant) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Tenant not found');
    }

    const email = payload.email.trim().toLowerCase();

    const tenantId = tenant.tenantId ?? String(tenant._id);
    const tenantUserRepository = this.tenantUserRepositoryFactory(tenant.slug);

    if (await tenantUserRepository.findOne({ tenantId, email })) {
      throw new ApiError(HTTP_STATUS.CONFLICT, 'User already exists for this tenant');
    }

    const user = await tenantUserRepository.create({
      tenantId,
      email,
      firstName: payload.firstName,
      lastName: payload.lastName,
      password: await hashPassword(payload.password),
      role: Role.TENANT_ADMIN
    });
    const { password: _password, ...safeUser } = user;

    return safeUser;
  }
}
