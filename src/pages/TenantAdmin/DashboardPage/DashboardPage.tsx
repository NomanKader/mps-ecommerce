import {
  Alert,
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  Link,
  LinearProgress,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { adminApi } from '@features/admin/api/adminApi';
import { routePaths } from '@routes/routePaths';
import { DashboardCards } from '@widgets/DashboardCards/DashboardCards';
import { AppLoader } from '@shared/components/ui/Loader/AppLoader';
import { PageSection } from '@shared/components/ui/SectionTitle/PageSection';
import { toApiError } from '@shared/api/apiError';
import { formatCurrency } from '@utils/formatCurrency';

type SalesPeriod = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';

const salesPeriodOptions: Array<{ label: string; value: SalesPeriod }> = [
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'Yearly', value: 'yearly' },
  { label: 'Custom', value: 'custom' },
];

const dateInputValue = (date: Date) => date.toISOString().slice(0, 10);
const percent = (value: number, max: number) => (max > 0 ? Math.min((value / max) * 100, 100) : 0);
const stockSeverity = (stock: number) => {
  if (stock <= 10) return { color: 'error' as const, label: 'Critical', tone: '#b42318' };
  if (stock <= 25) return { color: 'warning' as const, label: 'Low', tone: '#c2410c' };
  return { color: 'info' as const, label: 'Watch', tone: '#0277bd' };
};
const formatPlacedAt = (value: string) =>
  new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    hour12: true,
    timeStyle: 'short',
  }).format(new Date(value));

