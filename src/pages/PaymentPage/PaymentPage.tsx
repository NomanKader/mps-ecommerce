import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import {
  Alert,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Radio,
  Stack,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

import { useCart } from '@features/cart/hooks/useCart';
import { orderApi, type CreateOrderPayload } from '@features/order/api/orderApi';
import { checkoutDraftStorage } from '@features/order/utils/checkoutDraft';
import { walletApi } from '@features/wallet/api/walletApi';
import { routePaths } from '@routes/routePaths';
import { toApiError } from '@shared/api/apiError';
import { AppButton } from '@shared/components/ui/Button/AppButton';
import { EmptyState } from '@shared/components/ui/EmptyState/EmptyState';
import { PageSection } from '@shared/components/ui/SectionTitle/PageSection';
import { storefrontColors } from '@app/providers/theme/tokens';
import { formatCurrency } from '@utils/formatCurrency';

type PaymentMethod = CreateOrderPayload['paymentMethod'];

const paymentOptions: Array<{
  description: string;
  icon: typeof AccountBalanceWalletOutlinedIcon;
  method: PaymentMethod;
  title: string;
}> = [
  {
    description: 'Pay immediately using your available account wallet balance.',
    icon: AccountBalanceWalletOutlinedIcon,
    method: 'wallet',
    title: 'Pay with wallet',
  },
  {
    description: 'Pay the full order amount when your delivery arrives.',
    icon: LocalShippingOutlinedIcon,
    method: 'cash_on_delivery',
    title: 'Cash on delivery',
  },
];

export const PaymentPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { clearCart, items } = useCart();
  const draft = useMemo(() => checkoutDraftStorage.get(), []);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash_on_delivery');
  const walletQuery = useQuery({
    queryFn: ({ signal }) => walletApi.getSummary({ signal }),
    queryKey: ['wallet', 'summary'],
  });
  const deliveryQuoteQuery = useQuery({
    enabled: Boolean(draft),
    queryFn: () => {
      if (!draft) throw new Error('Checkout details are missing.');

      return orderApi.getDeliveryQuote({
        city: draft.city,
        region: draft.region ?? '',
        subtotalAmount: draft.subtotalAmount,
        township: draft.township ?? '',
      });
    },
    queryKey: [
      'orders',
      'delivery-quote',
      draft?.city,
      draft?.region,
      draft?.subtotalAmount,
      draft?.township,
    ],
  });
  const payableTotal = deliveryQuoteQuery.data?.totalAmount ?? draft?.subtotalAmount ?? 0;
  const availableBalance = Math.max(
    0,
    (walletQuery.data?.wallet.balance ?? 0) - (walletQuery.data?.wallet.reservedBalance ?? 0),
  );
  const hasEnoughWalletBalance = Boolean(
    draft && deliveryQuoteQuery.data && availableBalance >= payableTotal,
  );

  const createOrderMutation = useMutation({
    mutationFn: () => {
      if (!draft) throw new Error('Checkout details are missing.');

      return orderApi.createOrder({
        ...draft,
        items: items.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
        paymentMethod,
        productIds: items.map((item) => item.product.id),
      });
    },
    onError: (error) => toast.error(toApiError(error).message),
    onSuccess: async (order) => {
      checkoutDraftStorage.clear();
      clearCart();
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['orders'] }),
        queryClient.invalidateQueries({ queryKey: ['wallet', 'summary'] }),
      ]);
      toast.success(`Order ${order.orderNumber} placed successfully.`);
      navigate(routePaths.accountOrders, { replace: true });
    },
  });

  if (!draft || !items.length) {
    return (
      <PageSection
        description="Complete checkout before selecting a payment method."
        title="Payment"
      >
        <Stack spacing={2}>
          <EmptyState
            description="Your checkout details are missing or the cart is empty."
            title="Payment is not ready"
          />
          <Box sx={{ textAlign: 'center' }}>
            <AppButton onClick={() => navigate(items.length ? routePaths.checkout : routePaths.cart)}>
              {items.length ? 'Return to checkout' : 'Return to cart'}
            </AppButton>
          </Box>
        </Stack>
      </PageSection>
    );
  }

  return (
    <PageSection
      description="Choose how you want to pay for this order."
      title="Payment"
    >
      <Stack spacing={3}>
        <AppButton
          onClick={() => navigate(routePaths.checkout)}
          startIcon={<ArrowBackRoundedIcon />}
          sx={{ alignSelf: 'flex-start' }}
          variant="outlined"
        >
          Back to checkout
        </AppButton>

        <Stack direction={{ lg: 'row', xs: 'column' }} spacing={3}>
          <Stack spacing={2} sx={{ flex: 1 }}>
            {walletQuery.isLoading ? (
              <Alert icon={<CircularProgress size={20} />} severity="info">
                Checking your wallet balance…
              </Alert>
            ) : null}

            {deliveryQuoteQuery.isLoading ? (
              <Alert icon={<CircularProgress size={20} />} severity="info">
                Calculating delivery fee for your selected address…
              </Alert>
            ) : null}

            {deliveryQuoteQuery.isError ? (
              <Alert severity="error">
                {toApiError(deliveryQuoteQuery.error).message}. Return to checkout and select a
                supported delivery address.
              </Alert>
            ) : null}

            {!walletQuery.isLoading && !hasEnoughWalletBalance ? (
              <Alert severity="warning">
                Your wallet balance is lower than the order total. Add funds from My Wallet or use
                cash on delivery. Wallet payment is unavailable for this order.
              </Alert>
            ) : null}

            {paymentOptions.map((option) => {
              const Icon = option.icon;
              const isWallet = option.method === 'wallet';
              const disabled = isWallet && (!hasEnoughWalletBalance || walletQuery.isLoading);
              const selected = paymentMethod === option.method;

              return (
                <Card
                  key={option.method}
                  onClick={() => {
                    if (!disabled) setPaymentMethod(option.method);
                  }}
                  sx={{
                    border: `2px solid ${
                      selected ? storefrontColors.navy : storefrontColors.border
                    }`,
                    borderRadius: 2,
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    opacity: disabled ? 0.58 : 1,
                    transition: 'border-color 160ms ease, box-shadow 160ms ease',
                    ...(selected && {
                      boxShadow: `0 12px 28px ${alpha(storefrontColors.navy, 0.14)}`,
                    }),
                  }}
                >
                  <CardContent>
                    <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                      <Box
                        sx={{
                          alignItems: 'center',
                          backgroundColor: alpha(storefrontColors.navy, 0.08),
                          borderRadius: 2,
                          color: storefrontColors.navy,
                          display: 'flex',
                          height: 54,
                          justifyContent: 'center',
                          width: 54,
                        }}
                      >
                        <Icon />
                      </Box>
                      <Stack sx={{ flex: 1 }}>
                        <Typography sx={{ fontWeight: 900 }}>{option.title}</Typography>
                        <Typography color="text.secondary" variant="body2">
                          {option.description}
                        </Typography>
                        {isWallet ? (
                          <Typography sx={{ color: storefrontColors.navy, fontWeight: 800, mt: 0.5 }}>
                            Available: {formatCurrency(availableBalance, draft.currency)}
                          </Typography>
                        ) : null}
                      </Stack>
                      <Radio checked={selected} disabled={disabled} />
                    </Stack>
                  </CardContent>
                </Card>
              );
            })}
          </Stack>

          <Card sx={{ alignSelf: 'flex-start', borderRadius: 2, minWidth: { lg: 360 }, width: { lg: 360, xs: '100%' } }}>
            <CardContent>
              <Stack spacing={2}>
                <Typography variant="h6">Payment summary</Typography>
                <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                  <Typography color="text.secondary">Items</Typography>
                  <Typography>{draft.itemCount}</Typography>
                </Stack>
                <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                  <Typography color="text.secondary">Items subtotal</Typography>
                  <Typography>
                    {formatCurrency(draft.subtotalAmount, draft.currency)}
                  </Typography>
                </Stack>
                <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="text.secondary">Delivery fee</Typography>
                    {deliveryQuoteQuery.data?.eta ? (
                      <Typography color="text.secondary" variant="caption">
                        ETA: {deliveryQuoteQuery.data.eta}
                      </Typography>
                    ) : null}
                  </Box>
                  <Typography
                    sx={{
                      color: deliveryQuoteQuery.data?.freeDeliveryApplied
                        ? storefrontColors.success
                        : 'inherit',
                      fontWeight: 700,
                    }}
                  >
                    {deliveryQuoteQuery.data?.freeDeliveryApplied
                      ? 'FREE'
                      : formatCurrency(
                          deliveryQuoteQuery.data?.deliveryFee ?? 0,
                          draft.currency,
                        )}
                  </Typography>
                </Stack>
                <Typography color="text.secondary" variant="caption">
                  Delivering to {draft.city}, {draft.township}, {draft.region}
                </Typography>
                <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                  <Typography color="text.secondary">Payment method</Typography>
                  <Typography sx={{ fontWeight: 700 }}>
                    {paymentMethod === 'wallet' ? 'Wallet' : 'Cash on delivery'}
                  </Typography>
                </Stack>
                <Divider />
                <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                  <Typography sx={{ fontWeight: 900 }}>Amount due</Typography>
                  <Typography sx={{ color: storefrontColors.navy, fontSize: '1.25rem', fontWeight: 900 }}>
                    {formatCurrency(payableTotal, draft.currency)}
                  </Typography>
                </Stack>
                <AppButton
                  disabled={
                    createOrderMutation.isPending ||
                    walletQuery.isLoading ||
                    deliveryQuoteQuery.isLoading ||
                    deliveryQuoteQuery.isError ||
                    (paymentMethod === 'wallet' && !hasEnoughWalletBalance)
                  }
                  onClick={() => createOrderMutation.mutate()}
                >
                  {createOrderMutation.isPending
                    ? 'Processing payment…'
                    : paymentMethod === 'wallet'
                      ? 'Pay and place order'
                      : 'Confirm cash on delivery'}
                </AppButton>
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Stack>
    </PageSection>
  );
};
