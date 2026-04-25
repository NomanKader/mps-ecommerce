import AddShoppingCartOutlinedIcon from '@mui/icons-material/AddShoppingCartOutlined';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import { Box, Card, CardContent, Chip, Stack, Typography } from '@mui/material';

import type { Product } from '@entities/product/types/product.types';
import { AppButton } from '@shared/components/ui/Button/AppButton';
import { formatCurrency } from '@utils/formatCurrency';

type ProductCardProps = {
  onAddToCart?: (product: Product) => void;
  product: Product;
};

export const ProductCard = ({ onAddToCart, product }: ProductCardProps) => (
  <Card
    sx={{
      borderRadius: 4,
      height: '100%',
      transition: 'transform 180ms ease, box-shadow 180ms ease',
      '&:hover': {
        boxShadow: 8,
        transform: 'translateY(-4px)',
      },
    }}
  >
    <Box
      sx={{
        alignItems: 'center',
        background:
          'linear-gradient(135deg, rgba(31,111,95,0.12), rgba(247,166,0,0.18))',
        display: 'flex',
        height: 180,
        justifyContent: 'center',
      }}
    >
      <Typography color="text.secondary" variant="overline">
        Product Visual Placeholder
      </Typography>
    </Box>
    <CardContent sx={{ display: 'grid', gap: 2 }}>
      <Stack direction="row" spacing={2} sx={{ justifyContent: 'space-between' }}>
        <Typography sx={{ fontWeight: 700 }} variant="h6">
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
