import { Role } from '@common/enums/role.enum';
import { BaseService } from '@core/base/BaseService';
import { HTTP_STATUS } from '@core/response/http-status';
import { TenantRepository } from '@modules/tenants/tenant.repository';
import { UserRepository } from '@modules/users/user.repository';
import { DashboardRole, User, UserResponse } from '@modules/users/user.types';
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

type CreateTenantDashboardUserInput = {
  dashboardRole: DashboardRole;
  email: string;
  firstName: string;
  isActive?: boolean;
  lastName: string;
  password: string;
  phone?: string;
};

type UpdateTenantDashboardUserInput = Omit<CreateTenantDashboardUserInput, 'password'> & {
  isActive: boolean;
  password?: string;
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

  async listTenantDashboardUsers(tenantId?: string): Promise<UserResponse[]> {
    const scopedTenant = this.requireTenantId(tenantId);
    const users = await new UserRepository(scopedTenant).findTenantDashboardUsers(scopedTenant);
    return users.map((user) => this.toSafeUser(user));
  }

  async createTenantDashboardUser(
    tenantId: string | undefined,
    payload: CreateTenantDashboardUserInput
  ): Promise<UserResponse> {
    const scopedTenant = this.requireTenantId(tenantId);
    const email = payload.email.trim().toLowerCase();
    const userRepository = new UserRepository(scopedTenant);

    if (await userRepository.findOne({ tenantId: scopedTenant, email, isDeleted: { $ne: true } })) {
      throw new ApiError(HTTP_STATUS.CONFLICT, 'User already exists for this tenant');
    }

    const user = await userRepository.create({
      tenantId: scopedTenant,
      email,
      firstName: payload.firstName.trim(),
      lastName: payload.lastName.trim(),
      phone: payload.phone?.trim() || undefined,
      password: await hashPassword(payload.password),
      role: Role.STAFF,
      dashboardRole: payload.dashboardRole,
      isActive: payload.isActive ?? true
    });

    return this.toSafeUser(user);
  }

  async updateTenantDashboardUser(
    tenantId: string | undefined,
    userId: string,
    actorUserId: string | undefined,
    payload: UpdateTenantDashboardUserInput
  ): Promise<UserResponse> {
    const scopedTenant = this.requireTenantId(tenantId);
    const email = payload.email.trim().toLowerCase();
    const userRepository = new UserRepository(scopedTenant);
    const existingUser = await userRepository.findOne({
      _id: userId,
      tenantId: scopedTenant,
      isDeleted: { $ne: true }
    });

    if (!existingUser || existingUser.role !== Role.STAFF) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'User not found');
    }

    if (existingUser._id.toString() === actorUserId && !payload.isActive) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'You cannot deactivate your own dashboard access');
    }

    const duplicateUser = await userRepository.findOne({
      tenantId: scopedTenant,
      email,
      isDeleted: { $ne: true }
    });

    if (duplicateUser && duplicateUser._id.toString() !== existingUser._id.toString()) {
      throw new ApiError(HTTP_STATUS.CONFLICT, 'User already exists for this tenant');
    }

    const updatePayload: Record<string, unknown> = {
      email,
      firstName: payload.firstName.trim(),
      lastName: payload.lastName.trim(),
      phone: payload.phone?.trim() || undefined,
      dashboardRole: payload.dashboardRole,
      isActive: payload.isActive
    };

    if (payload.password) {
      updatePayload.password = await hashPassword(payload.password);
    }

    const updatedUser = await userRepository.updateById(userId, updatePayload);

    if (!updatedUser) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'User not found');
    }

    return this.toSafeUser(updatedUser);
  }

  async deleteTenantDashboardUser(
    tenantId: string | undefined,
    userId: string,
    actorUserId?: string
  ): Promise<{ id: string }> {
    const scopedTenant = this.requireTenantId(tenantId);
    const userRepository = new UserRepository(scopedTenant);
    const existingUser = await userRepository.findOne({
      _id: userId,
      tenantId: scopedTenant,
      isDeleted: { $ne: true }
    });

    if (!existingUser || existingUser.role !== Role.STAFF) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'User not found');
    }

    if (existingUser._id.toString() === actorUserId) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'You cannot delete your own dashboard access');
    }

    await userRepository.updateOne({ _id: userId, tenantId: scopedTenant }, { isDeleted: true });

    return { id: userId };
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

  private requireTenantId(tenantId?: string): string {
    if (!tenantId) {
      throw new ApiError(HTTP_STATUS.FORBIDDEN, 'Tenant context is required');
    }

    return tenantId;
  }

  private toSafeUser(user: User): UserResponse {
    const { password: _password, ...safeUser } = user;
    return safeUser;
  }
}
