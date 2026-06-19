import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import { Card, CardContent, Divider, Stack, Typography } from '@mui/material';

import type { CartItem } from '@entities/cart/types/cart.types';
import { AppButton } from '@shared/components/ui/Button/AppButton';
import { formatCurrency } from '@utils/formatCurrency';

type CartSummaryProps = {
  items: CartItem[];
};

export const CartSummary = ({ items }: CartSummaryProps) => {
  const subtotal = items.reduce((total, item) => total + item.product.price * item.quantity, 0);

  return (
    <Card sx={{ borderRadius: 1 }}>
      <CardContent sx={{ display: 'grid', gap: 2.5 }}>
        <Typography variant="h6">Order Summary</Typography>
        <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
          <Typography color="text.secondary">Subtotal</Typography>
          <Typography>{formatCurrency(subtotal)}</Typography>
        </Stack>
        <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
          <Typography color="text.secondary">Delivery</Typography>
          <Typography>Calculated at checkout</Typography>
        </Stack>
        <Divider />
        <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
          <Typography sx={{ fontWeight: 700 }}>Estimated Total</Typography>
          <Typography sx={{ fontWeight: 700 }}>{formatCurrency(subtotal)}</Typography>
        </Stack>
        <AppButton startIcon={<LocalShippingOutlinedIcon />}>Proceed to Checkout</AppButton>
      </CardContent>
    </Card>
  );
};
