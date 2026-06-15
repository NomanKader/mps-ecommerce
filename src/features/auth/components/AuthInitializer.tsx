import { useEffect, type ReactNode } from 'react';

import { authApi } from '@features/auth/api/authApi';
import { isKnownRole } from '@features/auth/utils/auth.utils';
import { authService } from '@services/auth/auth.service';
import { tokenService } from '@services/auth/token.service';
import { tenantService } from '@services/tenant/tenant.service';
import { useAppDispatch } from '@store/hooks';
import { clearSession, finishInitialization, setSession } from '@store/slices/auth.slice';

export const AuthInitializer = ({ children }: { children: ReactNode }) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    let active = true;

    const clearStoredSession = () => {
      authService.signOut();
      dispatch(clearSession());
    };

    const refreshSession = async () => {
      tenantService.initializeDefaultTenantContext();
      const accessToken = tokenService.getAccessToken();

      if (!accessToken) {
        tenantService.resetToDefaultTenantContext();
        dispatch(finishInitialization());
        return;
      }

      try {
        const result = await authApi.getCurrentUser();

        if (active) {
          if (!isKnownRole(result.data.role)) {
            clearStoredSession();
            return;
          }

          dispatch(setSession({ accessToken, user: result.data }));
          authService.setAuthenticatedSession(
            accessToken,
            result.data,
            tokenService.wasRemembered(),
          );
        }
      } catch {
        if (active) {
          clearStoredSession();
        }
      }
    };

    window.addEventListener('auth:unauthorized', clearStoredSession);
    void refreshSession();

    return () => {
      active = false;
      window.removeEventListener('auth:unauthorized', clearStoredSession);
    };
  }, [dispatch]);

  return children;
};
