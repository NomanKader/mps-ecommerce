import { configureStore } from '@reduxjs/toolkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

import { authApi } from '@features/auth/api/authApi';
import { useRegister } from '@features/auth/hooks/useRegister';
import { tokenService } from '@services/auth/token.service';
import { rootReducer } from '@store/rootReducer';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false }, queries: { retry: false } },
  });
  const store = configureStore({ reducer: rootReducer });

  return ({ children }: { children: ReactNode }) => (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>{children}</MemoryRouter>
      </QueryClientProvider>
    </Provider>
  );
};

describe('useRegister', () => {
  beforeEach(() => {
    tokenService.clear();
    vi.restoreAllMocks();
  });

  it('rejects invalid phones before requesting an OTP', () => {
    const requestOtp = vi.spyOn(authApi, 'requestOtp');
    const { result } = renderHook(() => useRegister(), { wrapper: createWrapper() });

    act(() => {
      result.current.setPhone('123');
      result.current.requestOtp();
    });

    expect(requestOtp).not.toHaveBeenCalled();
    expect(result.current.getFieldState('phone').error?.message).toBe(
      'Enter a valid international phone number',
    );
  });

  it('starts an OTP countdown after a successful request', async () => {
    vi.spyOn(authApi, 'requestOtp').mockResolvedValue({
      data: { expiresInSeconds: 2 },
      message: 'Verification OTP created',
    });
    const { result } = renderHook(() => useRegister(), { wrapper: createWrapper() });

    act(() => {
      result.current.setPhone('+959123456789');
    });
    act(() => {
      result.current.requestOtp();
    });

    await waitFor(() => expect(result.current.otpSecondsRemaining).toBe(2));
    await waitFor(() => expect(result.current.otpSecondsRemaining).toBe(1), { timeout: 1500 });
  });

  it('stores successful registrations in sessionStorage by default', async () => {
    vi.spyOn(authApi, 'requestOtp').mockResolvedValue({
      data: { expiresInSeconds: 300 },
      message: 'Verification OTP created',
    });
    vi.spyOn(authApi, 'register').mockResolvedValue({
      data: {
        accessToken: 'registered-token',
        user: {
          email: 'customer@example.com',
          firstName: 'Demo',
          id: 'user-1',
          lastName: 'Customer',
          role: 'customer',
          tenantId: 'av',
        },
      },
      message: 'User registered',
    });
    const { result } = renderHook(() => useRegister(), { wrapper: createWrapper() });

    act(() => {
      result.current.setPhone('+959123456789');
    });
    await waitFor(() => expect(result.current.canRequestOtp).toBe(true));
    act(() => {
      result.current.requestOtp();
    });
    await waitFor(() => expect(result.current.isOtpRequested).toBe(true));

    act(() => {
      result.current.setValue('name', 'Demo Customer');
      result.current.setValue('email', 'customer@example.com');
      result.current.setValue('otp', '123456');
      result.current.setValue('password', 'password123');
    });
    await act(async () => {
      await result.current.onSubmit();
    });

    await waitFor(() =>
      expect(window.sessionStorage.getItem('avs_access_token')).toBe('registered-token'),
    );
    expect(window.localStorage.getItem('avs_access_token')).toBeNull();
  });
});
