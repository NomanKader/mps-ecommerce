import { endpoints } from '@shared/api/endpoints';
import { mockProducts } from '@shared/lib/mockData';

import type { Product } from '@entities/product/types/product.types';

export const productApi = {
  async getProductById(productId: string): Promise<Product | undefined> {
    void endpoints.products.details(productId);

    return Promise.resolve(mockProducts.find((product) => product.id === productId));
  },
  async getProducts(): Promise<Product[]> {
    void endpoints.products.list;

    return Promise.resolve(mockProducts);
  },
};
