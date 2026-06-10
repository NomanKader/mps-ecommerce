import { Role } from '@common/enums/role.enum';
import { TenantRepository } from '@modules/tenants/tenant.repository';
import { UserRepository } from '@modules/users/user.repository';
import { UserService } from '@modules/users/user.service';
import { comparePassword } from '@utils/password';

const tenant = {
  _id: 'tenant-id',
  name: "AV's Store",
  slug: 'demo',
  status: 'active' as const,
  isDeleted: false,
  createdAt: new Date(),
  updatedAt: new Date()
};

const payload = {
  email: ' ADMIN@EXAMPLE.COM ',
  firstName: 'Tenant',
  lastName: 'Admin',
  password: 'password123'
};

describe('UserService.createTenantAdmin', () => {
  it('creates a tenant-scoped tenant_admin with a hashed password', async () => {
    const userRepository = {
      findOne: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockImplementation(async (user) => ({
        _id: 'user-id',
        isActive: true,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...user
      }))
    } as unknown as UserRepository;
    const tenantRepository = {
      findOne: jest.fn().mockResolvedValue(tenant)
    } as unknown as TenantRepository;
    const service = new UserService(userRepository, tenantRepository);

    const result = await service.createTenantAdmin({ ...payload, tenantSlug: 'demo' });
    const createdUser = (userRepository.create as jest.Mock).mock.calls[0][0];

    expect(tenantRepository.findOne).toHaveBeenCalledWith({ slug: 'demo', isDeleted: { $ne: true } });
    expect(userRepository.findOne).toHaveBeenCalledWith({ tenantId: 'demo', email: 'admin@example.com' });
    expect(createdUser).toMatchObject({
      tenantId: 'demo',
      email: 'admin@example.com',
      firstName: 'Tenant',
      lastName: 'Admin',
      role: Role.TENANT_ADMIN
    });
    expect(await comparePassword(payload.password, createdUser.password)).toBe(true);
    expect(result).not.toHaveProperty('password');
  });

  it('rejects an unknown tenant', async () => {
    const userRepository = {} as UserRepository;
    const tenantRepository = {
      findOne: jest.fn().mockResolvedValue(null)
    } as unknown as TenantRepository;
    const service = new UserService(userRepository, tenantRepository);

    await expect(service.createTenantAdmin({ ...payload, tenantSlug: 'missing' })).rejects.toMatchObject({
      statusCode: 404,
      message: 'Tenant not found'
    });
  });

  it('rejects an email already used in the tenant', async () => {
    const userRepository = {
      findOne: jest.fn().mockResolvedValue({ _id: 'existing-user-id' })
    } as unknown as UserRepository;
    const tenantRepository = {
      findOne: jest.fn().mockResolvedValue(tenant)
    } as unknown as TenantRepository;
    const service = new UserService(userRepository, tenantRepository);

    await expect(service.createTenantAdmin({ ...payload, tenantSlug: 'demo' })).rejects.toMatchObject({
      statusCode: 409,
      message: 'User already exists for this tenant'
    });
  });
});

describe('UserService.createSystemUser', () => {
  it('creates a tenantless system_admin with a hashed password', async () => {
    const userRepository = {
      findOne: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockImplementation(async (user) => ({
        _id: 'system-user-id',
        isActive: true,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...user
      }))
    } as unknown as UserRepository;
    const service = new UserService(userRepository);

    const result = await service.createSystemUser({
      email: ' SYSTEM.ADMIN@EXAMPLE.COM ',
      firstName: 'System',
      lastName: 'Admin',
      password: 'password123'
    });
    const createdUser = (userRepository.create as jest.Mock).mock.calls[0][0];

    expect(userRepository.findOne).toHaveBeenCalledWith({
      tenantId: { $exists: false },
      email: 'system.admin@example.com'
    });
    expect(createdUser).toMatchObject({
      email: 'system.admin@example.com',
      firstName: 'System',
      lastName: 'Admin',
      role: Role.SYSTEM_ADMIN
    });
    expect(createdUser).not.toHaveProperty('tenantId');
    expect(await comparePassword('password123', createdUser.password)).toBe(true);
    expect(result).not.toHaveProperty('password');
  });

  it('rejects a duplicate system user email', async () => {
    const userRepository = {
      findOne: jest.fn().mockResolvedValue({ _id: 'existing-system-user-id' })
    } as unknown as UserRepository;
    const service = new UserService(userRepository);

    await expect(
      service.createSystemUser({
        email: 'system.admin@example.com',
        firstName: 'System',
        lastName: 'Admin',
        password: 'password123'
      })
    ).rejects.toMatchObject({
      statusCode: 409,
      message: 'System user already exists'
    });
  });
});
