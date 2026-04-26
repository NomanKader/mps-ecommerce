import type { Category } from '@entities/category/types/category.types';
import type { Product } from '@entities/product/types/product.types';
import type { Order } from '@entities/order/types/order.types';
import type { Tenant } from '@entities/tenant/types/tenant.types';

export const mockTenant: Tenant = {
  id: 'tenant-demo',
  name: 'MPS Demo Grocer',
  slug: 'demo-tenant',
  plan: 'growth',
  status: 'active',
  branding: {
    primaryColor: '#1f6f5f',
    secondaryColor: '#f7a600',
    logoUrl: '',
  },
};

export const mockCategories: Category[] = [
  { id: 'cat-1', name: 'Fresh Produce', slug: 'fresh-produce', itemCount: 42 },
  { id: 'cat-2', name: 'Bakery', slug: 'bakery', itemCount: 18 },
  { id: 'cat-3', name: 'Pantry', slug: 'pantry', itemCount: 67 },
  { id: 'cat-4', name: 'Dairy & Eggs', slug: 'dairy-eggs', itemCount: 31 },
  { id: 'cat-5', name: 'Beverages', slug: 'beverages', itemCount: 54 },
];

export const mockProducts: Product[] = [
  {
    id: 'prd-1',
    sku: 'APL-GRN-001',
    name: 'Premium Green Apples',
    slug: 'premium-green-apples',
    description: 'Crisp imported apples curated for premium storefront merchandising.',
    price: 8.5,
    currency: 'USD',
    categoryId: 'cat-1',
    inventory: 120,
    imageUrl: '',
    tenantId: 'tenant-demo',
    tags: ['fresh', 'featured'],
    rating: 4.8,
  },
  {
    id: 'prd-2',
    sku: 'ORG-BRD-002',
    name: 'Artisan Sourdough Loaf',
    slug: 'artisan-sourdough-loaf',
    description: 'A bakery staple ready for catalogue, promotion, and availability rules.',
    price: 5.25,
    currency: 'USD',
    categoryId: 'cat-2',
    inventory: 37,
    imageUrl: '',
    tenantId: 'tenant-demo',
    tags: ['bakery'],
    rating: 4.6,
  },
  {
    id: 'prd-3',
    sku: 'PNTR-RCE-003',
    name: 'Organic Basmati Rice',
    slug: 'organic-basmati-rice',
    description: 'Structured for pricing, stock, promotions, and future tenant overrides.',
    price: 12.99,
    currency: 'USD',
    categoryId: 'cat-3',
    inventory: 74,
    imageUrl: '',
    tenantId: 'tenant-demo',
    tags: ['pantry', 'organic'],
    rating: 4.9,
  },
  {
    id: 'prd-4',
    sku: 'DRY-MLK-004',
    name: 'Farm Fresh Whole Milk',
    slug: 'farm-fresh-whole-milk',
    description: 'Daily chilled dairy item with replenishment and expiration tracking.',
    price: 4.25,
    currency: 'USD',
    categoryId: 'cat-4',
    inventory: 18,
    imageUrl: '',
    tenantId: 'tenant-demo',
    tags: ['dairy', 'low-stock'],
    rating: 4.5,
  },
  {
    id: 'prd-5',
    sku: 'BVG-JCE-005',
    name: 'Cold Pressed Orange Juice',
    slug: 'cold-pressed-orange-juice',
    description: 'Premium beverage for homepage features and breakfast bundles.',
    price: 6.75,
    currency: 'USD',
    categoryId: 'cat-5',
    inventory: 58,
    imageUrl: '',
    tenantId: 'tenant-demo',
    tags: ['beverage', 'featured'],
    rating: 4.7,
  },
];

