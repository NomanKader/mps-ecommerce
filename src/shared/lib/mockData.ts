import type { Category } from '@entities/category/types/category.types';
import type { Product } from '@entities/product/types/product.types';
import type { Order } from '@entities/order/types/order.types';
import type { Tenant } from '@entities/tenant/types/tenant.types';
import {
  storefrontCategories,
  storefrontCategoryMenuItems,
} from '@features/home/data/homePage.data';

export const mockTenant: Tenant = {
  databaseName: 'tenant_local',
  id: 'AV',
  name: "AV's Store Demo",
  slug: 'av',
  plan: 'growth',
  status: 'active',
  tenantId: 'AV',
  branding: {
    primaryColor: '#e43224',
    secondaryColor: '#ffd326',
    logoUrl: '',
  },
};

const demoCategoryItemCounts: Record<string, number> = {
  bakery: 18,
  care: 44,
  dairy: 31,
  drinks: 54,
  flowers: 22,
  frozen: 49,
  fruits: 42,
  gifts: 16,
  home: 38,
  kids: 27,
  meat: 33,
  pantry: 67,
  pets: 19,
  'quick-meals': 36,
  seafood: 24,
  vegetables: 58,
};

export const mockCategories: Category[] = storefrontCategories.map((category) => ({
  color: category.color,
  icon: category.icon,
  id: category.id,
  itemCount: demoCategoryItemCounts[category.id] ?? 0,
  name: category.label,
  slug: category.id,
  subcategories: (storefrontCategoryMenuItems[category.id] ?? []).map((subcategory) => ({
    icon: subcategory.icon,
    id: `${category.id}-${subcategory.label.toLowerCase().replaceAll('&', 'and').replaceAll(' ', '-')}`,
    name: subcategory.label,
    slug: subcategory.label.toLowerCase().replaceAll('&', 'and').replaceAll(' ', '-'),
  })),
}));

export const mockProducts: Product[] = [
  {
    id: 'prd-1',
    sku: 'APL-GRN-001',
    name: 'Premium Green Apples',
    slug: 'premium-green-apples',
    description: 'Crisp imported apples curated for premium storefront merchandising.',
    price: 8500,
    currency: 'MMK',
    categoryId: 'fruits',
    inventory: 120,
    imageUrl: '',
    tenantId: 'AV',
    tags: ['fresh', 'featured'],
    rating: 4.8,
  },
  {
    id: 'prd-2',
    sku: 'ORG-BRD-002',
    name: 'Artisan Sourdough Loaf',
    slug: 'artisan-sourdough-loaf',
    description: 'A bakery staple ready for catalogue, promotion, and availability rules.',
    price: 5300,
    currency: 'MMK',
    categoryId: 'bakery',
    inventory: 37,
    imageUrl: '',
    tenantId: 'AV',
    tags: ['bakery'],
    rating: 4.6,
  },
  {
    id: 'prd-3',
    sku: 'PNTR-RCE-003',
    name: 'Organic Basmati Rice',
    slug: 'organic-basmati-rice',
    description: 'Structured for pricing, stock, promotions, and future tenant overrides.',
    price: 13000,
    currency: 'MMK',
    categoryId: 'pantry',
    inventory: 74,
    imageUrl: '',
    tenantId: 'AV',
    tags: ['pantry', 'organic'],
    rating: 4.9,
  },
  {
    id: 'prd-4',
    sku: 'DRY-MLK-004',
    name: 'Farm Fresh Whole Milk',
    slug: 'farm-fresh-whole-milk',
    description: 'Daily chilled dairy item with replenishment and expiration tracking.',
    price: 4300,
    currency: 'MMK',
    categoryId: 'dairy',
    inventory: 18,
    imageUrl: '',
    tenantId: 'AV',
    tags: ['dairy', 'low-stock'],
    rating: 4.5,
  },
  {
    id: 'prd-5',
    sku: 'BVG-JCE-005',
    name: 'Cold Pressed Orange Juice',
    slug: 'cold-pressed-orange-juice',
    description: 'Premium beverage for homepage features and breakfast bundles.',
    price: 6800,
    currency: 'MMK',
    categoryId: 'drinks',
    inventory: 58,
    imageUrl: '',
    tenantId: 'AV',
    tags: ['beverage', 'featured'],
    rating: 4.7,
  },
];

