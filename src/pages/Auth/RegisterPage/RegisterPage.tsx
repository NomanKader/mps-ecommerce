import { Stack, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

import { useRegister } from '@features/auth/hooks/useRegister';
import { AppButton } from '@shared/components/ui/Button/AppButton';
import { AppTextField } from '@shared/components/ui/Input/AppTextField';
import { routePaths } from '@routes/routePaths';

export const RegisterPage = () => {
  const {
    canRequestOtp,
    formState: { errors },
    isOtpRequested,
    isOtpRequesting,
    isRegistering,
    onSubmit,
    register,
    requestOtp,
    setPhone,
  } = useRegister();

  return (
    <form onSubmit={(event) => void onSubmit(event)}>
      <Stack spacing={2.5}>
        <AppTextField
          error={Boolean(errors.name)}
          helperText={errors.name?.message}
          label="Name"
          {...register('name')}
        />
        <AppTextField
          error={Boolean(errors.email)}
          helperText={errors.email?.message}
          label="Email"
          {...register('email')}
        />
        <Stack direction={{ sm: 'row', xs: 'column' }} spacing={1.25}>
          <AppTextField
            error={Boolean(errors.phone)}
            helperText={errors.phone?.message}
            label="Phone"
            {...register('phone', {
              onChange: (event) => setPhone(event.target.value),
            })}
          />
          <AppButton
            disabled={!canRequestOtp || isOtpRequesting}
            onClick={requestOtp}
            type="button"
          >
            {isOtpRequesting
              ? 'Sending...'
              : isOtpRequested
                ? 'OTP Sent'
                : 'Send OTP'}
          </AppButton>
        </Stack>
        <AppTextField
          disabled={!isOtpRequested}
          error={Boolean(errors.otp)}
          helperText={errors.otp?.message}
          label="Verification OTP"
          {...register('otp')}
        />
        <AppTextField
          error={Boolean(errors.password)}
          helperText={errors.password?.message}
          label="Password"
          type="password"
          {...register('password')}
        />
        <AppButton disabled={isRegistering || !isOtpRequested} type="submit">
          Register
        </AppButton>
        <Typography color="text.secondary" variant="body2">
          Already registered? <Link to={routePaths.auth.login}>Sign in</Link>
        </Typography>
      </Stack>
    </form>
  );
};
