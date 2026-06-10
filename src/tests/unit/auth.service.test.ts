import { Role } from '@common/enums/role.enum';
import { AuthRepository } from '@modules/auth/auth.repository';
import { AuthService } from '@modules/auth/auth.service';
import { hashPassword } from '@utils/password';

describe('AuthService.login', () => {
  it('resolves a tenant-scoped user by email when no tenant id is provided', async () => {
    const password = await hashPassword('password123');
    const authRepository = {
      findUsersByEmail: jest.fn().mockResolvedValue([
        {
          _id: 'tenant-admin-id',
          tenantId: 'av',
          email: 'tenant.admin@av.com',
          firstName: 'Tenant',
          lastName: 'Admin',
          password,
          role: Role.TENANT_ADMIN,
          isActive: true,
          isDeleted: false,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ])
    } as unknown as AuthRepository;
    const service = new AuthService(authRepository);

    const result = await service.login({
      email: ' TENANT.ADMIN@AV.COM ',
      password: 'password123',
      rememberMe: true
    });

    expect(authRepository.findUsersByEmail).toHaveBeenCalledWith('tenant.admin@av.com');
    expect(result.user).toMatchObject({
      tenantId: 'av',
      email: 'tenant.admin@av.com',
      role: Role.TENANT_ADMIN
    });
    expect(result.accessToken).toBeTruthy();
  });

  it('rejects login when an email maps to multiple active accounts', async () => {
    const password = await hashPassword('password123');
    const authRepository = {
      findUsersByEmail: jest.fn().mockResolvedValue([
        {
          _id: 'first-user-id',
          tenantId: 'av',
          email: 'admin@example.com',
          password,
          role: Role.TENANT_ADMIN,
          isActive: true,
          isDeleted: false
        },
        {
          _id: 'second-user-id',
          tenantId: 'demo',
          email: 'admin@example.com',
          password,
          role: Role.TENANT_ADMIN,
          isActive: true,
          isDeleted: false
        }
      ])
    } as unknown as AuthRepository;
    const service = new AuthService(authRepository);

    await expect(
      service.login({
        email: 'admin@example.com',
        password: 'password123'
      })
    ).rejects.toMatchObject({
      statusCode: 409,
      message: 'Multiple accounts found for this email'
    });
  });
});
