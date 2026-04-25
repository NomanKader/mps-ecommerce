import { Stack, Typography } from '@mui/material';

import { AppButton } from '@shared/components/ui/Button/AppButton';
import { AppTextField } from '@shared/components/ui/Input/AppTextField';

export const ForgotPasswordPage = () => (
  <Stack spacing={2.5}>
    <Typography color="text.secondary" variant="body2">
      Password recovery flow placeholder prepared for future auth provider integration.
    </Typography>
    <AppTextField label="Email" />
    <AppButton>Send Reset Link</AppButton>
  </Stack>
);
