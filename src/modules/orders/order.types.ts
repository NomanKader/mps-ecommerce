export type OrderPaymentMethod = 'wallet' | 'cash_on_delivery' | 'mopayments';
export type OrderPaymentStatus = 'paid' | 'pending' | 'failed' | 'expired' | 'timeout';

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

export interface OrderProductSummary {
  imageUrl?: string;
  name: string;
  productId: string;
  sku: string;
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
  paymentGateway?: string;
  paymentGatewayReferenceId?: string;
  paymentGatewayStatus?: string;
  paymentRedirectUrl?: string;
  paymentSettlementAmount?: number;
  paymentToken?: string;
  paymentTokenExpiresAt?: Date;
  paymentTransactionAmount?: number;
  subtotalAmount: number;
  deliveryFee: number;
  region?: string;
  township?: string;
  itemCount?: number;
  itemsCount: number;
  lineItems: OrderLineItem[];
  productIds: string[];
  productDetails?: OrderProductSummary[];
  subcategories: string[];
  totalAmount: number;
  currency: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'fulfilled' | 'cancelled';
  placedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
