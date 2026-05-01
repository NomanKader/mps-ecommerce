import { endpoints } from '@shared/api/endpoints';

import type { AuthSession, LoginPayload } from '@features/auth/types/auth.types';

export const demoAdminCredentials = {
  email: 'admin@demo.com',
  password: 'password123',
};

export const demoCustomerCredentials = {
  email: 'customer@demo.com',
  password: 'password123',
};

export const authApi = {
  async login(payload: LoginPayload): Promise<AuthSession> {
    void endpoints.auth.login;

    if (payload.email === demoAdminCredentials.email && payload.password === demoAdminCredentials.password) {
      return Promise.resolve({
        accessToken: `demo-token-${payload.email}`,
        user: {
          email: payload.email,
          firstName: "AV's",
          id: 'usr-1',
          lastName: 'Store Admin',
          role: 'tenant_admin',
          tenantId: 'tenant-demo',
        },
      });
    }

    if (payload.email === demoCustomerCredentials.email && payload.password === demoCustomerCredentials.password) {
      return Promise.resolve({
        accessToken: `demo-token-${payload.email}`,
        user: {
          email: payload.email,
          firstName: 'Demo',
          id: 'usr-customer-1',
          lastName: 'Customer',
          role: 'customer',
          tenantId: 'tenant-demo',
        },
      });
    }

    throw new Error('Use a demo account to sign in.');
  },
};
