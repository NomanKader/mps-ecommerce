import { Box, Card, CardContent, Chip, Grid, LinearProgress, Stack, Typography } from '@mui/material';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { DashboardCards } from '@widgets/DashboardCards/DashboardCards';
import { PageSection } from '@shared/components/ui/SectionTitle/PageSection';
import { mockOrders, mockProducts, mockPromotions } from '@shared/lib/mockData';
import { formatCurrency } from '@utils/formatCurrency';

const salesByDay = [
  { day: 'Mon', sales: 1200 },
  { day: 'Tue', sales: 1840 },
  { day: 'Wed', sales: 1420 },
  { day: 'Thu', sales: 2210 },
  { day: 'Fri', sales: 2680 },
  { day: 'Sat', sales: 3140 },
  { day: 'Sun', sales: 2360 },
];

const lowStockProducts = mockProducts.filter((product) => product.inventory <= 40);

export const DashboardPage = () => (
  <Stack spacing={3}>
    <PageSection
      description="Operational snapshot for the demo grocery tenant, with live admin navigation into products, orders, customers, promotions, and settings."
      title="Admin Dashboard"
    >
      <DashboardCards />
    </PageSection>

    <Grid container spacing={3}>
      <Grid size={{ lg: 8, xs: 12 }}>
        <Card sx={{ borderRadius: 1, height: '100%' }}>
          <CardContent>
            <Stack direction={{ sm: 'row', xs: 'column' }} sx={{ justifyContent: 'space-between', mb: 2 }}>
              <Box>
                <Typography variant="h6">Weekly Sales</Typography>
                <Typography color="text.secondary" variant="body2">
                  Demo trend for admin reporting and merchandising decisions.
                </Typography>
              </Box>
              <Chip color="success" label="+18.4% vs last week" size="small" />
            </Stack>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer height="100%" width="100%">
                <BarChart data={salesByDay}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="day" />
                  <YAxis tickFormatter={(value: number) => `$${value / 1000}k`} />
                  <Tooltip formatter={(value) => formatCurrency(Number(value ?? 0))} />
                  <Bar dataKey="sales" fill="#1f6f5f" radius={[4, 4, 0, 0]} />
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
                  <Typography variant="body2">
                    {mockOrders.filter((order) => ['pending', 'processing'].includes(order.status)).length}
                  </Typography>
                </Stack>
                <LinearProgress sx={{ mt: 1 }} value={68} variant="determinate" />
              </Box>
              <Box>
                <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                  <Typography variant="body2">Low stock SKUs</Typography>
                  <Typography variant="body2">{lowStockProducts.length}</Typography>
                </Stack>
                <LinearProgress color="warning" sx={{ mt: 1 }} value={44} variant="determinate" />
              </Box>
              <Box>
                <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                  <Typography variant="body2">Active promotions</Typography>
                  <Typography variant="body2">
                    {mockPromotions.filter((promotion) => promotion.status === 'Active').length}
                  </Typography>
                </Stack>
                <LinearProgress color="success" sx={{ mt: 1 }} value={75} variant="determinate" />
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
              {lowStockProducts.map((product) => (
                <Stack key={product.id} direction="row" sx={{ justifyContent: 'space-between' }}>
                  <Typography variant="body2">{product.name}</Typography>
                  <Chip color="warning" label={`${product.inventory} left`} size="small" />
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
              {mockOrders.slice(0, 4).map((order) => (
                <Stack key={order.id} direction="row" sx={{ justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2">{order.orderNumber}</Typography>
                    <Typography color="text.secondary" variant="caption">
                      {order.customerName}
                    </Typography>
                  </Box>
                  <Typography variant="body2">{formatCurrency(order.totalAmount, order.currency)}</Typography>
                </Stack>
              ))}
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  </Stack>
);
