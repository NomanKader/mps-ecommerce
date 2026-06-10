export interface Product {
  _id: string;
  tenantId: string;
  name: string;
  sku: string;
  categoryId?: string;
  categoryName?: string;
  subcategory?: string;
  description?: string;
  tags?: string[];
  imageName?: string;
  imageMimeType?: string;
  imageSize?: number;
  imageDriveFileId?: string;
  imageUrl?: string | null;
  price: number;
  currency: string;
  stock: number;
  rating: number;
  status: 'draft' | 'active' | 'archived';
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
