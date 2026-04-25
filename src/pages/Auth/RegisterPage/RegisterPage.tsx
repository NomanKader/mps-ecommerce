import { Stack, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

import { AppButton } from '@shared/components/ui/Button/AppButton';
import { AppTextField } from '@shared/components/ui/Input/AppTextField';
import { routePaths } from '@routes/routePaths';

export const RegisterPage = () => (
  <Stack spacing={2.5}>
    <AppTextField label="Business Name" />
    <AppTextField label="Work Email" />
    <AppTextField label="Password" type="password" />
    <AppButton>Create Account</AppButton>
    <Typography color="text.secondary" variant="body2">
      Already registered? <Link to={routePaths.auth.login}>Sign in</Link>
    </Typography>
  </Stack>
);
