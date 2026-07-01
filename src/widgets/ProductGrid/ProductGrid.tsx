import { Grid, type GridSize } from '@mui/material';

import type { Product } from '@entities/product/types/product.types';
import { ProductCard } from '@entities/product/ui/ProductCard';

type ProductGridProps = {
  gridSize?: {
    lg?: GridSize;
    md?: GridSize;
    sm?: GridSize;
    xs?: GridSize;
  };
  onAddToCart?: (product: Product) => void;
  products: Product[];
};

export const ProductGrid = ({
  gridSize = { lg: 2.4, md: 4, sm: 6, xs: 12 },
  onAddToCart,
  products,
}: ProductGridProps) => (
  <Grid container spacing={3}>
    {products.map((product) => (
      <Grid key={product.id} size={gridSize} sx={{ display: 'flex' }}>
        <ProductCard onAddToCart={onAddToCart} product={product} />
      </Grid>
    ))}
  </Grid>
);
