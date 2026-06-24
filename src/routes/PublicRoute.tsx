import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

import { routePaths } from '@routes/routePaths';
import { AppLoader } from '@shared/components/ui/Loader/AppLoader';
import type { RootState } from '@store/index';

export const PublicRoute = () => {
  const { isAuthenticated, isInitializing, user } = useSelector((state: RootState) => state.auth);

  if (isInitializing) {
    return <AppLoader label="Restoring your session" />;
  }

  if (!isAuthenticated) {
    return <Outlet />;
  }

  const redirectTo =
    user?.role === 'tenant_admin'
      ? routePaths.tenantAdmin.dashboard
      : user?.role === 'customer'
        ? routePaths.home
        : routePaths.home;

  return <Navigate replace to={redirectTo} />;
};
