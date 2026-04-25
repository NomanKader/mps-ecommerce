import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, Stack, Typography } from '@mui/material';

import { orderApi } from '@features/order/api/orderApi';
import { OrderStatusChip } from '@entities/order/ui/OrderStatusChip';
import { PageSection } from '@shared/components/ui/SectionTitle/PageSection';
import { formatCurrency } from '@utils/formatCurrency';
import { formatDate } from '@utils/formatDate';

export const OrdersPage = () => {
  const { data = [] } = useQuery({
    queryFn: orderApi.getOrders,
    queryKey: ['orders'],
  });

  return (
    <PageSection
      description="Customer order history route ready for order tracking, invoices, and support workflows."
      title="Orders"
    >
      <Stack spacing={2}>
        {data.map((order) => (
          <Card key={order.id} sx={{ borderRadius: 4 }}>
            <CardContent>
              <Stack
                direction={{ md: 'row', xs: 'column' }}
                spacing={2}
                sx={{ alignItems: { md: 'center', xs: 'flex-start' }, justifyContent: 'space-between' }}
              >
                <Stack spacing={0.5}>
                  <Typography variant="h6">{order.orderNumber}</Typography>
                  <Typography color="text.secondary" variant="body2">
                    {order.customerName} • {formatDate(order.createdAt)}
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={2} sx={{ alignItems: { md: 'center', xs: 'flex-start' } }}>
                  <Typography sx={{ fontWeight: 700 }}>
                    {formatCurrency(order.totalAmount, order.currency)}
                  </Typography>
                  <OrderStatusChip status={order.status} />
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </PageSection>
  );
};
