import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

import { routePaths } from '@routes/routePaths';
import { AppLoader } from '@shared/components/ui/Loader/AppLoader';
import type { RootState } from '@store/index';
import type { Role } from '../types/common';

type ProtectedRouteProps = {
  allowedRoles?: Role[];
};

export const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const location = useLocation();
  const { isAuthenticated, isInitializing, user } = useSelector((state: RootState) => state.auth);

  if (isInitializing) {
    return <AppLoader label="Restoring your session" />;
  }

  if (!isAuthenticated) {
    return <Navigate replace state={{ from: location }} to={routePaths.auth.login} />;
  }

  if (allowedRoles && (!user || !allowedRoles.includes(user.role))) {
    return <Navigate replace to={routePaths.home} />;
  }

  return <Outlet />;
};
