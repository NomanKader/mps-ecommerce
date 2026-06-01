export interface Product {
  _id: string;
  tenantId: string;
  name: string;
  sku: string;
  categoryId?: string;
  categoryName?: string;
  description?: string;
  tags?: string[];
  price: number;
  currency: string;
  stock: number;
  rating: number;
  status: 'draft' | 'active' | 'archived';
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
