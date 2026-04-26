import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import PaidOutlinedIcon from '@mui/icons-material/PaidOutlined';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import StoreOutlinedIcon from '@mui/icons-material/StoreOutlined';
import { Card, CardContent, Grid, Stack, Typography } from '@mui/material';

import { mockCustomers, mockOrders, mockProducts, mockTenant } from '@shared/lib/mockData';
import { formatCurrency } from '@utils/formatCurrency';

const revenue = mockOrders.reduce((total, order) => total + order.totalAmount, 0);

const cards = [
  { helper: `${mockTenant.name} · ${mockTenant.plan}`, icon: StoreOutlinedIcon, label: 'Tenant', value: 'MPS Demo' },
  { helper: 'Live SKUs', icon: Inventory2OutlinedIcon, label: 'Catalog Items', value: `${mockProducts.length}` },
  { helper: 'Demo orders', icon: ShoppingBagOutlinedIcon, label: 'Orders', value: `${mockOrders.length}` },
  { helper: `${mockCustomers.length} customers`, icon: PaidOutlinedIcon, label: 'Revenue', value: formatCurrency(revenue) },
];

export const DashboardCards = () => (
  <Grid container spacing={3}>
    {cards.map((card) => {
      const Icon = card.icon;

      return (
        <Grid key={card.label} size={{ lg: 3, md: 6, xs: 12 }}>
          <Card sx={{ borderRadius: 1, height: '100%', minHeight: 148 }}>
            <CardContent sx={{ height: '100%' }}>
              <Stack direction="row" sx={{ height: '100%', justifyContent: 'space-between' }}>
                <Stack spacing={1} sx={{ minWidth: 0 }}>
                  <Typography color="text.secondary" variant="body2">
                    {card.label}
                  </Typography>
                  <Typography sx={{ fontSize: { sm: '1.35rem', xs: '1.2rem' }, fontWeight: 800 }} variant="h5">
                    {card.value}
                  </Typography>
                  <Typography color="text.secondary" noWrap variant="caption">
                    {card.helper}
                  </Typography>
                </Stack>
                <Icon color="primary" sx={{ flexShrink: 0 }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      );
    })}
  </Grid>
);
