import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useLocation, useNavigate } from 'react-router-dom';

import { authApi } from '@features/auth/api/authApi';
import { getAuthenticatedRedirect } from '@features/auth/utils/auth.utils';
import { toApiError } from '@shared/api/apiError';
import { loginSchema, type LoginFormValues } from '@shared/validators/auth.schema';
import { authService } from '@services/auth/auth.service';
import { useAppDispatch } from '@store/hooks';
import { setSession } from '@store/slices/auth.slice';

type UseLoginOptions = {
  onSuccess?: () => void;
};

export const useLogin = (options?: UseLoginOptions) => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const form = useForm<LoginFormValues>({
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
    resolver: zodResolver(loginSchema),
  });

  const mutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (result) => {
      const session = result.data;
      const rememberMe = form.getValues('rememberMe');
      authService.setAuthenticatedSession(session.accessToken, session.user, rememberMe);
      dispatch(setSession(session));
      form.reset();
      toast.success(result.message);
      options?.onSuccess?.();

      const intendedPath = (location.state as { from?: { pathname?: string } } | null)?.from
        ?.pathname;
      void navigate(intendedPath ?? getAuthenticatedRedirect(session.user.role));
    },
    onError: (error) => {
      toast.error(toApiError(error).message);
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    await mutation.mutateAsync(values);
  });

  return {
    ...form,
    isSubmitting: mutation.isPending,
    onSubmit,
  };
};
