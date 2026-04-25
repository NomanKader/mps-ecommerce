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
];
