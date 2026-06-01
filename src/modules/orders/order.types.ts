export interface Order {
  _id: string;
  tenantId: string;
  userId: string;
  orderNumber: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  township?: string;
  itemsCount: number;
  totalAmount: number;
  currency: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'fulfilled' | 'cancelled';
  placedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
