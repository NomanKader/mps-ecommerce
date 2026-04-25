import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

import { routePaths } from '@routes/routePaths';
import type { RootState } from '@store/index';

export const PublicRoute = () => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  return isAuthenticated ? <Navigate replace to={routePaths.account} /> : <Outlet />;
};
