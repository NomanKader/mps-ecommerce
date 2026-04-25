import { useQuery } from '@tanstack/react-query';

import { orderApi } from '@features/order/api/orderApi';
import { OrderStatusChip } from '@entities/order/ui/OrderStatusChip';
import { AppDataTable } from '@shared/components/ui/DataTable/DataTable';
import { PageSection } from '@shared/components/ui/SectionTitle/PageSection';

export const OrdersManagementPage = () => {
  const { data = [] } = useQuery({
    queryFn: orderApi.getOrders,
    queryKey: ['admin-orders'],
  });

  return (
    <PageSection
      description="Admin order operations are ready for server-side pagination, filters, fulfillment actions, and export tools."
      title="Orders Management"
    >
      <AppDataTable
        columns={[
          { field: 'orderNumber', flex: 1, headerName: 'Order #' },
          { field: 'customerName', flex: 1.2, headerName: 'Customer' },
          { field: 'itemCount', headerName: 'Items', width: 110 },
          { field: 'totalAmount', headerName: 'Total', width: 120 },
          {
            field: 'status',
            headerName: 'Status',
            renderCell: (params) => <OrderStatusChip status={params.value} />,
            width: 140,
          },
        ]}
        rows={data}
      />
    </PageSection>
  );
};
