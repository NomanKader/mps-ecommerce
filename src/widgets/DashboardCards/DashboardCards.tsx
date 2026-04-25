import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import PaidOutlinedIcon from '@mui/icons-material/PaidOutlined';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import StoreOutlinedIcon from '@mui/icons-material/StoreOutlined';
import { Card, CardContent, Grid, Stack, Typography } from '@mui/material';

const cards = [
  {
    icon: StoreOutlinedIcon,
    label: 'Active Tenants',
    value: '24',
  },
  {
    icon: Inventory2OutlinedIcon,
    label: 'Catalog Items',
    value: '1,248',
  },
  {
    icon: ShoppingBagOutlinedIcon,
    label: 'Monthly Orders',
    value: '8,932',
  },
  {
    icon: PaidOutlinedIcon,
    label: 'Gross Revenue',
    value: '$128.4K',
  },
];

export const DashboardCards = () => (
  <Grid container spacing={3}>
    {cards.map((card) => {
      const Icon = card.icon;

      return (
        <Grid key={card.label} size={{ lg: 3, md: 6, xs: 12 }}>
          <Card sx={{ borderRadius: 4 }}>
            <CardContent>
              <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                <Stack spacing={1}>
                  <Typography color="text.secondary" variant="body2">
                    {card.label}
                  </Typography>
                  <Typography variant="h4">{card.value}</Typography>
                </Stack>
                <Icon color="primary" />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      );
    })}
  </Grid>
);
