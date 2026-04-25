import type { Product } from '@entities/product/types/product.types';
import type { StoreProduct } from '@features/home/types/home.types';

export const mapHomeProductToProduct = (product: StoreProduct): Product => ({
  categoryId: product.categoryId,
  currency: product.currency,
  description: product.description,
  id: product.id,
  imageUrl: product.imageUrl,
  inventory: product.inventory,
  name: product.name,
  price: product.price,
  rating: product.rating,
  sku: product.sku,
  slug: product.slug,
  tags: product.tags,
  tenantId: product.tenantId,
});
