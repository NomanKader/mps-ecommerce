export type Order = {
  createdAt: string;
  currency: string;
  customerName: string;
  id: string;
  itemCount: number;
  orderNumber: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  totalAmount: number;
};
