import AddLocationAltOutlinedIcon from '@mui/icons-material/AddLocationAltOutlined';
import {
  Alert,
  Box,
  Card,
  CardContent,
  Checkbox,
  Divider,
  FormControlLabel,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import type { AddressLabel, CustomerAddress } from '@entities/address/types/address.types';
import type { MyanmarLocationOption } from '@entities/location/types/location.types';
import type { DeliveryQuote } from '@features/order/api/orderApi';
import { AppButton } from '@shared/components/ui/Button/AppButton';
import { AppTextField } from '@shared/components/ui/Input/AppTextField';
import { formatCurrency } from '@utils/formatCurrency';

export type CheckoutForm = {
  addressLine1: string;
  addressLine2: string;
  city: string;
  deliveryInstructions: string;
  email: string;
  fullName: string;
  isDefault: boolean;
  label: AddressLabel;
  landmark: string;
  phone: string;
  region: string;
  township: string;
};

type CheckoutSectionsProps = {
  addresses: CustomerAddress[];
  currency: string;
  deliveryQuote?: DeliveryQuote;
  deliveryQuoteError?: string;
  form: CheckoutForm;
  isAddingAddress: boolean;
  isLoadingAddresses?: boolean;
  isLoadingDeliveryQuote?: boolean;
  isSubmitting?: boolean;
  locations: MyanmarLocationOption[];
  onAddAddress: () => void;
  onCancelAddAddress: () => void;
  onChange: <TKey extends keyof CheckoutForm>(field: TKey, value: CheckoutForm[TKey]) => void;
  onSelectAddress: (addressId: string) => void;
  onSubmit: () => void;
  selectedAddressId: string;
  subtotalAmount: number;
};

const addressSummary = (address: CustomerAddress) =>
  [address.addressLine1, address.addressLine2, address.city, address.township, address.region]
    .filter(Boolean)
    .join(', ');

export const CheckoutSections = ({
  addresses,
  currency,
  deliveryQuote,
  deliveryQuoteError,
  form,
  isAddingAddress,
  isLoadingAddresses,
  isLoadingDeliveryQuote,
  isSubmitting,
  locations,
  onAddAddress,
  onCancelAddAddress,
  onChange,
  onSelectAddress,
  onSubmit,
  selectedAddressId,
  subtotalAmount,
}: CheckoutSectionsProps) => {
  const selectedRegion = locations.find((location) => location.region === form.region);
  const cityOptions = selectedRegion?.cities.map((city) => city.name) ?? [];
  const selectedCity = selectedRegion?.cities.find((city) => city.name === form.city);
  const townshipOptions = selectedCity?.townships.length
    ? selectedCity.townships
    : (selectedRegion?.townships ?? []);

  return (
    <Grid container spacing={3}>
      <Grid size={{ md: 5, xs: 12 }}>
        <Card sx={{ borderRadius: 1, height: '100%' }}>
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
              required
              value={form.phone}
            />
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ md: 7, xs: 12 }}>
        <Card sx={{ borderRadius: 1 }}>
          <CardContent sx={{ display: 'grid', gap: 2 }}>
            <Stack
              direction={{ sm: 'row', xs: 'column' }}
              spacing={1}
              sx={{
                alignItems: { sm: 'center', xs: 'stretch' },
                justifyContent: 'space-between',
              }}
            >
              <Typography variant="h6">Delivery Address</Typography>
              {addresses.length && !isAddingAddress ? (
                <AppButton onClick={onAddAddress} startIcon={<AddLocationAltOutlinedIcon />}>
                  Add new address
                </AppButton>
              ) : null}
            </Stack>

            {isLoadingAddresses ? <Alert severity="info">Loading your saved addresses…</Alert> : null}

            {addresses.length && !isAddingAddress ? (
              <>
                <TextField
                  label="Saved address"
                  onChange={(event) => onSelectAddress(event.target.value)}
                  select
                  value={selectedAddressId}
                >
                  {addresses.map((address) => (
                    <MenuItem key={address.id} value={address.id}>
                      {address.label.toUpperCase()}
                      {address.isDefault ? ' · Default' : ''} — {addressSummary(address)}
                    </MenuItem>
                  ))}
                </TextField>
                <Alert severity="success">
                  This saved address will be used for the order. Select another one or add a new
                  address to change it.
                </Alert>
              </>
            ) : (
              <>
                {!addresses.length ? (
                  <Alert severity="info">
                    You do not have a saved address. Complete the required fields below; this
                    address will be saved to your account.
                  </Alert>
                ) : null}
                <TextField
                  label="Address label"
                  onChange={(event) =>
                    onChange('label', event.target.value as CheckoutForm['label'])
                  }
                  select
                  value={form.label}
                >
                  <MenuItem value="home">Home</MenuItem>
                  <MenuItem value="work">Work</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </TextField>
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
                <Grid container spacing={2}>
                  <Grid size={{ sm: 6, xs: 12 }}>
                    <TextField
                      fullWidth
                      label="Region / State"
                      onChange={(event) => {
                        onChange('region', event.target.value);
                        onChange('city', '');
                        onChange('township', '');
                      }}
                      required
                      select
                      value={form.region}
                    >
                      {locations.map((location) => (
                        <MenuItem key={location.region} value={location.region}>
                          {location.region}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid size={{ sm: 6, xs: 12 }}>
                    <TextField
                      disabled={!form.region}
                      fullWidth
                      label="City"
                      onChange={(event) => {
                        onChange('city', event.target.value);
                        onChange('township', '');
                      }}
                      required
                      select={cityOptions.length > 0}
                      value={form.city}
                    >
                      {cityOptions.map((city) => (
                        <MenuItem key={city} value={city}>
                          {city}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid size={{ sm: 6, xs: 12 }}>
                    <TextField
                      disabled={!form.region}
                      fullWidth
                      label="Township"
                      onChange={(event) => onChange('township', event.target.value)}
                      required
                      select={townshipOptions.length > 0}
                      value={form.township}
                    >
                      {townshipOptions.map((township) => (
                        <MenuItem key={township} value={township}>
                          {township}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid size={{ sm: 6, xs: 12 }}>
                    <AppTextField
                      label="Landmark"
                      onChange={(event) => onChange('landmark', event.target.value)}
                      value={form.landmark}
                    />
                  </Grid>
                </Grid>
                <AppTextField
                  label="Delivery Instructions"
                  multiline
                  onChange={(event) => onChange('deliveryInstructions', event.target.value)}
                  value={form.deliveryInstructions}
                />
                {addresses.length ? (
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={form.isDefault}
                        onChange={(event) => onChange('isDefault', event.target.checked)}
                      />
                    }
                    label="Make this my default address"
                  />
                ) : null}
                {addresses.length ? (
                  <AppButton onClick={onCancelAddAddress} variant="outlined">
                    Use saved address
                  </AppButton>
                ) : null}
              </>
            )}

            <Divider />
            <Stack spacing={1.15}>
              <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                <Typography color="text.secondary">Items subtotal</Typography>
                <Typography>{formatCurrency(subtotalAmount, currency)}</Typography>
              </Stack>
              <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary">Delivery charge</Typography>
                  {deliveryQuote?.eta ? (
                    <Typography color="text.secondary" variant="caption">
                      Estimated delivery: {deliveryQuote.eta}
                    </Typography>
                  ) : null}
                </Box>
                <Typography>
                  {isLoadingDeliveryQuote
                    ? 'Calculating…'
                    : deliveryQuote
                      ? deliveryQuote.freeDeliveryApplied
                        ? 'Free'
                        : formatCurrency(deliveryQuote.deliveryFee, currency)
                      : 'Select address'}
                </Typography>
              </Stack>
              <Divider />
              <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                <Typography sx={{ fontWeight: 900 }}>Total payable</Typography>
                <Typography sx={{ fontWeight: 900 }}>
                  {formatCurrency(deliveryQuote?.totalAmount ?? subtotalAmount, currency)}
                </Typography>
              </Stack>
            </Stack>
            {deliveryQuoteError ? <Alert severity="error">{deliveryQuoteError}</Alert> : null}
            <AppButton
              disabled={
                isSubmitting ||
                isLoadingAddresses ||
                isLoadingDeliveryQuote ||
                Boolean(deliveryQuoteError)
              }
              onClick={onSubmit}
            >
              {isSubmitting ? 'Placing order...' : 'Place order'}
            </AppButton>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};
