import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  LinearProgress,
  Stack,
  Typography,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { adminApi } from '@features/admin/api/adminApi';
import { DashboardCards } from '@widgets/DashboardCards/DashboardCards';
import { AppLoader } from '@shared/components/ui/Loader/AppLoader';
import { PageSection } from '@shared/components/ui/SectionTitle/PageSection';
import { toApiError } from '@shared/api/apiError';
import { formatCurrency } from '@utils/formatCurrency';

const percent = (value: number, max: number) => (max > 0 ? Math.min((value / max) * 100, 100) : 0);

export const DashboardPage = () => {
  const dashboardQuery = useQuery({
    queryFn: ({ signal }) => adminApi.getDashboard({ signal }),
    queryKey: ['admin', 'dashboard'],
  });

  if (dashboardQuery.isLoading) {
    return <AppLoader label="Loading dashboard" />;
  }

  if (dashboardQuery.isError || !dashboardQuery.data) {
    return <Alert severity="error">{toApiError(dashboardQuery.error).message}</Alert>;
  }

  const dashboard = dashboardQuery.data;
  const maxWorkQueue = Math.max(
    dashboard.workQueue.ordersToFulfill,
    dashboard.workQueue.lowStockSkus,
    dashboard.workQueue.activePromotions,
    1,
  );

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
          <Card sx={{ borderRadius: 1, height: '100%' }}>
            <CardContent>
              <Stack
                direction={{ sm: 'row', xs: 'column' }}
                sx={{ justifyContent: 'space-between', mb: 2 }}
              >
                <Box>
                  <Typography variant="h6">Weekly Sales</Typography>
                  <Typography color="text.secondary" variant="body2">
                    Live trend for admin reporting and merchandising decisions.
                  </Typography>
                </Box>
                <Chip color="success" label="+18.4% vs last week" size="small" />
              </Stack>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer height="100%" width="100%">
                  <BarChart data={dashboard.weeklySales}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="day" />
                    <YAxis tickFormatter={(value: number) => `$${value / 1000}k`} />
                    <Tooltip formatter={(value) => formatCurrency(Number(value ?? 0))} />
                    <Bar dataKey="sales" fill="#e43224" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ lg: 4, xs: 12 }}>
          <Card sx={{ borderRadius: 1, height: '100%' }}>
            <CardContent>
              <Typography variant="h6">Admin Work Queue</Typography>
              <Stack spacing={2.25} sx={{ mt: 2 }}>
                <Box>
                  <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                    <Typography variant="body2">Orders to fulfill</Typography>
                    <Typography variant="body2">{dashboard.workQueue.ordersToFulfill}</Typography>
                  </Stack>
                  <LinearProgress
                    sx={{ mt: 1 }}
                    value={percent(dashboard.workQueue.ordersToFulfill, maxWorkQueue)}
                    variant="determinate"
                  />
                </Box>
                <Box>
                  <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                    <Typography variant="body2">Low stock SKUs</Typography>
                    <Typography variant="body2">{dashboard.workQueue.lowStockSkus}</Typography>
                  </Stack>
                  <LinearProgress
                    color="warning"
                    sx={{ mt: 1 }}
                    value={percent(dashboard.workQueue.lowStockSkus, maxWorkQueue)}
                    variant="determinate"
                  />
                </Box>
                <Box>
                  <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                    <Typography variant="body2">Active promotions</Typography>
                    <Typography variant="body2">{dashboard.workQueue.activePromotions}</Typography>
                  </Stack>
                  <LinearProgress
                    color="success"
                    sx={{ mt: 1 }}
                    value={percent(dashboard.workQueue.activePromotions, maxWorkQueue)}
                    variant="determinate"
                  />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ md: 6, xs: 12 }}>
          <Card sx={{ borderRadius: 1 }}>
            <CardContent>
              <Typography variant="h6">Inventory Alerts</Typography>
              <Stack spacing={1.5} sx={{ mt: 2 }}>
                {dashboard.inventoryAlerts.map((product) => (
                  <Stack key={product.id} direction="row" sx={{ justifyContent: 'space-between' }}>
                    <Typography variant="body2">{product.name}</Typography>
                    <Chip color="warning" label={`${product.stock} left`} size="small" />
                  </Stack>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ md: 6, xs: 12 }}>
          <Card sx={{ borderRadius: 1 }}>
            <CardContent>
              <Typography variant="h6">Recent Orders</Typography>
              <Stack spacing={1.5} sx={{ mt: 2 }}>
                {dashboard.recentOrders.map((order) => (
                  <Stack key={order.id} direction="row" sx={{ justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="body2">{order.orderNumber}</Typography>
                      <Typography color="text.secondary" variant="caption">
                        {order.customerName}
                      </Typography>
                    </Box>
                    <Typography variant="body2">
                      {formatCurrency(order.totalAmount, order.currency)}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Stack>
  );
};
