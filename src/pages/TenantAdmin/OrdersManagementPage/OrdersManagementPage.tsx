import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import { Card, CardContent, Grid, Stack, Typography } from '@mui/material';
import { GridActionsCellItem, type GridColDef } from '@mui/x-data-grid';
import { useState } from 'react';

import type { Order } from '@entities/order/types/order.types';
import { OrderStatusChip } from '@entities/order/ui/OrderStatusChip';
import { AppDataTable } from '@shared/components/ui/DataTable/DataTable';
import { PageSection } from '@shared/components/ui/SectionTitle/PageSection';
import { mockOrders } from '@shared/lib/mockData';
import { formatCurrency } from '@utils/formatCurrency';
import { formatDate } from '@utils/formatDate';

const nextStatus: Record<Order['status'], Order['status']> = {
  cancelled: 'cancelled',
  delivered: 'delivered',
  pending: 'processing',
  processing: 'shipped',
  shipped: 'delivered',
};

export const OrdersManagementPage = () => {
  const [orders, setOrders] = useState<Order[]>(mockOrders);

  const columns: GridColDef<Order>[] = [
    { field: 'orderNumber', flex: 1, headerName: 'Order #', minWidth: 130 },
    { field: 'customerName', flex: 1.2, headerName: 'Customer', minWidth: 180 },
    { field: 'itemCount', headerName: 'Items', width: 90 },
    {
      field: 'totalAmount',
      headerName: 'Total',
      valueFormatter: (value: number) => formatCurrency(value),
      width: 130,
    },
    {
      field: 'createdAt',
      headerName: 'Placed',
      valueFormatter: (value: string) => formatDate(value),
      width: 140,
    },
    {
      field: 'status',
      headerName: 'Status',
      renderCell: (params) => <OrderStatusChip status={params.value} />,
      width: 140,
    },
    {
      field: 'actions',
      getActions: ({ row }) => [
        <GridActionsCellItem
          disabled={row.status === 'delivered' || row.status === 'cancelled'}
          icon={<LocalShippingOutlinedIcon />}
          key="advance"
          label="Advance status"
          onClick={() =>
            setOrders((current) =>
              current.map((order) =>
                order.id === row.id ? { ...order, status: nextStatus[order.status] } : order,
              ),
            )
          }
        />,
        <GridActionsCellItem
          icon={<DeleteOutlineRoundedIcon />}
          key="cancel"
          label="Cancel"
          onClick={() =>
            setOrders((current) =>
              current.map((order) => (order.id === row.id ? { ...order, status: 'cancelled' } : order)),
            )
          }
        />,
      ],
      type: 'actions',
      width: 110,
    },
  ];

  const openOrders = orders.filter((order) => ['pending', 'processing', 'shipped'].includes(order.status));
  const revenue = orders
    .filter((order) => order.status !== 'cancelled')
    .reduce((total, order) => total + order.totalAmount, 0);

  return (
    <PageSection
      description="Advance fulfillment statuses, cancel orders, and monitor the demo order queue."
      title="Orders Management"
    >
      <Grid container spacing={3}>
        <Grid size={{ md: 4, xs: 12 }}>
          <Card sx={{ borderRadius: 1 }}>
            <CardContent>
              <Typography color="text.secondary" variant="body2">
                Open orders
              </Typography>
              <Typography variant="h4">{openOrders.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ md: 4, xs: 12 }}>
          <Card sx={{ borderRadius: 1 }}>
            <CardContent>
              <Typography color="text.secondary" variant="body2">
                Fulfilled
              </Typography>
              <Typography variant="h4">{orders.filter((order) => order.status === 'delivered').length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ md: 4, xs: 12 }}>
          <Card sx={{ borderRadius: 1 }}>
            <CardContent>
              <Typography color="text.secondary" variant="body2">
                Net revenue
              </Typography>
              <Typography variant="h4">{formatCurrency(revenue)}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Stack sx={{ mt: 3 }}>
        <AppDataTable columns={columns} rows={orders} />
      </Stack>
    </PageSection>
  );
};
