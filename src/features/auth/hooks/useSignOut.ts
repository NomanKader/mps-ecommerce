import { useCallback } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

import { queryClient } from '@app/providers/query-client/queryClient';
import { authApi } from '@features/auth/api/authApi';
import { routePaths } from '@routes/routePaths';
import { tokenService } from '@services/auth/token.service';
import { useAppDispatch } from '@store/hooks';
import { clearSession } from '@store/slices/auth.slice';

export const useSignOut = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  return useCallback(async () => {
    try {
      if (tokenService.getAccessToken()) {
        await authApi.logout();
      }
    } catch {
      // Stateless logout still completes locally when the API is unavailable.
    } finally {
      tokenService.clear();
      dispatch(clearSession());
      queryClient.clear();
      toast.success('Signed out');
      void navigate(routePaths.home);
    }
  }, [dispatch, navigate]);
};
