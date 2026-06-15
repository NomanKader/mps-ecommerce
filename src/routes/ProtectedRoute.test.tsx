import { configureStore } from '@reduxjs/toolkit';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { ProtectedRoute } from '@routes/ProtectedRoute';
import { rootReducer } from '@store/rootReducer';
import { setSession } from '@store/slices/auth.slice';

describe('ProtectedRoute', () => {
  it('redirects a customer away from tenant administration routes', () => {
    const store = configureStore({ reducer: rootReducer });
    store.dispatch(
      setSession({
        accessToken: 'customer-token',
        user: {
          email: 'customer@example.com',
          firstName: 'Demo',
          id: 'user-1',
          lastName: 'Customer',
          role: 'customer',
          tenantId: 'tenant-fixed-test-id',
        },
      }),
    );

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/admin/dashboard']}>
          <Routes>
            <Route element={<ProtectedRoute allowedRoles={['tenant_admin']} />}>
              <Route element={<div>Admin dashboard</div>} path="/admin/dashboard" />
            </Route>
            <Route element={<div>Storefront home</div>} path="/" />
          </Routes>
        </MemoryRouter>
      </Provider>,
    );

    expect(screen.getByText('Storefront home')).toBeInTheDocument();
  });
});
