import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

import { authApi, demoAdminCredentials } from '@features/auth/api/authApi';
import { authService } from '@services/auth/auth.service';
import { useAppDispatch } from '@store/hooks';
import { setSession } from '@store/slices/auth.slice';
import { routePaths } from '@routes/routePaths';
import { loginSchema, type LoginFormValues } from '@shared/validators/auth.schema';

type UseLoginOptions = {
  onSuccess?: () => void;
};

export const useLogin = (options?: UseLoginOptions) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const form = useForm<LoginFormValues>({
    defaultValues: {
      email: demoAdminCredentials.email,
      password: demoAdminCredentials.password,
    },
    resolver: zodResolver(loginSchema),
  });

  const mutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (session) => {
      authService.setAuthenticatedSession(session.accessToken, session.user);
      dispatch(setSession(session));
      toast.success('Signed in successfully');
      options?.onSuccess?.();
      void navigate(routePaths.tenantAdmin.dashboard);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Unable to sign in');
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
