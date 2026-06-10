import { Role } from '@common/enums/role.enum';
import { BaseService } from '@core/base/BaseService';
import { HTTP_STATUS } from '@core/response/http-status';
import { TenantRepository } from '@modules/tenants/tenant.repository';
import { UserRepository } from '@modules/users/user.repository';
import { User, UserResponse } from '@modules/users/user.types';
import { ApiError } from '@utils/ApiError';
import { hashPassword } from '@utils/password';

type CreateTenantAdminInput = {
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
    private readonly tenantRepository = new TenantRepository()
  ) {
    super();
  }

  async listUsers(tenantId?: string): Promise<UserResponse[]> {
    const users = await this.userRepository.find(tenantId ? { tenantId } : {});
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

  async createTenantAdmin(payload: CreateTenantAdminInput, routeTenantSlug?: string): Promise<UserResponse> {
    const tenantSlug = (payload.tenantSlug ?? routeTenantSlug)?.trim().toLowerCase();

    if (!tenantSlug) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Tenant slug is required');
    }

    const tenant = await this.tenantRepository.findOne({ slug: tenantSlug, isDeleted: { $ne: true } });

    if (!tenant) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Tenant not found');
    }

    const email = payload.email.trim().toLowerCase();

    if (await this.userRepository.findOne({ tenantId: tenant.slug, email })) {
      throw new ApiError(HTTP_STATUS.CONFLICT, 'User already exists for this tenant');
    }

    const user = await this.userRepository.create({
      tenantId: tenant.slug,
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
