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

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      navigate(routePaths.accountOrders, { replace: true });
    }, 1800);

    return () => window.clearTimeout(timeoutId);
  }, [navigate]);

  return (
    <PageSection
      description="We are checking your online payment result."
      title="Payment submitted"
    >
      <Stack spacing={2}>
        <Alert severity="info">
          {orderNumber
            ? `MoPayments returned for order ${orderNumber}. Your order history will show the latest status.`
            : "MoPayments returned to Av's Store. Your order history will show the latest status."}
        </Alert>
        <Typography color="text.secondary">
          You will be redirected to your order history automatically.
        </Typography>
        <Box>
          <AppButton onClick={() => navigate(routePaths.accountOrders, { replace: true })}>
            View order history
          </AppButton>
        </Box>
      </Stack>
    </PageSection>
  );
};
