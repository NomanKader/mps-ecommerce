import { vi } from 'vitest';

import { authApi } from '@features/auth/api/authApi';
import { apiClient } from '@shared/api/axios';
import { endpoints } from '@shared/api/endpoints';

vi.mock('@shared/api/axios', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe('authApi', () => {
  const sessionResponse = {
    data: {
      data: {
        accessToken: 'access-token',
        user: {
          _id: 'user-1',
          email: 'customer@example.com',
          firstName: 'Demo',
          lastName: 'Customer',
          role: 'customer' as const,
        },
      },
      message: 'User authenticated',
      success: true,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('sends the normalized phone payload when requesting an OTP', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({
      data: {
        data: { developmentOtp: '123456', expiresInSeconds: 300 },
        message: 'Verification OTP created',
        success: true,
      },
    });

    await authApi.requestOtp({ phone: '+959123456789' });

    expect(apiClient.post).toHaveBeenCalledWith(endpoints.auth.requestOtp, {
      phone: '+959123456789',
    });
  });

  it('maps the backend user id while restoring a session', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: {
        data: {
          _id: 'user-1',
          email: 'customer@example.com',
          firstName: 'Demo',
          lastName: 'Customer',
          role: 'customer',
        },
        message: 'Current user fetched',
        success: true,
      },
    });

    const result = await authApi.getCurrentUser();

    expect(apiClient.get).toHaveBeenCalledWith(endpoints.auth.me);
    expect(result.data.id).toBe('user-1');
  });

  it('forwards remember-me when signing in', async () => {
    vi.mocked(apiClient.post).mockResolvedValue(sessionResponse);

    await authApi.login({
      email: 'customer@example.com',
      password: 'password123',
      rememberMe: true,
    });

    expect(apiClient.post).toHaveBeenCalledWith(endpoints.auth.login, {
      email: 'customer@example.com',
      password: 'password123',
      rememberMe: true,
    });
  });

  it('submits registration without a frontend-selected role', async () => {
    vi.mocked(apiClient.post).mockResolvedValue(sessionResponse);
    const payload = {
      email: 'customer@example.com',
      name: 'Demo Customer',
      otp: '123456',
      password: 'password123',
      phone: '+959123456789',
    };

    await authApi.register(payload);

    expect(apiClient.post).toHaveBeenCalledWith(endpoints.auth.register, payload);
  });
});
