import { Grid } from '@mui/material';

import type { Product } from '@entities/product/types/product.types';
import { ProductCard } from '@entities/product/ui/ProductCard';

type ProductGridProps = {
  onAddToCart?: (product: Product) => void;
  products: Product[];
};

export const ProductGrid = ({ onAddToCart, products }: ProductGridProps) => (
  <Grid container spacing={3}>
    {products.map((product) => (
      <Grid key={product.id} size={{ lg: 4, md: 6, xs: 12 }}>
        <ProductCard onAddToCart={onAddToCart} product={product} />
      </Grid>
    ))}
  </Grid>
);
