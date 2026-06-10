export type AdminProduct = {
  categoryId?: string;
  categoryName?: string;
  currency: string;
  description: string;
  id: string;
  imageUrl?: string;
  name: string;
  price: number;
  rating: number;
  sku: string;
  status: 'draft' | 'active' | 'archived';
  stock: number;
  subcategory?: string;
  tags: string[];
};

export type AdminProductPayload = Omit<AdminProduct, 'id' | 'imageUrl'> & {
  image?: File;
  removeImage?: boolean;
};

export type AdminProductBulkItem = Omit<AdminProductPayload, 'image' | 'removeImage'>;

export type AdminProductBulkPayload = {
  mode: 'upsert' | 'create-only';
  products: AdminProductBulkItem[];
};

export type AdminProductBulkResult = {
  created: number;
  skipped: Array<{
    reason: string;
    row: number;
    sku?: string;
  }>;
  total: number;
  updated: number;
};

export type AdminCategory = {
  color?: string;
  icon?: string;
  id: string;
  itemCount: number;
  name: string;
  slug: string;
  subcategories: string[];
};

export type AdminCategoryPayload = Omit<AdminCategory, 'id'>;

export type AdminOrderStatus =
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'fulfilled'
  | 'cancelled';

export type AdminOrder = {
  createdAt: string;
  currency: string;
  customerEmail?: string;
  customerName: string;
  customerPhone?: string;
  deliveryAddress?: string;
  id: string;
  itemCount: number;
  orderNumber: string;
  placedAt: string;
  paymentMethod?: string;
  region?: string;
  status: AdminOrderStatus;
  totalAmount: number;
  township?: string;
};

export type AdminOrderStats = {
  fulfilled: number;
  netRevenue: number;
  openOrders: number;
};

export type AdminCustomer = {
  email: string;
  id: string;
  lastOrderAt: string;
  name: string;
  orders: number;
  segment: 'VIP' | 'Loyal' | 'New' | 'At Risk';
  totalSpend: number;
};

export type AdminPromotionStatus = 'active' | 'scheduled' | 'expired' | 'paused';

export type AdminPromotion = {
  campaign: string;
  code: string;
  discount: string;
  endsAt: string;
  id: string;
  startsAt: string;
  status: AdminPromotionStatus;
  uses: number;
};

export type AdminPromotionPayload = Omit<AdminPromotion, 'id'>;

export type AdminDeliveryFee = {
  eta: string;
  fee: number;
  freeOver: number;
  id: string;
  region: string;
  status: 'active' | 'paused';
  township: string;
};

export type AdminDeliveryFeePayload = Omit<AdminDeliveryFee, 'id'>;

export type AdminDashboard = {
  inventoryAlerts: Array<{
    id: string;
    name: string;
    sku: string;
    stock: number;
  }>;
  recentOrders: Array<{
    currency: string;
    customerName: string;
    id: string;
    orderNumber: string;
    placedAt: string;
    totalAmount: number;
  }>;
  tenant: {
    name: string;
    plan: string;
  };
  totals: {
    catalogItems: number;
    customers: number;
    orders: number;
    revenue: number;
  };
  weeklySales: Array<{
    day: string;
    sales: number;
  }>;
  workQueue: {
    activePromotions: number;
    lowStockSkus: number;
    ordersToFulfill: number;
  };
};
