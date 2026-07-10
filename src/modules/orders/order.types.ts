export type OrderPaymentMethod = 'wallet' | 'cash_on_delivery';
export type OrderPaymentStatus = 'paid' | 'pending';

export interface OrderLineItem {
  categoryId?: string;
  categoryName?: string;
  imageUrl?: string;
  lineTotal: number;
  name: string;
  productId: string;
  quantity: number;
  sku: string;
  subcategory?: string;
  unitPrice: number;
}

export interface Order {
  _id: string;
  tenantId: string;
  userId: string;
  orderNumber: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  city?: string;
  categoryIds: string[];
  deliveryAddress?: string;
  paymentMethod: OrderPaymentMethod;
  paymentStatus: OrderPaymentStatus;
  subtotalAmount: number;
  deliveryFee: number;
  region?: string;
  township?: string;
  itemCount?: number;
  itemsCount: number;
  lineItems: OrderLineItem[];
  productIds: string[];
  subcategories: string[];
  totalAmount: number;
  currency: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'fulfilled' | 'cancelled';
  placedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
