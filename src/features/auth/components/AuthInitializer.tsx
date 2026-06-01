import { useEffect, type ReactNode } from 'react';

import { authApi } from '@features/auth/api/authApi';
import { tokenService } from '@services/auth/token.service';
import { useAppDispatch } from '@store/hooks';
import { clearSession, finishInitialization, setSession } from '@store/slices/auth.slice';

export const AuthInitializer = ({ children }: { children: ReactNode }) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    let active = true;

    const clearStoredSession = () => {
      tokenService.clear();
      dispatch(clearSession());
    };

    const refreshSession = async () => {
      const accessToken = tokenService.getAccessToken();

      if (!accessToken) {
        dispatch(finishInitialization());
        return;
      }

      try {
        const result = await authApi.getCurrentUser();

        if (active) {
          dispatch(setSession({ accessToken, user: result.data }));
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
