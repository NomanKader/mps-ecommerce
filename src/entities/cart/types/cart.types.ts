import type { Product } from '@entities/product/types/product.types';

export type CartItem = {
  product: Product;
  quantity: number;
};
