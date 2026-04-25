import { Card, CardContent, Grid, Stack, Typography } from '@mui/material';

import { DashboardCards } from '@widgets/DashboardCards/DashboardCards';
import { PageSection } from '@shared/components/ui/SectionTitle/PageSection';

export const DashboardPage = () => (
  <Stack spacing={4}>
    <PageSection
      description="Tenant admin overview prepared for analytics, subscriptions, inventory alerts, and operational KPIs."
      title="Tenant Dashboard"
    >
      <DashboardCards />
    </PageSection>
    <Grid container spacing={3}>
      <Grid size={{ md: 6, xs: 12 }}>
        <Card sx={{ borderRadius: 4 }}>
          <CardContent>
            <Typography variant="h6">Subscription Readiness</Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }} variant="body2">
              Plan management, billing events, and feature entitlements can plug into this tenant
              area without changing the routing model.
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid size={{ md: 6, xs: 12 }}>
        <Card sx={{ borderRadius: 4 }}>
          <CardContent>
            <Typography variant="h6">Branding Overrides</Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }} variant="body2">
              Theme tokens and tenant branding are structured for per-tenant overrides later.
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  </Stack>
);
