import { endpoints } from '@shared/api/endpoints';

import type { AuthSession, LoginPayload } from '@features/auth/types/auth.types';

export const demoAdminCredentials = {
  email: 'admin@demo.com',
  password: 'password123',
};

export const authApi = {
  async login(payload: LoginPayload): Promise<AuthSession> {
    void endpoints.auth.login;

    if (payload.email !== demoAdminCredentials.email || payload.password !== demoAdminCredentials.password) {
      throw new Error('Use the demo admin account to access the dashboard.');
    }

    return Promise.resolve({
      accessToken: `demo-token-${payload.email}`,
      user: {
        email: payload.email,
        firstName: 'MPS',
        id: 'usr-1',
        lastName: 'Admin',
        role: 'tenant_admin',
        tenantId: 'tenant-demo',
      },
    });
  },
};
