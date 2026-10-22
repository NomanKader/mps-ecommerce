import type { Product } from '@entities/product/types/product.types';

export type CartItem = {
  message?: string;
  product: Product;
  quantity: number;
};
