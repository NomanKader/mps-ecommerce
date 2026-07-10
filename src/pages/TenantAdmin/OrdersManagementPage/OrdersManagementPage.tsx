import { PersistentDialog as Dialog } from '@shared/components/ui/Dialog/AppDialog';
import FilterListRoundedIcon from '@mui/icons-material/FilterListRounded';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { GridActionsCellItem, type GridColDef, type GridPaginationModel } from '@mui/x-data-grid';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
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
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [endDate, setEndDate] = useState('');
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [statusFilter, setStatusFilter] = useState<AdminOrderStatus | 'all'>('all');
  const [subcategoryFilter, setSubcategoryFilter] = useState('all');
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });
  const debouncedSearch = useDebounce(search);
  const categoriesQuery = useQuery({
    queryFn: ({ signal }) => adminApi.listCategories({}, { signal }),
    queryKey: ['admin', 'categories'],
  });
  const categories = useMemo(() => categoriesQuery.data ?? [], [categoriesQuery.data]);
  const selectedCategory = useMemo(
    () => categories.find((category) => category.id === categoryFilter),
    [categories, categoryFilter],
  );
  const subcategoryOptions = selectedCategory?.subcategories ?? [];
  const ordersQuery = useQuery({
    queryFn: ({ signal }) =>
      adminApi.listOrders(
        {
          categoryId: categoryFilter === 'all' ? undefined : categoryFilter,
          from: startDate,
          search: debouncedSearch,
          status: statusFilter === 'all' ? undefined : statusFilter,
          subcategory: subcategoryFilter === 'all' ? undefined : subcategoryFilter,
          to: endDate,
        },
        { signal },
      ),
    queryKey: [
      'admin',
      'orders',
      debouncedSearch,
      statusFilter,
      categoryFilter,
      subcategoryFilter,
      startDate,
      endDate,
    ],
  });
  const statsQuery = useQuery({
    queryFn: ({ signal }) => adminApi.orderStats({ signal }),
    queryKey: ['admin', 'orders', 'stats'],
  });
  const orders = ordersQuery.data ?? [];
  const stats = statsQuery.data ?? { fulfilled: 0, netRevenue: 0, openOrders: 0 };
  const hasActiveFilters = Boolean(
    search ||
      statusFilter !== 'all' ||
      categoryFilter !== 'all' ||
      subcategoryFilter !== 'all' ||
      startDate ||
      endDate,
  );

  const resetPagination = () => {
    setPaginationModel((current) => ({ ...current, page: 0 }));
  };

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setCategoryFilter('all');
    setSubcategoryFilter('all');
    setStartDate('');
    setEndDate('');
    resetPagination();
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

      <Box
        sx={{
          bgcolor: 'background.paper',
          border: 1,
          borderColor: 'divider',
          borderRadius: 1,
          mt: 3,
          overflow: 'hidden',
        }}
      >
        <Stack
          direction="row"
          sx={{
            alignItems: 'center',
            borderBottom: 1,
            borderColor: 'divider',
            justifyContent: 'space-between',
            minHeight: 64,
            px: { sm: 2.5, xs: 2 },
          }}
        >
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <FilterListRoundedIcon color="primary" />
            <Typography sx={{ fontWeight: 800 }} variant="subtitle1">
              Order filters
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Chip label={`${orders.length} results`} size="small" variant="outlined" />
            <Button
              disabled={!hasActiveFilters}
              onClick={clearFilters}
              startIcon={<RestartAltRoundedIcon />}
              sx={{ display: { sm: 'inline-flex', xs: 'none' }, minWidth: 0, px: 1.5 }}
            >
              Clear
            </Button>
          </Stack>
        </Stack>

        <Box
          sx={{
            display: 'grid',
            gap: 2,
            gridTemplateColumns: {
              sm: 'repeat(2, minmax(0, 1fr))',
              xl: 'minmax(300px, 1.6fr) minmax(170px, 0.8fr) minmax(220px, 1fr) minmax(210px, 1fr)',
              xs: 'minmax(0, 1fr)',
            },
            p: { sm: 2.5, xs: 2 },
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
            value={search}
          />
          <TextField
            label="Status"
            onChange={(event) => {
              setStatusFilter(event.target.value as AdminOrderStatus | 'all');
              resetPagination();
            }}
            select
            value={statusFilter}
          >
            {statusFilterOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Primary category"
            onChange={(event) => {
              setCategoryFilter(event.target.value);
              setSubcategoryFilter('all');
              resetPagination();
            }}
            select
            value={categoryFilter}
          >
            <MenuItem value="all">All primary categories</MenuItem>
            {categories.map((category) => (
              <MenuItem key={category.id} value={category.id}>
                {category.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            disabled={categoryFilter === 'all' || subcategoryOptions.length === 0}
            label="Sub category"
            onChange={(event) => {
              setSubcategoryFilter(event.target.value);
              resetPagination();
            }}
            select
            value={subcategoryFilter}
          >
            <MenuItem value="all">All sub categories</MenuItem>
            {subcategoryOptions.map((subcategory) => (
              <MenuItem key={subcategory} value={subcategory}>
                {subcategory}
              </MenuItem>
            ))}
          </TextField>

          <Box
            sx={{
              display: 'grid',
              gap: 2,
              gridColumn: { sm: '1 / -1', xl: '1 / span 2' },
              gridTemplateColumns: { sm: 'repeat(2, minmax(0, 1fr))', xs: '1fr' },
            }}
          >
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
          </Box>
          <Button
            disabled={!hasActiveFilters}
            onClick={clearFilters}
            startIcon={<RestartAltRoundedIcon />}
            sx={{ display: { sm: 'none', xs: 'inline-flex' }, justifySelf: 'start' }}
          >
            Clear filters
          </Button>
        </Box>
      </Box>

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
        maxWidth="md"
        onClose={() => setDetailOrder(null)}
        open={Boolean(detailOrder)}
      >
        <DialogTitle>Order Details</DialogTitle>
        <DialogContent>
          {detailOrder ? (
            <Stack spacing={2.5} sx={{ pt: 1 }}>
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
              <Grid container spacing={3}>
                <Grid size={{ md: 7.5, xs: 12 }}>
                  <Stack spacing={1.5}>
                    <Stack direction="row" sx={{ alignItems: 'baseline', justifyContent: 'space-between' }}>
                      <Typography sx={{ fontWeight: 800 }} variant="subtitle1">
                        Items to prepare
                      </Typography>
                      <Typography color="text.secondary" variant="body2">
                        {detailOrder.itemCount} units
                      </Typography>
                    </Stack>
                    {detailOrder.lineItems?.length ? (
                      <Stack divider={<Divider flexItem />}>
                        {detailOrder.lineItems.map((item, index) => (
                          <Stack
                            direction="row"
                            key={`${item.productId}-${index}`}
                            spacing={1.5}
                            sx={{ alignItems: 'center', py: 1.5 }}
                          >
                            <Box
                              sx={{
                                alignItems: 'center',
                                bgcolor: 'background.default',
                                border: 1,
                                borderColor: 'divider',
                                borderRadius: 1,
                                display: 'flex',
                                flexShrink: 0,
                                height: 64,
                                justifyContent: 'center',
                                overflow: 'hidden',
                                width: 64,
                              }}
                            >
                              {item.imageUrl ? (
                                <Box
                                  alt={item.name}
                                  component="img"
                                  src={item.imageUrl}
                                  sx={{ height: '100%', objectFit: 'cover', width: '100%' }}
                                />
                              ) : (
                                <Typography color="text.secondary" sx={{ fontWeight: 800 }}>
                                  {item.quantity}x
                                </Typography>
                              )}
                            </Box>
                            <Stack spacing={0.65} sx={{ flex: 1, minWidth: 0 }}>
                              <Stack
                                direction="row"
                                spacing={1}
                                sx={{ alignItems: 'baseline', justifyContent: 'space-between' }}
                              >
                                <Typography noWrap sx={{ fontWeight: 800 }}>
                                  {item.name}
                                </Typography>
                                <Typography sx={{ flexShrink: 0, fontWeight: 800 }}>
                                  {formatCurrency(item.lineTotal)}
                                </Typography>
                              </Stack>
                              <Typography color="text.secondary" variant="caption">
                                SKU {item.sku} · {item.quantity} × {formatCurrency(item.unitPrice)}
                              </Typography>
                              <Stack direction="row" spacing={0.75} sx={{ flexWrap: 'wrap', gap: 0.75 }}>
                                {item.categoryName ? (
                                  <Chip
                                    clickable={Boolean(item.categoryId)}
                                    label={item.categoryName}
                                    onClick={() => {
                                      if (!item.categoryId) return;
                                      setCategoryFilter(item.categoryId);
                                      setSubcategoryFilter('all');
                                      setDetailOrder(null);
                                      resetPagination();
                                    }}
                                    size="small"
                                    variant="outlined"
                                  />
                                ) : null}
                                {item.subcategory ? (
                                  <Chip
                                    clickable={Boolean(item.categoryId)}
                                    label={item.subcategory}
                                    onClick={() => {
                                      if (!item.categoryId) return;
                                      setCategoryFilter(item.categoryId);
                                      setSubcategoryFilter(item.subcategory ?? 'all');
                                      setDetailOrder(null);
                                      resetPagination();
                                    }}
                                    size="small"
                                  />
                                ) : null}
                              </Stack>
                            </Stack>
                          </Stack>
                        ))}
                      </Stack>
                    ) : (
                      <Alert severity="warning">
                        Product details are unavailable for this legacy order. New orders retain a
                        complete item snapshot.
                      </Alert>
                    )}
                  </Stack>
                </Grid>

                <Grid size={{ md: 4.5, xs: 12 }}>
                  <Stack
                    spacing={2}
                    sx={{ bgcolor: 'background.default', borderRadius: 1, p: 2 }}
                  >
                    <Typography sx={{ fontWeight: 800 }} variant="subtitle1">
                      Fulfillment details
                    </Typography>
                    <Box>
                      <Typography color="text.secondary" variant="caption">Customer</Typography>
                      <Typography sx={{ fontWeight: 700 }}>{detailOrder.customerName}</Typography>
                      <Typography color="text.secondary" variant="body2">
                        {detailOrder.customerPhone ?? 'No phone'}
                      </Typography>
                      <Typography color="text.secondary" variant="body2">
                        {detailOrder.customerEmail ?? 'No email'}
                      </Typography>
                    </Box>
                    <Divider />
                    <Box>
                      <Typography color="text.secondary" variant="caption">Deliver to</Typography>
                      <Typography sx={{ fontWeight: 700 }}>
                        {detailOrder.deliveryAddress ?? 'No delivery address'}
                      </Typography>
                      <Typography color="text.secondary" variant="body2">
                        {detailOrder.region ?? 'N/A'} / {detailOrder.township ?? 'N/A'}
                      </Typography>
                    </Box>
                    <Divider />
                    <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                      <Typography color="text.secondary">Payment</Typography>
                      <Typography sx={{ fontWeight: 700 }}>{detailOrder.paymentMethod ?? 'N/A'}</Typography>
                    </Stack>
                    <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                      <Typography color="text.secondary">Order total</Typography>
                      <Typography sx={{ fontWeight: 900 }}>
                        {formatCurrency(detailOrder.totalAmount)}
                      </Typography>
                    </Stack>
                  </Stack>
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
