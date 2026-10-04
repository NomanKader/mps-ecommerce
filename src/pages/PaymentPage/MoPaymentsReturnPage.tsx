import { Alert, Box, Stack, Typography } from '@mui/material';
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { routePaths } from '@routes/routePaths';
import { AppButton } from '@shared/components/ui/Button/AppButton';
import { PageSection } from '@shared/components/ui/SectionTitle/PageSection';

export const MoPaymentsReturnPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderNumber = searchParams.get('orderNumber');
  const walletTopUpId = searchParams.get('walletTopUpId');
  const isWalletTopUp = Boolean(walletTopUpId);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      navigate(isWalletTopUp ? routePaths.accountWallet : routePaths.accountOrders, { replace: true });
    }, 1800);

    return () => window.clearTimeout(timeoutId);
  }, [isWalletTopUp, navigate]);

  return (
    <PageSection
      description="We are checking your online payment result."
      title="Payment submitted"
    >
      <Stack spacing={2}>
        <Alert severity="info">
          {orderNumber
            ? `Checking online payment for order ${orderNumber}. Your order history will show the latest status.`
            : isWalletTopUp
              ? 'Checking your wallet top-up payment. Your wallet balance will show the latest status.'
              : 'Your order history will show the latest online payment status.'}
        </Alert>
        <Typography color="text.secondary">
          You will be redirected automatically.
        </Typography>
        <Box>
          <AppButton
            onClick={() =>
              navigate(isWalletTopUp ? routePaths.accountWallet : routePaths.accountOrders, {
                replace: true,
              })
            }
          >
            {isWalletTopUp ? 'View wallet' : 'View order history'}
          </AppButton>
        </Box>
      </Stack>
    </PageSection>
  );
};