export const mockOrders: Order[] = [
  {
    id: 'ord-1',
    orderNumber: 'MPS-1001',
    customerName: 'Ayesha Rahman',
    totalAmount: 86.4,
    currency: 'USD',
    status: 'processing',
    createdAt: '2026-04-18T10:30:00Z',
    itemCount: 6,
  },
  {
    id: 'ord-2',
    orderNumber: 'MPS-1002',
    customerName: 'Jared Walsh',
    totalAmount: 42.15,
    currency: 'USD',
    status: 'delivered',
    createdAt: '2026-04-19T08:15:00Z',
    itemCount: 3,
  },
  {
    id: 'ord-3',
    orderNumber: 'MPS-1003',
    customerName: 'Min Thu',
    totalAmount: 128.9,
    currency: 'USD',
    status: 'shipped',
    createdAt: '2026-04-20T14:45:00Z',
    itemCount: 9,
  },
  {
    id: 'ord-4',
    orderNumber: 'MPS-1004',
    customerName: 'Leah Carter',
    totalAmount: 23.8,
    currency: 'USD',
    status: 'pending',
    createdAt: '2026-04-21T09:20:00Z',
    itemCount: 2,
  },
  {
    id: 'ord-5',
    orderNumber: 'MPS-1005',
    customerName: 'Omar Saleh',
    totalAmount: 64.35,
    currency: 'USD',
    status: 'cancelled',
    createdAt: '2026-04-22T16:10:00Z',
    itemCount: 5,
  },
];

export type DemoCustomer = {
  email: string;
  id: string;
  joinedAt: string;
  lastOrderAt: string;
  name: string;
  orders: number;
  segment: 'Loyal' | 'New' | 'At Risk' | 'VIP';
  totalSpend: number;
};

export const mockCustomers: DemoCustomer[] = [
  {
    email: 'ayesha@example.com',
    id: 'cus-1',
    joinedAt: '2025-11-12T08:00:00Z',
    lastOrderAt: '2026-04-18T10:30:00Z',
    name: 'Ayesha Rahman',
    orders: 18,
    segment: 'VIP',
    totalSpend: 1482.2,
  },
  {
    email: 'jared@example.com',
    id: 'cus-2',
    joinedAt: '2026-01-06T08:00:00Z',
    lastOrderAt: '2026-04-19T08:15:00Z',
    name: 'Jared Walsh',
    orders: 7,
    segment: 'Loyal',
    totalSpend: 422.75,
  },
  {
    email: 'minthu@example.com',
    id: 'cus-3',
    joinedAt: '2026-03-28T08:00:00Z',
    lastOrderAt: '2026-04-20T14:45:00Z',
    name: 'Min Thu',
    orders: 3,
    segment: 'New',
    totalSpend: 238.9,
  },
  {
    email: 'leah@example.com',
    id: 'cus-4',
    joinedAt: '2025-08-19T08:00:00Z',
    lastOrderAt: '2026-02-24T12:00:00Z',
    name: 'Leah Carter',
    orders: 11,
    segment: 'At Risk',
    totalSpend: 694.4,
  },
];

export type DemoPromotion = {
  code: string;
  discount: string;
  endsAt: string;
  id: string;
  name: string;
  redemptions: number;
  status: 'Active' | 'Scheduled' | 'Paused';
};

export const mockPromotions: DemoPromotion[] = [
  {
    code: 'FRESH15',
    discount: '15% off produce',
    endsAt: '2026-05-10T23:59:00Z',
    id: 'promo-1',
    name: 'Fresh basket booster',
    redemptions: 86,
    status: 'Active',
  },
  {
    code: 'BAKERY2X',
    discount: 'Buy 2 bakery items, save $3',
    endsAt: '2026-05-01T23:59:00Z',
    id: 'promo-2',
    name: 'Weekend bakery bundle',
    redemptions: 31,
    status: 'Scheduled',
  },
  {
    code: 'VIPDELIVERY',
    discount: 'Free delivery for VIP customers',
    endsAt: '2026-06-30T23:59:00Z',
    id: 'promo-3',
    name: 'VIP delivery reward',
    redemptions: 142,
    status: 'Active',
  },
];
