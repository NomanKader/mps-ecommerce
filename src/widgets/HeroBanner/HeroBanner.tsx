import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import { Box, Chip, Grid, Paper, Stack, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

import { AppButton } from '@shared/components/ui/Button/AppButton';
import { routePaths } from '@routes/routePaths';

export const HeroBanner = () => (
  <Paper
    sx={{
      background:
        'radial-gradient(circle at top left, rgba(255,211,38,0.3), transparent 32%), linear-gradient(135deg, #b71916, #e43224)',
      borderRadius: 1,
      color: '#fff',
      overflow: 'hidden',
      p: { md: 6, xs: 4 },
    }}
  >
    <Grid container spacing={4} sx={{ alignItems: 'center' }}>
      <Grid size={{ md: 7, xs: 12 }}>
        <Stack spacing={3}>
          <Chip
            label="Fresh grocery delivery"
            sx={{ alignSelf: 'flex-start', bgcolor: 'rgba(255,255,255,0.12)', color: '#fff' }}
          />
          <Typography variant="h2">
            Everyday groceries delivered across Yangon with care.
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.8)', maxWidth: 640 }} variant="body1">
            Shop fresh produce, pantry staples, household essentials, and easy meal picks from
            AV's Store.
          </Typography>
          <Stack direction={{ sm: 'row', xs: 'column' }} spacing={2}>
            <Link to={routePaths.catalog}>
              <AppButton endIcon={<ArrowForwardRoundedIcon />}>Browse Catalog</AppButton>
            </Link>
            <Link to={routePaths.search}>
              <AppButton
                color="secondary"
                sx={{ '&:hover': { bgcolor: '#eef3f0' }, bgcolor: '#fff', color: 'primary.main' }}
                variant="contained"
              >
                Search Products
              </AppButton>
            </Link>
          </Stack>
        </Stack>
      </Grid>
      <Grid size={{ md: 5, xs: 12 }}>
        <Box
          sx={{
            border: '1px solid rgba(255,255,255,0.16)',
            borderRadius: 1,
            display: 'grid',
            gap: 2,
            p: 3,
          }}
        >
          <Typography variant="subtitle1">Fresh picks, simple shopping</Typography>
          <Typography color="rgba(255,255,255,0.75)" variant="body2">
            Build your basket in minutes and choose the delivery details that work for your day.
          </Typography>
        </Box>
      </Grid>
    </Grid>
  </Paper>
);
