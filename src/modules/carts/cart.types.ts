export interface CartItem {
  productId: string;
  quantity: number;
}

export interface Cart {
  _id: string;
  tenantId: string;
  userId: string;
  items: CartItem[];
  status: 'active' | 'abandoned' | 'converted';
  createdAt: Date;
  updatedAt: Date;
}
