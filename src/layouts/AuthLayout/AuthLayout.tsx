import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import { Box, Paper, Stack, Typography } from '@mui/material';
import { Outlet } from 'react-router-dom';

export const AuthLayout = () => (
  <Box
    sx={{
      alignItems: 'center',
      background:
        'radial-gradient(circle at top left, rgba(247,166,0,0.18), transparent 24%), linear-gradient(180deg, #f4f7f5, #e7efe9)',
      display: 'grid',
      minHeight: '100vh',
      p: 3,
    }}
  >
    <Paper elevation={0} sx={{ borderRadius: 6, maxWidth: 480, p: 4, width: '100%' }}>
      <Stack spacing={2} sx={{ alignItems: 'center', mb: 4 }}>
        <StorefrontOutlinedIcon color="primary" sx={{ fontSize: 36 }} />
        <Typography variant="h4">Welcome back</Typography>
        <Typography color="text.secondary" sx={{ textAlign: 'center' }} variant="body2">
          Enterprise-ready authentication shell prepared for SaaS onboarding and tenant-aware
          access control.
        </Typography>
      </Stack>
      <Outlet />
    </Paper>
  </Box>
);
