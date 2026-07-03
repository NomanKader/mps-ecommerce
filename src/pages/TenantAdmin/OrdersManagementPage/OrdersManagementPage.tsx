import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import {
  Alert,
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
import { GridActionsCellItem, type GridColDef, type GridPaginationModel } from '@mui/x-data-grid';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import toast from 'react-hot-toast';

import { adminApi } from '@features/admin/api/adminApi';
import type { AdminOrder, AdminOrderStatus } from '@features/admin/types/admin.types';
import { useDebounce } from '@hooks/useDebounce';
import { toApiError } from '@shared/api/apiError';
import { AppButton } from '@shared/components/ui/Button/AppButton';
import { AppDataTable } from '@shared/components/ui/DataTable/DataTable';
import { PageSection } from '@shared/components/ui/SectionTitle/PageSection';
import { formatCurrency } from '@utils/formatCurrency';
import { formatDate } from '@utils/formatDate';

const orderStatusOptions: Array<{ label: string; value: AdminOrderStatus }> = [
  { label: 'Pending', value: 'pending' },
  { label: 'Processing', value: 'processing' },
  { label: 'Shipped', value: 'shipped' },
  { label: 'Delivered', value: 'delivered' },
  { label: 'Fulfilled', value: 'fulfilled' },
  { label: 'Cancelled', value: 'cancelled' },
];

const statusFilterOptions: Array<{ label: string; value: AdminOrderStatus | 'all' }> = [
  { label: 'All statuses', value: 'all' },
  ...orderStatusOptions,
];

const orderStatusColorMap: Record<
  AdminOrderStatus,
  { background: string; border: string; color: string }
> = {
  cancelled: { background: '#fdecea', border: '#f5c2c7', color: '#b42318' },
  delivered: { background: '#e8f5e9', border: '#a5d6a7', color: '#1b7f3a' },
  fulfilled: { background: '#e7f6ee', border: '#8fd3aa', color: '#117a45' },
  pending: { background: '#fff4e5', border: '#ffcc80', color: '#c2410c' },
  processing: { background: '#e3f2fd', border: '#90caf9', color: '#0277bd' },
  shipped: { background: '#eef2ff', border: '#b4c6fc', color: '#4338ca' },
};

const statusSelectSx = (status: AdminOrderStatus) => {
  const colors = orderStatusColorMap[status];

  return {
    minWidth: 150,
    '& .MuiSelect-select': {
      bgcolor: colors.background,
      borderRadius: 0.75,
      color: colors.color,
      fontWeight: 800,
      py: 0.75,
    },
    '& .MuiOutlinedInput-root': {
      '& fieldset': {
        borderColor: colors.border,
      },
      '&:hover fieldset': {
        borderColor: colors.color,
      },
      '&.Mui-focused fieldset': {
        borderColor: colors.color,
      },
    },
    '& .MuiSvgIcon-root': {
      color: colors.color,
    },
  };
};

export const OrdersManagementPage = () => {
  const queryClient = useQueryClient();
  const [detailOrder, setDetailOrder] = useState<AdminOrder | null>(null);
  const [endDate, setEndDate] = useState('');
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [statusFilter, setStatusFilter] = useState<AdminOrderStatus | 'all'>('all');
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });
  const debouncedSearch = useDebounce(search);
  const ordersQuery = useQuery({
    queryFn: ({ signal }) =>
      adminApi.listOrders(
        {
          from: startDate,
          search: debouncedSearch,
          status: statusFilter === 'all' ? undefined : statusFilter,
          to: endDate,
        },
        { signal },
      ),
    queryKey: ['admin', 'orders', debouncedSearch, statusFilter, startDate, endDate],
  });
  const statsQuery = useQuery({
    queryFn: ({ signal }) => adminApi.orderStats({ signal }),
    queryKey: ['admin', 'orders', 'stats'],
  });
  const orders = ordersQuery.data ?? [];
  const stats = statsQuery.data ?? { fulfilled: 0, netRevenue: 0, openOrders: 0 };

  const resetPagination = () => {
    setPaginationModel((current) => ({ ...current, page: 0 }));
  };

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: AdminOrderStatus }) =>
      adminApi.updateOrderStatus(id, status),
    onError: (error) => toast.error(toApiError(error).message),
    onSuccess: async (result, variables) => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
      toast.success(result.message);
      setDetailOrder((current) =>
        current?.id === variables.id ? { ...current, status: variables.status } : current,
      );
    },
  });

  const handleStatusChange = (order: AdminOrder, status: AdminOrderStatus) => {
    if (order.status === status) {
      return;
    }

    statusMutation.mutate({ id: order.id, status });
  };

  const columns: GridColDef<AdminOrder>[] = [
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
      renderCell: (params) => (
        <TextField
          disabled={statusMutation.isPending && statusMutation.variables?.id === params.row.id}
          onChange={(event) =>
            handleStatusChange(params.row, event.target.value as AdminOrderStatus)
          }
          onClick={(event) => event.stopPropagation()}
          select
          size="small"
          sx={statusSelectSx(params.row.status)}
          value={params.row.status}
        >
          {orderStatusOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      ),
      width: 180,
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
      ],
      type: 'actions',
      width: 72,
    },
  ];

  return (
    <PageSection
      description="Advance fulfillment statuses, cancel orders, and monitor the order queue."
      title="Orders Management"
    >
      <Grid container spacing={3}>
        <Grid size={{ md: 4, xs: 12 }}>
          <Card sx={{ borderRadius: 1 }}>
            <CardContent>
              <Typography color="text.secondary" variant="body2">
                Open orders
              </Typography>
              <Typography variant="h4">{stats.openOrders}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ md: 4, xs: 12 }}>
          <Card sx={{ borderRadius: 1 }}>
            <CardContent>
              <Typography color="text.secondary" variant="body2">
                Fulfilled
              </Typography>
              <Typography variant="h4">{stats.fulfilled}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ md: 4, xs: 12 }}>
          <Card sx={{ borderRadius: 1 }}>
            <CardContent>
              <Typography color="text.secondary" variant="body2">
                Net revenue
              </Typography>
              <Typography variant="h4">{formatCurrency(stats.netRevenue)}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      {statsQuery.isError ? (
        <Alert severity="error">{toApiError(statsQuery.error).message}</Alert>
      ) : null}

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
          onChange={(event) => {
            setSearch(event.target.value);
            resetPagination();
          }}
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
          onChange={(event) => {
            setStatusFilter(event.target.value as AdminOrderStatus | 'all');
            resetPagination();
          }}
          select
          sx={{ minWidth: { lg: 170 } }}
          value={statusFilter}
        >
          {statusFilterOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label="From date"
          onChange={(event) => {
            setStartDate(event.target.value);
            resetPagination();
          }}
          slotProps={{ inputLabel: { shrink: true } }}
          type="date"
          value={startDate}
        />
        <TextField
          label="To date"
          onChange={(event) => {
            setEndDate(event.target.value);
            resetPagination();
          }}
          slotProps={{ inputLabel: { shrink: true } }}
          type="date"
          value={endDate}
        />
        <Typography color="text.secondary" sx={{ ml: { lg: 'auto' } }} variant="body2">
          Showing {orders.length}
        </Typography>
      </Stack>

      <Stack sx={{ mt: 2 }}>
        {ordersQuery.isError ? (
          <Alert severity="error">{toApiError(ordersQuery.error).message}</Alert>
        ) : null}
        <AppDataTable
          columns={columns}
          loading={ordersQuery.isLoading}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[10, 20, 50]}
          pagination
          paginationModel={paginationModel}
          rowHeight={60}
          rows={orders}
        />
      </Stack>

      <Dialog
        fullWidth
        maxWidth="sm"
        onClose={() => setDetailOrder(null)}
        open={Boolean(detailOrder)}
      >
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
                <TextField
                  disabled={
                    statusMutation.isPending && statusMutation.variables?.id === detailOrder.id
                  }
                  label="Status"
                  onChange={(event) =>
                    handleStatusChange(detailOrder, event.target.value as AdminOrderStatus)
                  }
                  select
                  size="small"
                  sx={{ ...statusSelectSx(detailOrder.status), minWidth: 170 }}
                  value={detailOrder.status}
                >
                  {orderStatusOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
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
