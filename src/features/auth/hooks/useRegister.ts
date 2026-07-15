import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

import { authApi } from '@features/auth/api/authApi';
import {
  getAuthenticatedRedirect,
  isValidInternationalPhone,
  normalizeInternationalPhone,
} from '@features/auth/utils/auth.utils';
import { toApiError } from '@shared/api/apiError';
import { registerSchema, type RegisterFormValues } from '@shared/validators/auth.schema';
import { authService } from '@services/auth/auth.service';
import { useAppDispatch } from '@store/hooks';
import { setSession } from '@store/slices/auth.slice';

type UseRegisterOptions = {
  onSuccess?: () => void;
};

export const useRegister = (options?: UseRegisterOptions) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [otpPhone, setOtpPhone] = useState<string | null>(null);
  const [otpSecondsRemaining, setOtpSecondsRemaining] = useState(0);
  const form = useForm<RegisterFormValues>({
    defaultValues: {
      email: '',
      name: '',
      otp: '',
      password: '',
      phone: '',
    },
    resolver: zodResolver(registerSchema),
  });
  const phone = useWatch({ control: form.control, name: 'phone' });
  const normalizedPhone = normalizeInternationalPhone(phone);
  const reset = () => {
    form.reset();
    setOtpPhone(null);
    setOtpSecondsRemaining(0);
  };

  useEffect(() => {
    if (otpSecondsRemaining <= 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setOtpSecondsRemaining((current) => Math.max(current - 1, 0));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [otpSecondsRemaining]);

  const otpMutation = useMutation({
    mutationFn: authApi.requestOtp,
    onSuccess: (result, payload) => {
      setOtpPhone(payload.phone);
      setOtpSecondsRemaining(result.data.expiresInSeconds);
      toast.success(result.message);

      if (result.data.developmentOtp) {
        form.setValue('otp', result.data.developmentOtp, {
          shouldDirty: true,
          shouldValidate: true,
        });
      }
    },
    onError: (error) => {
      toast.error(toApiError(error).message);
    },
  });

  const registerMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: (result) => {
      const session = result.data;
      authService.setAuthenticatedSession(session.accessToken, session.user);
      dispatch(setSession(session));
      reset();
      toast.success(result.message);
      options?.onSuccess?.();
      void navigate(getAuthenticatedRedirect(session.user.role));
    },
    onError: (error) => {
      const apiError = toApiError(error);

      Object.entries(apiError.details ?? {}).forEach(([field, message]) => {
        if (field in form.getValues() && typeof message === 'string') {
          form.setError(field as keyof RegisterFormValues, { message });
        }
      });

      toast.error(apiError.message);
    },
  });

  const requestOtp = () => {
    if (!isValidInternationalPhone(normalizedPhone)) {
      form.setError('phone', { message: 'Enter a valid international phone number' });
      return;
    }

    otpMutation.mutate({ phone: normalizedPhone });
  };

  const setPhone = (value: string) => {
    const nextPhone = normalizeInternationalPhone(value);

    if (otpPhone && nextPhone !== otpPhone) {
      setOtpPhone(null);
      setOtpSecondsRemaining(0);
      form.setValue('otp', '');
    }

    form.setValue('phone', nextPhone, { shouldDirty: true, shouldValidate: true });
  };

  const onSubmit = form.handleSubmit(async (values) => {
    await registerMutation.mutateAsync({
      ...values,
      phone: normalizeInternationalPhone(values.phone),
    });
  });

  return {
    ...form,
    canRequestOtp: isValidInternationalPhone(normalizedPhone) && otpSecondsRemaining === 0,
    isOtpRequested: otpPhone === normalizedPhone,
    isOtpRequesting: otpMutation.isPending,
    isRegistering: registerMutation.isPending,
    onSubmit,
    otpSecondsRemaining,
    requestOtp,
    reset,
    setPhone,
  };
};
