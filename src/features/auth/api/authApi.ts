import { endpoints } from '@shared/api/endpoints';

import type { AuthSession, LoginPayload } from '@features/auth/types/auth.types';

export const authApi = {
  async login(payload: LoginPayload): Promise<AuthSession> {
    void endpoints.auth.login;

    return Promise.resolve({
      accessToken: `demo-token-${payload.email}`,
      user: {
        email: payload.email,
        firstName: 'Demo',
        id: 'usr-1',
        lastName: 'User',
        role: 'tenant_admin',
        tenantId: 'tenant-demo',
      },
    });
  },
};
