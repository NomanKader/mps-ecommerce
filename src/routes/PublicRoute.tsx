import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

import { routePaths } from '@routes/routePaths';
import type { RootState } from '@store/index';

export const PublicRoute = () => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  if (!isAuthenticated) {
    return <Outlet />;
  }

  const redirectTo =
    user?.role === 'tenant_admin' || user?.role === 'staff' || user?.role === 'super_admin'
      ? routePaths.tenantAdmin.dashboard
      : routePaths.account;

  return <Navigate replace to={redirectTo} />;
};
