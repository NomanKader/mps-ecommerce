import AddShoppingCartOutlinedIcon from '@mui/icons-material/AddShoppingCartOutlined';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import { Box, Card, CardContent, Chip, IconButton, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Link } from 'react-router-dom';

import type { Product } from '@entities/product/types/product.types';
import { useFavorites } from '@features/favorites/hooks/useFavorites';
import { routePaths } from '@routes/routePaths';
import { AppButton } from '@shared/components/ui/Button/AppButton';
import { formatCurrency } from '@utils/formatCurrency';

type ProductCardProps = {
  onAddToCart?: (product: Product) => void;
  product: Product;
};

const productPath = (productId: string) =>
  routePaths.productDetails.replace(':productId', productId);

export const ProductCard = ({ onAddToCart, product }: ProductCardProps) => {
  const { isFavorite, isToggling, toggleFavorite } = useFavorites();
  const productIsFavorite = isFavorite(product.id);

  return (
    <Card
      sx={{
        borderRadius: 1,
        height: '100%',
        transition: 'transform 180ms ease, box-shadow 180ms ease',
        '&:hover': {
          boxShadow: 8,
          transform: 'translateY(-4px)',
        },
      }}
    >
      <Box sx={{ position: 'relative' }}>
        <Box
          component={Link}
          to={productPath(product.id)}
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
      <CardContent sx={{ display: 'grid', gap: 2 }}>
        <Stack direction="row" spacing={2} sx={{ justifyContent: 'space-between' }}>
          <Typography
            component={Link}
            sx={{ color: 'text.primary', fontWeight: 700, textDecoration: 'none' }}
            to={productPath(product.id)}
            variant="h6"
          >
            {product.name}
          </Typography>
          <Chip color="primary" label={product.tags[0] ?? 'catalog'} size="small" />
        </Stack>
        <Typography color="text.secondary" variant="body2">
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
        >
          Add to Cart
        </AppButton>
      </CardContent>
    </Card>
  );
};
