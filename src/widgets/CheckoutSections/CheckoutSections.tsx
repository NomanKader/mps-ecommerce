import { Card, CardContent, Grid, Stack, Typography } from '@mui/material';

import { AppButton } from '@shared/components/ui/Button/AppButton';
import { AppTextField } from '@shared/components/ui/Input/AppTextField';
import { formatCurrency } from '@utils/formatCurrency';

export type CheckoutForm = {
  addressLine1: string;
  addressLine2: string;
  city: string;
  email: string;
  fullName: string;
  phone: string;
};

type CheckoutSectionsProps = {
  currency: string;
  form: CheckoutForm;
  isSubmitting?: boolean;
  onChange: (field: keyof CheckoutForm, value: string) => void;
  onSubmit: () => void;
  totalAmount: number;
};

export const CheckoutSections = ({
  currency,
  form,
  isSubmitting,
  onChange,
  onSubmit,
  totalAmount,
}: CheckoutSectionsProps) => (
  <Grid container spacing={3}>
    <Grid size={{ md: 6, xs: 12 }}>
      <Card sx={{ borderRadius: 1 }}>
        <CardContent sx={{ display: 'grid', gap: 2 }}>
          <Typography variant="h6">Customer Details</Typography>
          <AppTextField
            label="Full Name"
            onChange={(event) => onChange('fullName', event.target.value)}
            required
            value={form.fullName}
          />
          <AppTextField
            label="Email"
            onChange={(event) => onChange('email', event.target.value)}
            type="email"
            value={form.email}
          />
          <AppTextField
            label="Phone"
            onChange={(event) => onChange('phone', event.target.value)}
            value={form.phone}
          />
        </CardContent>
      </Card>
    </Grid>
    <Grid size={{ md: 6, xs: 12 }}>
      <Card sx={{ borderRadius: 1 }}>
        <CardContent sx={{ display: 'grid', gap: 2 }}>
          <Typography variant="h6">Delivery Address</Typography>
          <AppTextField
            label="Address Line 1"
            onChange={(event) => onChange('addressLine1', event.target.value)}
            required
            value={form.addressLine1}
          />
          <AppTextField
            label="Address Line 2"
            onChange={(event) => onChange('addressLine2', event.target.value)}
            value={form.addressLine2}
          />
          <Stack direction={{ sm: 'row', xs: 'column' }} spacing={2}>
            <AppTextField
              label="City"
              onChange={(event) => onChange('city', event.target.value)}
              value={form.city}
            />
            <AppTextField
              disabled
              label="Order total"
              value={formatCurrency(totalAmount, currency)}
            />
          </Stack>
          <AppButton disabled={isSubmitting} onClick={onSubmit}>
            {isSubmitting ? 'Placing order...' : 'Place order'}
          </AppButton>
        </CardContent>
      </Card>
    </Grid>
  </Grid>
);
