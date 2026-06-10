export interface Order {
  _id: string;
  tenantId: string;
  userId: string;
  orderNumber: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  deliveryAddress?: string;
  region?: string;
  township?: string;
  itemCount?: number;
  itemsCount: number;
  totalAmount: number;
  currency: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'fulfilled' | 'cancelled';
  placedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
