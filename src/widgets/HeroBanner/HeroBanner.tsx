import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import { Box, Chip, Grid, Paper, Stack, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

import { AppButton } from '@shared/components/ui/Button/AppButton';
import { routePaths } from '@routes/routePaths';

export const HeroBanner = () => (
  <Paper
    sx={{
      background:
        'radial-gradient(circle at top left, rgba(255,211,38,0.3), transparent 32%), linear-gradient(135deg, #b71916, #e43224)',
      borderRadius: 6,
      color: '#fff',
      overflow: 'hidden',
      p: { md: 6, xs: 4 },
    }}
  >
    <Grid container spacing={4} sx={{ alignItems: 'center' }}>
      <Grid size={{ md: 7, xs: 12 }}>
        <Stack spacing={3}>
          <Chip
            label="SaaS storefront foundation"
            sx={{ alignSelf: 'flex-start', bgcolor: 'rgba(255,255,255,0.12)', color: '#fff' }}
          />
          <Typography variant="h2">
            Launch modern multi-tenant commerce experiences with a scalable frontend base.
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.8)', maxWidth: 640 }} variant="body1">
            Prepared for product catalogs, tenant branding, RBAC, subscriptions, analytics, and
            enterprise storefront growth without rewriting the foundation.
          </Typography>
          <Stack direction={{ sm: 'row', xs: 'column' }} spacing={2}>
            <Link to={routePaths.catalog}>
              <AppButton endIcon={<ArrowForwardRoundedIcon />}>Browse Catalog</AppButton>
            </Link>
            <Link to={routePaths.tenantAdmin.dashboard}>
              <AppButton
                color="secondary"
                sx={{ '&:hover': { bgcolor: '#eef3f0' }, bgcolor: '#fff', color: 'primary.main' }}
                variant="contained"
              >
                View Tenant Dashboard
              </AppButton>
            </Link>
          </Stack>
        </Stack>
      </Grid>
      <Grid size={{ md: 5, xs: 12 }}>
        <Box
          sx={{
            border: '1px solid rgba(255,255,255,0.16)',
            borderRadius: 5,
            display: 'grid',
            gap: 2,
            p: 3,
          }}
        >
          <Typography variant="subtitle1">Prepared for future expansion</Typography>
          <Typography color="rgba(255,255,255,0.75)" variant="body2">
            Subscription plans, tenant onboarding, custom themes, permissions, and analytics hook
            points are already reflected in the project structure.
          </Typography>
        </Box>
      </Grid>
    </Grid>
  </Paper>
);
