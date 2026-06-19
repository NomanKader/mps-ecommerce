import type { Product } from '@entities/product/types/product.types';
import { apiClient } from '@shared/api/axios';
import { endpoints } from '@shared/api/endpoints';
import type { ApiResponse } from '../../../types/api';

type BackendProduct = Omit<
  Product,
  'description' | 'id' | 'inventory' | 'imageUrl' | 'slug' | 'tags'
> & {
  _id: string;
  description?: string;
  imageUrl?: string | null;
  isDeleted?: boolean;
  stock: number;
  slug?: string;
  tags?: string[];
};

type ListOptions = { signal?: globalThis.AbortSignal };

const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const mapProduct = ({ _id, stock, imageUrl, slug, ...product }: BackendProduct): Product => ({
  ...product,
  description: product.description ?? '',
  id: _id,
  imageUrl: imageUrl ?? '',
  inventory: stock,
  slug: slug ?? slugify(product.name),
  tags: product.tags ?? [],
});

export const productApi = {
  async getProductById(productId: string, options: ListOptions = {}): Promise<Product | undefined> {
    const response = await apiClient.get<ApiResponse<BackendProduct>>(
      endpoints.products.details(productId),
      { signal: options.signal },
    );

    return mapProduct(response.data.data);
  },
  async getProducts(options: ListOptions = {}): Promise<Product[]> {
    const response = await apiClient.get<ApiResponse<BackendProduct[]>>(endpoints.products.list, {
      signal: options.signal,
    });

    return response.data.data.map(mapProduct);
  },
};
