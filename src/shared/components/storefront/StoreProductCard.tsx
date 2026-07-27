import AddShoppingCartOutlinedIcon from '@mui/icons-material/AddShoppingCartOutlined';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import { Box, Card, CardContent, Chip, IconButton, Skeleton, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Link } from 'react-router-dom';

import { useFavorites } from '@features/favorites/hooks/useFavorites';
import type { StoreProduct } from '@features/home/types/home.types';
import { routePaths } from '@routes/routePaths';
import { AppButton } from '@shared/components/ui/Button/AppButton';
import { formatCurrency } from '@utils/formatCurrency';

type StoreProductCardProps = {
  disableNavigation?: boolean;
  onAddToCart?: (product: StoreProduct) => void;
  product: StoreProduct;
};

const productPath = (productId: string) =>
  routePaths.productDetails.replace(':productId', productId);

export const StoreProductCard = ({ disableNavigation = false, onAddToCart, product }: StoreProductCardProps) => {
  const { isFavorite, isToggling, toggleFavorite } = useFavorites();
  const productIsFavorite = isFavorite(product.id);
  const path = productPath(product.id);
  const titleComponent = disableNavigation ? 'span' : Link;
  const imageComponent = disableNavigation ? 'div' : Link;

  return (
    <Card
      sx={{
        borderRadius: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minWidth: 0,
        overflow: 'hidden',
        transition: 'transform 180ms ease, box-shadow 180ms ease',
        width: '100%',
        '&:hover': {
          boxShadow: 8,
          transform: 'translateY(-4px)',
        },
      }}
    >
      <Box sx={{ position: 'relative' }}>
        <Box
          component={imageComponent}
          state={disableNavigation ? undefined : { product }}
          to={disableNavigation ? undefined : path}
          sx={{
            alignItems: 'center',
            background: 'linear-gradient(135deg, rgba(31,111,95,0.12), rgba(247,166,0,0.18))',
            display: 'flex',
            height: 180,
            justifyContent: 'center',
            overflow: 'hidden',
            textDecoration: 'none',
          }}
        >
          {product.imageUrl ? (
            <Box
              alt={product.name}
              component="img"
              loading="lazy"
              src={product.imageUrl}
              sx={{ height: '100%', objectFit: 'cover', width: '100%' }}
            />
          ) : (
            <Stack spacing={1} sx={{ alignItems: 'center', color: 'text.secondary' }}>
              <ImageOutlinedIcon />
              <Typography variant="overline">Image coming soon</Typography>
            </Stack>
          )}
        </Box>
        <IconButton
          aria-label={`${productIsFavorite ? 'Remove' : 'Save'} ${product.name}`}
          disabled={isToggling}
          onClick={() => toggleFavorite(product.id)}
          sx={{
            backgroundColor: alpha('#ffffff', 0.9),
            color: productIsFavorite ? 'primary.main' : 'text.secondary',
            position: 'absolute',
            right: 12,
            top: 12,
            '&:hover': {
              backgroundColor: '#ffffff',
              color: 'primary.main',
            },
          }}
        >
          {productIsFavorite ? <FavoriteRoundedIcon /> : <FavoriteBorderRoundedIcon />}
        </IconButton>
      </Box>
      <CardContent sx={{ display: 'flex', flex: 1, flexDirection: 'column', gap: 2, minWidth: 0 }}>
        <Stack direction="row" spacing={2} sx={{ justifyContent: 'space-between', minWidth: 0 }}>
          <Typography
            component={titleComponent}
            state={disableNavigation ? undefined : { product }}
            sx={{
              color: 'text.primary',
              fontWeight: 700,
              minWidth: 0,
              overflowWrap: 'anywhere',
              textDecoration: 'none',
            }}
            to={disableNavigation ? undefined : path}
            variant="h6"
          >
            {product.name}
          </Typography>
          <Chip color="primary" label={product.tags[0] ?? 'catalog'} size="small" />
        </Stack>
        <Typography color="text.secondary" sx={{ flex: 1 }} variant="body2">
          {product.description}
        </Typography>
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography color="primary.main" sx={{ fontWeight: 700 }} variant="h6">
            {formatCurrency(product.price, product.currency)}
          </Typography>
          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
            <StarRoundedIcon color="warning" fontSize="small" />
            <Typography variant="body2">{product.rating.toFixed(1)}</Typography>
          </Stack>
        </Stack>
        <AppButton
          fullWidth
          startIcon={<AddShoppingCartOutlinedIcon />}
          onClick={() => onAddToCart?.(product)}
          sx={{ mt: 'auto' }}
        >
          Add to Cart
        </AppButton>
      </CardContent>
    </Card>
  );
};

export const StoreProductCardSkeleton = () => (
  <Card
    sx={{
      borderRadius: 1,
      height: '100%',
      minWidth: 0,
      overflow: 'hidden',
      width: '100%',
    }}
  >
    <Box sx={{ height: 180, position: 'relative' }}>
      <Skeleton variant="rounded" width="100%" height="100%" />
      <Skeleton sx={{ position: 'absolute', right: 12, top: 12 }} variant="circular" width={40} height={40} />
    </Box>
    <CardContent sx={{ display: 'grid', gap: 2 }}>
      <Stack direction="row" spacing={2} sx={{ justifyContent: 'space-between' }}>
        <Skeleton variant="text" width="64%" height={32} />
        <Skeleton variant="rounded" width={70} height={24} />
      </Stack>
      <Skeleton variant="text" width="100%" height={22} />
      <Skeleton variant="text" width="76%" height={22} />
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <Skeleton variant="text" width="44%" height={32} />
        <Skeleton variant="text" width={42} height={24} />
      </Stack>
      <Skeleton sx={{ borderRadius: 999 }} variant="rounded" width="100%" height={48} />
    </CardContent>
  </Card>
);
