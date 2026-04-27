import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import {
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { GridActionsCellItem, type GridColDef } from '@mui/x-data-grid';
import { useMemo, useState } from 'react';

import type { Order } from '@entities/order/types/order.types';
import { OrderStatusChip } from '@entities/order/ui/OrderStatusChip';
import { AppButton } from '@shared/components/ui/Button/AppButton';
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

const statusOptions: Array<{ label: string; value: Order['status'] | 'all' }> = [
  { label: 'All statuses', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Processing', value: 'processing' },
  { label: 'Shipped', value: 'shipped' },
  { label: 'Delivered', value: 'delivered' },
  { label: 'Cancelled', value: 'cancelled' },
];

const getAdvanceIcon = (status: Order['status']) => {
  if (status === 'pending') {
    return <Inventory2OutlinedIcon />;
  }

  if (status === 'processing') {
    return <LocalShippingOutlinedIcon />;
  }

  return <CheckCircleOutlineRoundedIcon />;
};

const getAdvanceLabel = (status: Order['status']) => {
  if (status === 'pending') {
    return 'Mark processing';
  }

  if (status === 'processing') {
    return 'Mark shipped';
  }

  return 'Mark delivered';
};

const toDateInputValue = (date: string) => date.slice(0, 10);

export const OrdersManagementPage = () => {
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [detailOrder, setDetailOrder] = useState<Order | null>(null);
  const [endDate, setEndDate] = useState('');
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [statusFilter, setStatusFilter] = useState<Order['status'] | 'all'>('all');

  const filteredOrders = useMemo(
    () =>
      orders.filter((order) => {
        const normalizedSearch = search.trim().toLowerCase();
        const searchableValue = [
          order.orderNumber,
          order.customerName,
          order.customerEmail,
          order.customerPhone,
          order.region,
          order.township,
          order.deliveryAddress,
          order.paymentMethod,
        ]
          .join(' ')
          .toLowerCase();
        const orderDate = toDateInputValue(order.createdAt);
        const matchesSearch = normalizedSearch ? searchableValue.includes(normalizedSearch) : true;
        const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
        const matchesStartDate = startDate ? orderDate >= startDate : true;
        const matchesEndDate = endDate ? orderDate <= endDate : true;

        return matchesSearch && matchesStatus && matchesStartDate && matchesEndDate;
      }),
    [endDate, orders, search, startDate, statusFilter],
  );

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
          icon={<VisibilityOutlinedIcon />}
          key="view"
          label="View details"
          onClick={() => setDetailOrder(row)}
        />,
        <GridActionsCellItem
          disabled={row.status === 'delivered' || row.status === 'cancelled'}
          icon={getAdvanceIcon(row.status)}
          key="advance"
          label={getAdvanceLabel(row.status)}
          onClick={() =>
            setOrders((current) =>
              current.map((order) =>
                order.id === row.id ? { ...order, status: nextStatus[order.status] } : order,
              ),
            )
          }
        />,
        <GridActionsCellItem
          disabled={row.status === 'cancelled' || row.status === 'delivered'}
          icon={<BlockOutlinedIcon />}
          key="cancel"
          label="Cancel order"
          onClick={() =>
            setOrders((current) =>
              current.map((order) => (order.id === row.id ? { ...order, status: 'cancelled' } : order)),
            )
          }
        />,
      ],
      type: 'actions',
      width: 132,
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

      <Stack
        direction={{ lg: 'row', xs: 'column' }}
        spacing={2}
        sx={{
          alignItems: { lg: 'center', xs: 'stretch' },
          bgcolor: 'background.paper',
          border: 1,
          borderColor: 'divider',
          borderRadius: 1,
          mt: 3,
          p: 2,
        }}
      >
        <TextField
          label="Search orders"
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Order, customer, phone, township"
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
          sx={{ minWidth: { lg: 320 } }}
          value={search}
        />
        <TextField
          label="Status"
          onChange={(event) => setStatusFilter(event.target.value as Order['status'] | 'all')}
          select
          sx={{ minWidth: { lg: 170 } }}
          value={statusFilter}
        >
          {statusOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label="From date"
          onChange={(event) => setStartDate(event.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
          type="date"
          value={startDate}
        />
        <TextField
          label="To date"
          onChange={(event) => setEndDate(event.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
          type="date"
          value={endDate}
        />
        <Typography color="text.secondary" sx={{ ml: { lg: 'auto' } }} variant="body2">
          Showing {filteredOrders.length} of {orders.length}
        </Typography>
      </Stack>

      <Stack sx={{ mt: 2 }}>
        <AppDataTable columns={columns} rows={filteredOrders} />
      </Stack>

      <Dialog fullWidth maxWidth="sm" onClose={() => setDetailOrder(null)} open={Boolean(detailOrder)}>
        <DialogTitle>Order Details</DialogTitle>
        <DialogContent>
          {detailOrder ? (
            <Stack spacing={2} sx={{ pt: 1 }}>
              <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                <Stack>
                  <Typography variant="h6">{detailOrder.orderNumber}</Typography>
                  <Typography color="text.secondary" variant="body2">
                    Placed {formatDate(detailOrder.createdAt)}
                  </Typography>
                </Stack>
                <OrderStatusChip status={detailOrder.status} />
              </Stack>
              <Grid container spacing={2}>
                <Grid size={{ sm: 6, xs: 12 }}>
                  <Typography color="text.secondary" variant="caption">
                    Customer
                  </Typography>
                  <Typography>{detailOrder.customerName}</Typography>
                </Grid>
                <Grid size={{ sm: 6, xs: 12 }}>
                  <Typography color="text.secondary" variant="caption">
                    Email
                  </Typography>
                  <Typography>{detailOrder.customerEmail ?? 'N/A'}</Typography>
                </Grid>
                <Grid size={{ sm: 6, xs: 12 }}>
                  <Typography color="text.secondary" variant="caption">
                    Phone
                  </Typography>
                  <Typography>{detailOrder.customerPhone ?? 'N/A'}</Typography>
                </Grid>
                <Grid size={{ sm: 6, xs: 12 }}>
                  <Typography color="text.secondary" variant="caption">
                    Payment
                  </Typography>
                  <Typography>{detailOrder.paymentMethod ?? 'N/A'}</Typography>
                </Grid>
                <Grid size={{ sm: 6, xs: 12 }}>
                  <Typography color="text.secondary" variant="caption">
                    Region / Township
                  </Typography>
                  <Typography>
                    {detailOrder.region ?? 'N/A'} / {detailOrder.township ?? 'N/A'}
                  </Typography>
                </Grid>
                <Grid size={{ sm: 6, xs: 12 }}>
                  <Typography color="text.secondary" variant="caption">
                    Items / Total
                  </Typography>
                  <Typography>
                    {detailOrder.itemCount} items · {formatCurrency(detailOrder.totalAmount)}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Typography color="text.secondary" variant="caption">
                    Delivery address
                  </Typography>
                  <Typography>{detailOrder.deliveryAddress ?? 'N/A'}</Typography>
                </Grid>
              </Grid>
            </Stack>
          ) : null}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <AppButton onClick={() => setDetailOrder(null)}>Close</AppButton>
        </DialogActions>
      </Dialog>
    </PageSection>
  );
};
