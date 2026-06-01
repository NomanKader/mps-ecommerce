export interface Category {
  _id: string;
  tenantId: string;
  name: string;
  slug: string;
  parentId?: string;
  icon?: string;
  color?: string;
  itemCount: number;
  subcategories: string[];
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
