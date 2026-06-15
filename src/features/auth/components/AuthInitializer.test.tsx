import { configureStore } from '@reduxjs/toolkit';
import { render, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { vi } from 'vitest';

import { authApi } from '@features/auth/api/authApi';
import { AuthInitializer } from '@features/auth/components/AuthInitializer';
import { tokenService } from '@services/auth/token.service';
import { rootReducer } from '@store/rootReducer';

describe('AuthInitializer', () => {
  beforeEach(() => {
    tokenService.clear();
    vi.restoreAllMocks();
  });

  it('restores the current user from an existing token', async () => {
    const store = configureStore({ reducer: rootReducer });
    tokenService.setAccessToken('session-token');
    vi.spyOn(authApi, 'getCurrentUser').mockResolvedValue({
      data: {
        email: 'customer@example.com',
        firstName: 'Demo',
        id: 'user-1',
        lastName: 'Customer',
        role: 'customer',
        tenantId: 'tenant-fixed-test-id',
      },
      message: 'Current user fetched',
    });

    render(
      <Provider store={store}>
        <AuthInitializer>
          <div>Storefront</div>
        </AuthInitializer>
      </Provider>,
    );

    await waitFor(() => expect(store.getState().auth.isAuthenticated).toBe(true));
    expect(store.getState().auth.user?.id).toBe('user-1');
  });

  it('clears an expired session', async () => {
    const store = configureStore({ reducer: rootReducer });
    tokenService.setAccessToken('expired-token', true);
    vi.spyOn(authApi, 'getCurrentUser').mockRejectedValue(new Error('Expired'));

    render(
      <Provider store={store}>
        <AuthInitializer>
          <div>Storefront</div>
        </AuthInitializer>
      </Provider>,
    );

    await waitFor(() => expect(store.getState().auth.isInitializing).toBe(false));
    expect(tokenService.getAccessToken()).toBeNull();
    expect(store.getState().auth.isAuthenticated).toBe(false);
  });
});
