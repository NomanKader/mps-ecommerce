import request from 'supertest';

import { Role } from '@common/enums/role.enum';
import { generateAccessToken } from '@utils/jwt';

import { app } from '../../app';

const tokenFor = (role: Role, tenantId?: string): string =>
  generateAccessToken({
    sub: 'test-user-id',
    role,
    tenantId
  });

describe('Tenant admin routes', () => {
  it('requires authentication for admin category routes', async () => {
    const response = await request(app).get('/api/v1/admin/categories').set('x-tenant-id', 'av');

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Authorization token is required');
  });

  it('requires tenant context in the tenant admin token', async () => {
    const response = await request(app)
      .get('/api/v1/admin/categories')
      .set('Authorization', `Bearer ${tokenFor(Role.TENANT_ADMIN)}`);

    expect(response.status).toBe(403);
    expect(response.body.message).toBe('Tenant context is required');
  });

  it('uses token tenant context instead of requiring x-tenant-id', async () => {
    const response = await request(app)
      .put('/api/v1/admin/profile')
      .set('Authorization', `Bearer ${tokenFor(Role.TENANT_ADMIN, 'av')}`)
      .set('x-tenant-id', 'demo')
      .send({});

    expect(response.status).toBe(400);
    expect(response.status).not.toBe(403);
    expect(response.body.message).toBe('Validation failed');
  });

  it('rejects tenant admin creation by non-system-admin users', async () => {
    const response = await request(app)
      .post('/api/v1/tenants/demo/admins')
      .set('Authorization', `Bearer ${tokenFor(Role.TENANT_ADMIN)}`)
      .send({
        email: 'admin@example.com',
        firstName: 'Tenant',
        lastName: 'Admin',
        password: 'password123'
      });

    expect(response.status).toBe(403);
    expect(response.body.message).toBe('Insufficient permissions');
  });

  it('validates tenant admin creation payloads', async () => {
    const response = await request(app)
      .post('/api/v1/tenants/demo/admins')
      .set('Authorization', `Bearer ${tokenFor(Role.SYSTEM_ADMIN)}`)
      .send({
        email: 'not-an-email',
        firstName: 'T',
        lastName: 'Admin',
        password: 'short'
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Validation failed');
  });

  it('requires a tenant slug for body-based tenant admin creation', async () => {
    const response = await request(app)
      .post('/api/v1/tenants/admins')
      .set('Authorization', `Bearer ${tokenFor(Role.SYSTEM_ADMIN)}`)
      .send({
        email: 'admin@example.com',
        firstName: 'Tenant',
        lastName: 'Admin',
        password: 'password123'
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Validation failed');
  });
});