export const DashboardPage = () => {
  const [salesPeriod, setSalesPeriod] = useState<SalesPeriod>('weekly');
  const [customFrom, setCustomFrom] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 29);
    return dateInputValue(date);
  });
  const [customTo, setCustomTo] = useState(() => dateInputValue(new Date()));
  const dashboardParams =
    salesPeriod === 'custom'
      ? {
          from: customFrom || undefined,
          period: salesPeriod,
          to: customTo || undefined,
        }
      : { period: salesPeriod };
  const dashboardQuery = useQuery({
    queryFn: ({ signal }) => adminApi.getDashboard(dashboardParams, { signal }),
    queryKey: ['admin', 'dashboard', dashboardParams],
  });

  if (dashboardQuery.isLoading) {
    return <AppLoader label="Loading dashboard" />;
  }

  if (dashboardQuery.isError || !dashboardQuery.data) {
    return <Alert severity="error">{toApiError(dashboardQuery.error).message}</Alert>;
  }

  const dashboard = dashboardQuery.data;
  const lowestStock = dashboard.inventoryAlerts[0]?.stock ?? 0;
  const recentOrderPreview = dashboard.recentOrders.slice(0, 5);
  const salesTrend = dashboard.salesTrend ?? dashboard.weeklySales.map(({ day, sales }) => ({ label: day, sales }));
  const salesPeriodLabel =
    salesPeriodOptions.find((option) => option.value === salesPeriod)?.label ?? 'Weekly';
  const salesTrendTotal = salesTrend.reduce((sum, point) => sum + point.sales, 0);
  const salesTrendPeak = salesTrend.reduce(
    (peak, point) => (point.sales > peak.sales ? point : peak),
    salesTrend[0] ?? { label: 'N/A', sales: 0 },
  );
  const maxAlertStock = Math.max(
    ...dashboard.inventoryAlerts.map((product) => product.stock),
    1,
  );
  const maxWorkQueue = Math.max(
    dashboard.workQueue.ordersToFulfill,
    dashboard.workQueue.lowStockSkus,
    dashboard.workQueue.activePromotions,
    1,
  );
  const workQueueItems = [
    {
      background: '#fee2e2',
      color: 'error' as const,
      helper: 'Needs fulfillment review',
      icon: <AssignmentTurnedInOutlinedIcon fontSize="small" />,
      label: 'Orders to fulfill',
      value: dashboard.workQueue.ordersToFulfill,
    },
    {
      background: '#ffedd5',
      color: 'warning' as const,
      helper: 'Restock planning required',
      icon: <Inventory2OutlinedIcon fontSize="small" />,
      label: 'Low stock SKUs',
      value: dashboard.workQueue.lowStockSkus,
    },
    {
      background: '#dcfce7',
      color: 'success' as const,
      helper: 'Currently running',
      icon: <CampaignOutlinedIcon fontSize="small" />,
      label: 'Active promotions',
      value: dashboard.workQueue.activePromotions,
    },
  ];

  return (
    <Stack spacing={3}>
      <PageSection
        description="Operational snapshot for the tenant, with live admin navigation into products, orders, customers, promotions, and delivery fees."
        title="Admin Dashboard"
      >
        <DashboardCards dashboard={dashboard} />
      </PageSection>

      <Grid container spacing={3}>
        <Grid size={{ lg: 8, xs: 12 }}>
          <Card
            sx={{
              border: 1,
              borderColor: 'divider',
              borderRadius: 1,
              height: '100%',
              overflow: 'hidden',
            }}
          >
            <CardContent sx={{ p: 0 }}>
              <Stack
                direction={{ sm: 'row', xs: 'column' }}
                spacing={2}
                sx={{
                  alignItems: { sm: 'center', xs: 'stretch' },
                  bgcolor: '#fff7ed',
                  borderBottom: 1,
                  borderColor: 'divider',
                  justifyContent: 'space-between',
                  px: 3,
                  py: 2.25,
                }}
              >
                <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                  <Avatar sx={{ bgcolor: '#fee2e2', color: '#d92d20', height: 38, width: 38 }}>
                    <TrendingUpOutlinedIcon fontSize="small" />
                  </Avatar>
                  <Box>
                    <Typography sx={{ fontWeight: 900 }} variant="h6">
                      {salesPeriodLabel} Sales
                    </Typography>
                    <Typography color="text.secondary" variant="body2">
                      Live revenue trend for merchandising decisions
                    </Typography>
                  </Box>
                </Stack>
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ flexWrap: 'wrap', justifyContent: 'flex-end' }}
                >
                  <Chip
                    color="success"
                    label={`${salesTrend.length} points`}
                    size="small"
                    sx={{ fontWeight: 800 }}
                  />
                  <Chip
                    label={`Peak ${salesTrendPeak.label}`}
                    size="small"
                    sx={{ bgcolor: '#ffffff', fontWeight: 800 }}
                    variant="outlined"
                  />
                </Stack>
              </Stack>
              <Stack
                direction={{ lg: 'row', xs: 'column' }}
                spacing={1.5}
                sx={{ borderBottom: 1, borderColor: 'divider', px: 3, py: 1.75 }}
              >
                <TextField
                  label="Sales range"
                  onChange={(event) => setSalesPeriod(event.target.value as SalesPeriod)}
                  select
                  size="small"
                  sx={{ minWidth: 170 }}
                  value={salesPeriod}
                >
                  {salesPeriodOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
                {salesPeriod === 'custom' ? (
                  <>
                    <TextField
                      label="From"
                      onChange={(event) => setCustomFrom(event.target.value)}
                      size="small"
                      slotProps={{ inputLabel: { shrink: true } }}
                      type="date"
                      value={customFrom}
                    />
                    <TextField
                      label="To"
                      onChange={(event) => setCustomTo(event.target.value)}
                      size="small"
                      slotProps={{ inputLabel: { shrink: true } }}
                      type="date"
                      value={customTo}
                    />
                  </>
                ) : null}
              </Stack>
              <Stack
                direction={{ sm: 'row', xs: 'column' }}
                spacing={2}
                sx={{ px: 3, py: 2.25 }}
              >
                <Box>
                  <Typography color="text.secondary" variant="caption">
                    {salesPeriodLabel} sales
                  </Typography>
                  <Typography sx={{ fontWeight: 900 }} variant="h5">
                    {formatCurrency(salesTrendTotal)}
                  </Typography>
                </Box>
                <Box>
                  <Typography color="text.secondary" variant="caption">
                    Best point
                  </Typography>
                  <Typography sx={{ fontWeight: 900 }} variant="h5">
                    {formatCurrency(salesTrendPeak.sales)}
                  </Typography>
                </Box>
              </Stack>
              <Box sx={{ height: 280, px: 2, pb: 2 }}>
                <ResponsiveContainer height="100%" width="100%">
                  <AreaChart
                    data={salesTrend}
                    margin={{ bottom: 8, left: 8, right: 20, top: 16 }}
                  >
                    <defs>
                      <linearGradient id="weeklySalesFill" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="5%" stopColor="#e43224" stopOpacity={0.24} />
                        <stop offset="95%" stopColor="#e43224" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#e5e7eb" strokeDasharray="4 4" vertical={false} />
                    <XAxis axisLine={false} dataKey="label" tickLine={false} />
                    <YAxis
                      axisLine={false}
                      tickFormatter={(value: number) => `${value / 1000}k`}
                      tickLine={false}
                    />
                    <Tooltip
                      formatter={(value) => formatCurrency(Number(value ?? 0))}
                      labelStyle={{ fontWeight: 800 }}
                    />
                    <Area
                      dataKey="sales"
                      fill="url(#weeklySalesFill)"
                      stroke="none"
                      type="monotone"
                    />
                    <Line
                      activeDot={{ r: 6, stroke: '#ffffff', strokeWidth: 2 }}
                      dataKey="sales"
                      dot={{ fill: '#ffffff', r: 4, stroke: '#e43224', strokeWidth: 2 }}
                      stroke="#e43224"
                      strokeLinecap="round"
                      strokeWidth={3}
                      type="monotone"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ lg: 4, xs: 12 }}>
          <Card
            sx={{
              border: 1,
              borderColor: 'divider',
              borderRadius: 1,
              height: '100%',
              overflow: 'hidden',
            }}
          >
            <CardContent sx={{ p: 0 }}>
              <Stack
                sx={{
                  bgcolor: '#f8fafc',
                  borderBottom: 1,
                  borderColor: 'divider',
                  px: 3,
                  py: 2.25,
                }}
              >
                <Typography sx={{ fontWeight: 900 }} variant="h6">
                  Admin Work Queue
                </Typography>
                <Typography color="text.secondary" variant="body2">
                  Prioritized workload across orders, stock, and campaigns
                </Typography>
              </Stack>
              <Stack divider={<Divider flexItem />} sx={{ px: 2, py: 1 }}>
                {workQueueItems.map((item) => (
                  <Stack key={item.label} spacing={1.2} sx={{ px: 1, py: 1.65 }}>
                    <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center' }}>
                      <Avatar
                        sx={{
                          bgcolor: item.background,
                          color: `${item.color}.main`,
                          height: 34,
                          width: 34,
                        }}
                      >
                        {item.icon}
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ fontWeight: 850 }} variant="body2">
                          {item.label}
                        </Typography>
                        <Typography color="text.secondary" variant="caption">
                          {item.helper}
                        </Typography>
                      </Box>
                      <Typography sx={{ fontWeight: 900 }} variant="h5">
                        {item.value}
                      </Typography>
                    </Stack>
                    <LinearProgress
                      color={item.color}
                      sx={{ borderRadius: 999, height: 7 }}
                      value={percent(item.value, maxWorkQueue)}
                      variant="determinate"
                    />
                  </Stack>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Stack spacing={3}>
        <Card
          sx={{
            border: 1,
            borderColor: 'divider',
            borderRadius: 1,
            overflow: 'hidden',
          }}
        >
          <CardContent sx={{ p: 0 }}>
            <Stack
              direction="row"
              sx={{
                alignItems: 'center',
                bgcolor: '#f8fafc',
                borderBottom: 1,
                borderColor: 'divider',
                justifyContent: 'space-between',
                px: 3,
                py: 2.25,
              }}
            >
              <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: '#dbeafe', color: '#1d4ed8', height: 38, width: 38 }}>
                  <ReceiptLongOutlinedIcon fontSize="small" />
                </Avatar>
                <Box>
                  <Typography sx={{ fontWeight: 900 }} variant="h6">
                    Recent Orders
                  </Typography>
                  <Typography color="text.secondary" variant="body2">
                    Latest customer activity
                  </Typography>
                </Box>
              </Stack>
              <Chip
                color="primary"
                label={`${dashboard.recentOrders.length} latest`}
                size="small"
                sx={{ fontWeight: 800 }}
                variant="outlined"
              />
            </Stack>
            <Stack divider={<Divider flexItem />} sx={{ px: 2, py: 1 }}>
              {recentOrderPreview.map((order) => (
                <Stack
                  key={order.id}
                  direction={{ md: 'row', xs: 'column' }}
                  spacing={2}
                  sx={{ alignItems: { md: 'center', xs: 'stretch' }, px: 1, py: 1.4 }}
                >
                  <Stack direction="row" spacing={2} sx={{ alignItems: 'center', flex: 1 }}>
                    <Avatar
                      sx={{
                        bgcolor: '#fee2e2',
                        color: '#b42318',
                        fontSize: 14,
                        fontWeight: 900,
                        height: 34,
                        width: 34,
                      }}
                    >
                      {order.customerName.slice(0, 1).toUpperCase()}
                    </Avatar>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography noWrap sx={{ fontWeight: 900 }} variant="body2">
                        {order.orderNumber}
                      </Typography>
                      <Typography color="text.secondary" noWrap variant="caption">
                        {order.customerName}
                      </Typography>
                    </Box>
                  </Stack>
                  <Typography
                    color="text.secondary"
                    sx={{
                      flex: { md: 1, xs: 'unset' },
                      pl: { md: 0, xs: 6.25 },
                      textAlign: { md: 'center', xs: 'left' },
                      whiteSpace: 'nowrap',
                    }}
                    variant="caption"
                  >
                    {formatPlacedAt(order.placedAt)}
                  </Typography>
                  <Typography
                    sx={{
                      flex: { md: 1, xs: 'unset' },
                      fontWeight: 900,
                      pl: { md: 0, xs: 6.25 },
                      textAlign: { md: 'right', xs: 'left' },
                      whiteSpace: 'nowrap',
                    }}
                    variant="body2"
                  >
                    {formatCurrency(order.totalAmount, order.currency)}
                  </Typography>
                </Stack>
              ))}
            </Stack>
            <Box
              sx={{
                borderTop: 1,
                borderColor: 'divider',
                px: 3,
                py: 1.75,
                textAlign: 'center',
              }}
            >
              <Link
                component={RouterLink}
                sx={{
                  color: '#d92d20',
                  fontWeight: 900,
                  opacity: 0.62,
                  textDecorationColor: '#f4a29b',
                  transition: 'opacity 160ms ease, text-decoration-color 160ms ease',
                  '&:hover': {
                    opacity: 1,
                    textDecorationColor: '#d92d20',
                  },
                }}
                to={routePaths.tenantAdmin.orders}
                underline="hover"
              >
                View all orders
              </Link>
            </Box>
          </CardContent>
        </Card>

        <Card
          sx={{
            border: 1,
            borderColor: 'divider',
            borderRadius: 1,
            overflow: 'hidden',
          }}
        >
          <CardContent sx={{ p: 0 }}>
            <Stack
              direction="row"
              sx={{
                alignItems: 'center',
                bgcolor: '#fff7ed',
                borderBottom: 1,
                borderColor: 'divider',
                justifyContent: 'space-between',
                px: 3,
                py: 2.25,
              }}
            >
              <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: '#fed7aa', color: '#c2410c', height: 38, width: 38 }}>
                  <Inventory2OutlinedIcon fontSize="small" />
                </Avatar>
                <Box>
                  <Typography sx={{ fontWeight: 900 }} variant="h6">
                    Inventory Alerts
                  </Typography>
                  <Typography color="text.secondary" variant="body2">
                    {dashboard.inventoryAlerts.length} SKUs need stock attention
                  </Typography>
                </Box>
              </Stack>
              <Chip
                color={lowestStock <= 10 ? 'error' : 'warning'}
                label={`${lowestStock} lowest`}
                size="small"
                sx={{ fontWeight: 800 }}
              />
            </Stack>
            <Stack divider={<Divider flexItem />} sx={{ px: 2, py: 1 }}>
              {dashboard.inventoryAlerts.map((product) => (
                <Stack
                  key={product.id}
                  direction={{ sm: 'row', xs: 'column' }}
                  spacing={1.5}
                  sx={{
                    alignItems: { sm: 'center', xs: 'stretch' },
                    px: 1,
                    py: 1.4,
                  }}
                >
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Typography noWrap sx={{ fontWeight: 800 }} variant="body2">
                        {product.name}
                      </Typography>
                      <Typography color="text.secondary" variant="caption">
                        {product.sku}
                      </Typography>
                    </Stack>
                    <LinearProgress
                      color={stockSeverity(product.stock).color}
                      sx={{ borderRadius: 999, height: 6, mt: 1 }}
                      value={percent(product.stock, maxAlertStock)}
                      variant="determinate"
                    />
                  </Box>
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    <Chip
                      color={stockSeverity(product.stock).color}
                      label={stockSeverity(product.stock).label}
                      size="small"
                      variant="outlined"
                    />
                    <Chip
                      label={`${product.stock} left`}
                      size="small"
                      sx={{
                        bgcolor: '#fff',
                        borderColor: stockSeverity(product.stock).tone,
                        color: stockSeverity(product.stock).tone,
                        fontWeight: 900,
                      }}
                      variant="outlined"
                    />
                  </Stack>
                </Stack>
              ))}
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Stack>
  );
};
