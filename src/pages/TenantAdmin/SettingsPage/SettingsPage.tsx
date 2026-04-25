import { Card, CardContent, Grid, Typography } from '@mui/material';

import { PageSection } from '@shared/components/ui/SectionTitle/PageSection';

export const SettingsPage = () => (
  <PageSection
    description="Tenant settings are structured for branding, domains, billing preferences, permissions, and operational policies."
    title="Settings"
  >
    <Grid container spacing={3}>
      <Grid size={{ md: 6, xs: 12 }}>
        <Card sx={{ borderRadius: 4 }}>
          <CardContent>
            <Typography variant="h6">Branding</Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }} variant="body2">
              Theme overrides, custom palettes, typography, and logos belong here.
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid size={{ md: 6, xs: 12 }}>
        <Card sx={{ borderRadius: 4 }}>
          <CardContent>
            <Typography variant="h6">Permissions</Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }} variant="body2">
              Future RBAC policies for super admins, tenant admins, staff, and customers can be added cleanly.
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  </PageSection>
);
