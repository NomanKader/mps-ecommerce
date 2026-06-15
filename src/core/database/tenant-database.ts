import mongoose, { Connection, Model } from 'mongoose';

import {
  AdminCustomer,
  customerSchema,
  DeliveryFee,
  deliveryFeeSchema,
  Promotion,
  promotionSchema,
  Region,
  regionSchema,
  SecondaryCategory,
  secondaryCategorySchema,
  StorefrontCarouselSlide,
  carouselSlideSchema,
  StorefrontHighlightIcon,
  highlightIconSchema,
  StorefrontProductSectionAssignment,
  productSectionAssignmentSchema,
  TenantAdminSettings,
  tenantAdminSettingsSchema,
  Township,
  townshipSchema
} from '@modules/admin/admin.models';
import { phoneOtpSchema, PhoneOtp } from '@modules/auth/phone-otp.model';
import { cartSchema } from '@modules/carts/cart.model';
import { Cart } from '@modules/carts/cart.types';
import { categorySchema } from '@modules/categories/category.model';
import { Category } from '@modules/categories/category.types';
import { orderSchema } from '@modules/orders/order.model';
import { Order } from '@modules/orders/order.types';
import { productSchema } from '@modules/products/product.model';
import { Product } from '@modules/products/product.types';
import { userSchema } from '@modules/users/user.model';
import { User } from '@modules/users/user.types';

export type TenantModels = {
  UserModel: Model<User>;
  ProductModel: Model<Product>;
  CategoryModel: Model<Category>;
  OrderModel: Model<Order>;
  CartModel: Model<Cart>;
  PhoneOtpModel: Model<PhoneOtp>;
  AdminCustomerModel: Model<AdminCustomer>;
  PromotionModel: Model<Promotion>;
  DeliveryFeeModel: Model<DeliveryFee>;
  RegionModel: Model<Region>;
  TownshipModel: Model<Township>;
  TenantAdminSettingsModel: Model<TenantAdminSettings>;
  StorefrontCarouselSlideModel: Model<StorefrontCarouselSlide>;
  StorefrontHighlightIconModel: Model<StorefrontHighlightIcon>;
  SecondaryCategoryModel: Model<SecondaryCategory>;
  StorefrontProductSectionAssignmentModel: Model<StorefrontProductSectionAssignment>;
};

const tenantModelCache = new Map<string, TenantModels>();
const tenantDatabaseAliases = new Map<string, string>();

export const registerTenantDatabaseAlias = (tenantId: string, tenantSlug: string): void => {
  tenantDatabaseAliases.set(tenantId, tenantSlug);
};

export const tenantDatabaseName = (tenantSlug: string): string => {
  const databaseKey = tenantDatabaseAliases.get(tenantSlug) ?? tenantSlug;
  const safeTenantId = databaseKey
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '_')
    .replace(/^[_-]+|[_-]+$/g, '');

  return `tenant_${safeTenantId}`;
};

export const getTenantConnection = (tenantSlug: string): Connection =>
  mongoose.connection.useDb(tenantDatabaseName(tenantSlug), { useCache: true });

export const getTenantModels = (tenantSlug: string): TenantModels => {
  const databaseName = tenantDatabaseName(tenantSlug);
  const cached = tenantModelCache.get(databaseName);
  if (cached) return cached;

  const connection = getTenantConnection(tenantSlug);
  const models: TenantModels = {
    UserModel: connection.model<User>('User', userSchema, 'users'),
    ProductModel: connection.model<Product>('Product', productSchema, 'products'),
    CategoryModel: connection.model<Category>('Category', categorySchema, 'categories'),
    OrderModel: connection.model<Order>('Order', orderSchema, 'orders'),
    CartModel: connection.model<Cart>('Cart', cartSchema, 'carts'),
    PhoneOtpModel: connection.model<PhoneOtp>('PhoneOtp', phoneOtpSchema, 'phone_otps'),
    AdminCustomerModel: connection.model<AdminCustomer>(
      'AdminCustomer',
      customerSchema,
      'admin_customers'
    ),
    PromotionModel: connection.model<Promotion>('Promotion', promotionSchema, 'promotions'),
    DeliveryFeeModel: connection.model<DeliveryFee>(
      'DeliveryFee',
      deliveryFeeSchema,
      'delivery_fees'
    ),
    RegionModel: connection.model<Region>('Region', regionSchema, 'regions'),
    TownshipModel: connection.model<Township>('Township', townshipSchema, 'townships'),
    TenantAdminSettingsModel: connection.model<TenantAdminSettings>(
      'TenantAdminSettings',
      tenantAdminSettingsSchema,
      'tenant_admin_settings'
    ),
    StorefrontCarouselSlideModel: connection.model<StorefrontCarouselSlide>(
      'StorefrontCarouselSlide',
      carouselSlideSchema,
      'storefront_carousel_slides'
    ),
    StorefrontHighlightIconModel: connection.model<StorefrontHighlightIcon>(
      'StorefrontHighlightIcon',
      highlightIconSchema,
      'storefront_highlight_icons'
    ),
    SecondaryCategoryModel: connection.model<SecondaryCategory>(
      'SecondaryCategory',
      secondaryCategorySchema,
      'secondary_categories'
    ),
    StorefrontProductSectionAssignmentModel: connection.model<StorefrontProductSectionAssignment>(
      'StorefrontProductSectionAssignment',
      productSectionAssignmentSchema,
      'storefront_product_section_assignments'
    )
  };

  tenantModelCache.set(databaseName, models);
  return models;
};

const dropConflictingTenantAdminSettingsIndex = async (tenantSlug: string): Promise<void> => {
  const connection = getTenantConnection(tenantSlug);
  const collection = connection.collection('tenant_admin_settings');
  const indexes = await collection.indexes().catch(() => []);
  const tenantIdIndex = indexes.find((index) => index.name === 'tenantId_1');

  if (tenantIdIndex && !tenantIdIndex.unique) {
    await collection.dropIndex('tenantId_1');
  }
};

export const initializeTenantDatabase = async (tenantSlug: string): Promise<void> => {
  await dropConflictingTenantAdminSettingsIndex(tenantSlug);
  const models = getTenantModels(tenantSlug);
  await Promise.all(Object.values(models).map((model) => model.init()));
};
