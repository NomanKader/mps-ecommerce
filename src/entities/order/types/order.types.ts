export type Order = {
  customerEmail?: string;
  customerPhone?: string;
  createdAt: string;
  currency: string;
  customerName: string;
  deliveryAddress?: string;
  paymentMethod?: string;
  id: string;
  itemCount: number;
  orderNumber: string;
  region?: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'fulfilled' | 'cancelled';
  township?: string;
  totalAmount: number;
};
