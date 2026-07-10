export type Product = {
  categoryId: string;
  categoryName?: string;
  currency: string;
  description: string;
  id: string;
  imageUrl: string;
  inventory: number;
  name: string;
  price: number;
  rating: number;
  sku: string;
  slug: string;
  subcategory?: string;
  tags: string[];
  tenantId: string;
};