export const mockOrders: Order[] = [
  {
    customerEmail: 'ayesha@example.com',
    id: 'ord-1',
    orderNumber: 'AVS-1001',
    customerName: 'Ayesha Rahman',
    customerPhone: '+95 9 421 100 101',
    deliveryAddress: 'No. 25, Inya Road, Kamayut',
    paymentMethod: 'Card',
    totalAmount: 86400,
    currency: 'MMK',
    status: 'processing',
    createdAt: '2026-04-18T10:30:00Z',
    itemCount: 6,
    region: 'Yangon',
    township: 'Kamayut',
  },
  {
    customerEmail: 'jared@example.com',
    id: 'ord-2',
    orderNumber: 'AVS-1002',
    customerName: 'Jared Walsh',
    customerPhone: '+95 9 421 100 102',
    deliveryAddress: 'Building 4, Strand Road, Kyauktada',
    paymentMethod: 'Cash on delivery',
    totalAmount: 42200,
    currency: 'MMK',
    status: 'delivered',
    createdAt: '2026-04-19T08:15:00Z',
    itemCount: 3,
    region: 'Yangon',
    township: 'Kyauktada',
  },
  {
    customerEmail: 'minthu@example.com',
    id: 'ord-3',
    orderNumber: 'AVS-1003',
    customerName: 'Min Thu',
    customerPhone: '+95 9 421 100 103',
    deliveryAddress: '63rd Street, Chanayethazan',
    paymentMethod: 'KBZPay',
    totalAmount: 128900,
    currency: 'MMK',
    status: 'shipped',
    createdAt: '2026-04-20T14:45:00Z',
    itemCount: 9,
    region: 'Mandalay',
    township: 'Chanayethazan',
  },
  {
    customerEmail: 'leah@example.com',
    id: 'ord-4',
    orderNumber: 'AVS-1004',
    customerName: 'Leah Carter',
    customerPhone: '+95 9 421 100 104',
    deliveryAddress: 'Bogyoke Road, Taunggyi',
    paymentMethod: 'Cash on delivery',
    totalAmount: 23800,
    currency: 'MMK',
    status: 'pending',
    createdAt: '2026-04-21T09:20:00Z',
    itemCount: 2,
    region: 'Shan',
    township: 'Taunggyi',
  },
  {
    customerEmail: 'omar@example.com',
    id: 'ord-5',
    orderNumber: 'AVS-1005',
    customerName: 'Omar Saleh',
    customerPhone: '+95 9 421 100 105',
    deliveryAddress: 'Lower Main Road, Mawlamyine',
    paymentMethod: 'AYA Pay',
    totalAmount: 64300,
    currency: 'MMK',
    status: 'cancelled',
    createdAt: '2026-04-22T16:10:00Z',
    itemCount: 5,
    region: 'Mon',
    township: 'Mawlamyine',
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
    totalSpend: 1482200,
  },
  {
    email: 'jared@example.com',
    id: 'cus-2',
    joinedAt: '2026-01-06T08:00:00Z',
    lastOrderAt: '2026-04-19T08:15:00Z',
    name: 'Jared Walsh',
    orders: 7,
    segment: 'Loyal',
    totalSpend: 422800,
  },
  {
    email: 'minthu@example.com',
    id: 'cus-3',
    joinedAt: '2026-03-28T08:00:00Z',
    lastOrderAt: '2026-04-20T14:45:00Z',
    name: 'Min Thu',
    orders: 3,
    segment: 'New',
    totalSpend: 238900,
  },
  {
    email: 'leah@example.com',
    id: 'cus-4',
    joinedAt: '2025-08-19T08:00:00Z',
    lastOrderAt: '2026-02-24T12:00:00Z',
    name: 'Leah Carter',
    orders: 11,
    segment: 'At Risk',
    totalSpend: 694400,
  },
];

export type DemoPromotion = {
  code: string;
  discount: string;
  endsAt: string;
  id: string;
  name: string;
  redemptions: number;
  startsAt: string;
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
    startsAt: '2026-04-10T00:00:00Z',
    status: 'Active',
  },
  {
    code: 'BAKERY2X',
    discount: 'Buy 2 bakery items, save 3,000 MMK',
    endsAt: '2026-05-01T23:59:00Z',
    id: 'promo-2',
    name: 'Weekend bakery bundle',
    redemptions: 31,
    startsAt: '2026-04-25T00:00:00Z',
    status: 'Scheduled',
  },
  {
    code: 'VIPDELIVERY',
    discount: 'Free delivery for VIP customers',
    endsAt: '2026-06-30T23:59:00Z',
    id: 'promo-3',
    name: 'VIP delivery reward',
    redemptions: 142,
    startsAt: '2026-04-01T00:00:00Z',
    status: 'Active',
  },
];
