import { pantryProducts, seasonalProducts, topBlooms, topOffers } from '@features/home/data/homePage.data';
import type { StoreProduct } from '@features/home/types/home.types';

export const allStorefrontProducts: StoreProduct[] = [
  ...topOffers,
  ...seasonalProducts,
  ...pantryProducts,
  ...topBlooms,
];

export const findStorefrontProductById = (productId: string) =>
  allStorefrontProducts.find((product) => product.id === productId);

export const getRelatedStorefrontProducts = (product: StoreProduct, limit = 4) =>
  allStorefrontProducts.filter((item) => item.categoryId === product.categoryId && item.id !== product.id).slice(0, limit);
