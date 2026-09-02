export type OrderLineItem = {
  imageUrl?: string;
  lineTotal: number;
  name: string;
  productId: string;
  quantity: number;
  sku: string;
  unitPrice: number;
};

export type OrderProductSummary = {
  imageUrl?: string;
  name: string;
  productId: string;
  sku: string;
};

export type Order = {
  city?: string;
  customerEmail?: string;
  customerPhone?: string;
  createdAt: string;
  currency: string;
  customerName: string;
  deliveryAddress?: string;
  deliveryFee?: number;
  paymentGateway?: string;
  paymentGatewayStatus?: string;
  paymentMethod?: string;
  paymentRedirectUrl?: string;
  paymentStatus?: 'paid' | 'pending' | 'failed' | 'expired' | 'timeout';
  paymentToken?: string;
  id: string;
  itemCount: number;
  lineItems?: OrderLineItem[];
  orderNumber: string;
  productDetails?: OrderProductSummary[];
  region?: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'fulfilled' | 'cancelled';
  subtotalAmount?: number;
  township?: string;
  totalAmount: number;
};
