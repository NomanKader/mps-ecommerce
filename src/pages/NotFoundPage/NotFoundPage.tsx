import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';
import { Stack, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

import { AppButton } from '@shared/components/ui/Button/AppButton';
import { routePaths } from '@routes/routePaths';

export const NotFoundPage = () => (
  <Stack spacing={2} sx={{ alignItems: 'center', py: 12, textAlign: 'center' }}>
    <ReportProblemOutlinedIcon color="warning" sx={{ fontSize: 42 }} />
    <Typography variant="h4">Page not found</Typography>
    <Typography color="text.secondary" variant="body1">
      The route exists in the application shell, but this URL does not match any configured page.
    </Typography>
    <Link to={routePaths.home}>
      <AppButton>Back to Home</AppButton>
    </Link>
  </Stack>
);
