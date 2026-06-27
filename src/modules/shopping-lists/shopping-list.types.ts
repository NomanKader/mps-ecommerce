export interface ShoppingList {
  _id: string;
  tenantId: string;
  userId: string;
  name: string;
  productIds: string[];
  createdAt: Date;
  updatedAt: Date;
}
