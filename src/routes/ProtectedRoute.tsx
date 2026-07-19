import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

import { routePaths } from '@routes/routePaths';
import { AppLoader } from '@shared/components/ui/Loader/AppLoader';
import type { RootState } from '@store/index';
import type { Role } from '../types/common';

type ProtectedRouteProps = {
  allowedRoles?: Role[];
};

const lastStorefrontPathKey = 'avs:last-storefront-path';

const getMobileAuthRedirectPath = () => {
  const fallbackPath = sessionStorage.getItem(lastStorefrontPathKey) || routePaths.home;
  const hashSplit = fallbackPath.split('#');
  const pathWithSearch = hashSplit[0] || routePaths.home;
  const hash = hashSplit[1] || '';
  const searchSplit = pathWithSearch.split('?');
  const pathname = searchSplit[0] || routePaths.home;
  const search = searchSplit[1] || '';
  const params = new URLSearchParams(search);

  params.set('auth', 'login');

  return `${pathname || routePaths.home}?${params.toString()}${hash ? `#${hash}` : ''}`;
};

export const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const location = useLocation();
  const { isAuthenticated, isInitializing, user } = useSelector((state: RootState) => state.auth);

  if (isInitializing) {
    return <AppLoader label="Restoring your session" />;
  }

  if (!isAuthenticated) {
    if (window.matchMedia('(max-width: 899px)').matches) {
      return <Navigate replace to={getMobileAuthRedirectPath()} />;
    }

    return <Navigate replace state={{ from: location }} to={routePaths.auth.login} />;
  }

  if (allowedRoles && (!user || !allowedRoles.includes(user.role))) {
    return <Navigate replace to={routePaths.home} />;
  }

  return <Outlet />;
};
