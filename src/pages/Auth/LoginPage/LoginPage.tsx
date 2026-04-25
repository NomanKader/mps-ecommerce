import { Alert, Stack, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

import { useLogin } from '@features/auth/hooks/useLogin';
import { AppButton } from '@shared/components/ui/Button/AppButton';
import { AppTextField } from '@shared/components/ui/Input/AppTextField';
import { routePaths } from '@routes/routePaths';

export const LoginPage = () => {
  const {
    formState: { errors },
    isSubmitting,
    onSubmit,
    register,
  } = useLogin();

  return (
    <form onSubmit={(event) => void onSubmit(event)}>
      <Stack spacing={2.5}>
        <Alert severity="info">Use the prefilled demo credentials to enter the tenant dashboard.</Alert>
        <AppTextField
          error={Boolean(errors.email)}
          helperText={errors.email?.message}
          label="Email"
          {...register('email')}
        />
        <AppTextField
          error={Boolean(errors.password)}
          helperText={errors.password?.message}
          label="Password"
          type="password"
          {...register('password')}
        />
        <AppButton disabled={isSubmitting} type="submit">
          Sign In
        </AppButton>
        <Typography color="text.secondary" variant="body2">
          No account yet? <Link to={routePaths.auth.register}>Create one</Link>
        </Typography>
        <Typography color="text.secondary" variant="body2">
          <Link to={routePaths.auth.forgotPassword}>Forgot password?</Link>
        </Typography>
      </Stack>
    </form>
  );
};
