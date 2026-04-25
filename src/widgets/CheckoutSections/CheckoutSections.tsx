import { Card, CardContent, Grid, Stack, Typography } from '@mui/material';

import { AppTextField } from '@shared/components/ui/Input/AppTextField';

export const CheckoutSections = () => (
  <Grid container spacing={3}>
    <Grid size={{ md: 6, xs: 12 }}>
      <Card sx={{ borderRadius: 4 }}>
        <CardContent sx={{ display: 'grid', gap: 2 }}>
          <Typography variant="h6">Customer Details</Typography>
          <AppTextField label="Full Name" />
          <AppTextField label="Email" />
          <AppTextField label="Phone" />
        </CardContent>
      </Card>
    </Grid>
    <Grid size={{ md: 6, xs: 12 }}>
      <Card sx={{ borderRadius: 4 }}>
        <CardContent sx={{ display: 'grid', gap: 2 }}>
          <Typography variant="h6">Delivery Address</Typography>
          <AppTextField label="Address Line 1" />
          <AppTextField label="Address Line 2" />
          <Stack direction={{ sm: 'row', xs: 'column' }} spacing={2}>
            <AppTextField label="City" />
            <AppTextField label="Postal Code" />
          </Stack>
        </CardContent>
      </Card>
    </Grid>
  </Grid>
);
