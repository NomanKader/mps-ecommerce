import { configureStore } from '@reduxjs/toolkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

import { authApi } from '@features/auth/api/authApi';
import { useLogin } from '@features/auth/hooks/useLogin';
import { useSignOut } from '@features/auth/hooks/useSignOut';
import { tokenService } from '@services/auth/token.service';
import { STORAGE_KEYS } from '@shared/constants/app.constants';
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

const authenticatedResult = {
  data: {
    accessToken: 'signed-in-token',
    user: {
      email: 'customer@example.com',
      firstName: 'Demo',
      id: 'user-1',
      lastName: 'Customer',
      role: 'customer' as const,
      tenantId: 'tenant-fixed-test-id',
    },
  },
  message: 'User authenticated',
};

describe('authentication actions', () => {
  beforeEach(() => {
    tokenService.clear();
    vi.restoreAllMocks();
  });

  it('stores remembered sign-ins in localStorage', async () => {
    vi.spyOn(authApi, 'login').mockResolvedValue(authenticatedResult);
    const { result } = renderHook(() => useLogin(), { wrapper: createWrapper() });

    act(() => {
      result.current.setValue('email', 'customer@example.com');
      result.current.setValue('password', 'password123');
      result.current.setValue('rememberMe', true);
    });
    await act(async () => {
      await result.current.onSubmit();
    });

    await waitFor(() =>
      expect(window.localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)).toBe('signed-in-token'),
    );
    expect(window.sessionStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)).toBeNull();
  });

  it('stores non-remembered sign-ins in sessionStorage', async () => {
    vi.spyOn(authApi, 'login').mockResolvedValue(authenticatedResult);
    const { result } = renderHook(() => useLogin(), { wrapper: createWrapper() });

    act(() => {
      result.current.setValue('email', 'customer@example.com');
      result.current.setValue('password', 'password123');
    });
    await act(async () => {
      await result.current.onSubmit();
    });

    await waitFor(() =>
      expect(window.sessionStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)).toBe('signed-in-token'),
    );
    expect(window.localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)).toBeNull();
  });

  it('clears both storage locations when logout fails remotely', async () => {
    window.localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, 'local-token');
    window.sessionStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, 'session-token');
    const logout = vi.spyOn(authApi, 'logout').mockRejectedValue(new Error('Offline'));
    const { result } = renderHook(() => useSignOut(), { wrapper: createWrapper() });

    await act(async () => {
      await result.current();
    });

    expect(logout).toHaveBeenCalledOnce();
    expect(window.localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)).toBeNull();
    expect(window.sessionStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)).toBeNull();
  });
});
