import { model, Schema } from 'mongoose';

import { addSoftDeleteFields, baseSchemaOptions } from '@core/database/base.schema';

export interface AdminCustomer {
  _id: string;
  tenantId: string;
  name: string;
  email: string;
  segment: 'VIP' | 'Loyal' | 'New' | 'At Risk';
  orders: number;
  totalSpend: number;
  lastOrderAt: Date;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Promotion {
  _id: string;
  tenantId: string;
  campaign: string;
  code: string;
  discount: string;
  startsAt: Date;
  endsAt: Date;
  status: 'active' | 'scheduled' | 'expired' | 'paused';
  uses: number;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface DeliveryFee {
  _id: string;
  tenantId: string;
  region: string;
  township: string;
  fee: number;
  freeOver: number;
  eta: string;
  status: 'active' | 'paused';
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TenantAdminSettings {
  _id: string;
  tenantId: string;
  deliveryHeadline: string;
  supportPhoneCountryCode: string;
  supportPhoneNumber: string;
  topBarTagline: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface StorefrontCarouselSlide {
  _id: string;
  tenantId: string;
  placement: 'hero' | 'showcase';
  title?: string;
  description?: string;
  eyebrow?: string;
  cta?: string;
  imageName?: string;
  imageMimeType?: string;
  imageSize?: number;
  imageDriveFileId?: string;
  imageUrl?: string | null;
  metric?: string;
  headline?: string;
  partner?: string;
  targetCategoryId?: string;
  targetSearch?: string;
  sortOrder: number;
  status: 'active' | 'draft' | 'scheduled';
  startsAt?: Date;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface StorefrontHighlightIcon {
  _id: string;
  tenantId: string;
  section: 'featured' | 'merchandising';
  label: string;
  icon: string;
  color?: string;
  surfaceColor?: string;
  textColor?: string;
  targetCategoryId?: string;
  targetSearch?: string;
  sortOrder: number;
  status: 'active' | 'hidden';
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface StorefrontProductSectionAssignment {
  _id: string;
  tenantId: string;
  sectionId: 'top-offers' | 'top-blooms' | 'new-season' | 'pantry-ready';
  productId: string;
  sortOrder: number;
  status: 'active' | 'hidden';
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const customerSchema = new Schema<AdminCustomer>(
  {
    tenantId: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    segment: { type: String, enum: ['VIP', 'Loyal', 'New', 'At Risk'], default: 'New', index: true },
    orders: { type: Number, default: 0, min: 0 },
    totalSpend: { type: Number, default: 0, min: 0 },
    lastOrderAt: { type: Date, default: Date.now, index: true }
  },
  baseSchemaOptions
);

const promotionSchema = new Schema<Promotion>(
  {
    tenantId: { type: String, required: true, index: true },
    campaign: { type: String, required: true, trim: true },
    code: { type: String, required: true, trim: true, uppercase: true, index: true },
    discount: { type: String, required: true, trim: true },
    startsAt: { type: Date, required: true, index: true },
    endsAt: { type: Date, required: true, index: true },
    status: { type: String, enum: ['active', 'scheduled', 'expired', 'paused'], default: 'active', index: true },
    uses: { type: Number, default: 0, min: 0 }
  },
  baseSchemaOptions
);

const deliveryFeeSchema = new Schema<DeliveryFee>(
  {
    tenantId: { type: String, required: true, index: true },
    region: { type: String, required: true, trim: true, index: true },
    township: { type: String, required: true, trim: true },
    fee: { type: Number, required: true, min: 0 },
    freeOver: { type: Number, default: 0, min: 0 },
    eta: { type: String, required: true, trim: true },
    status: { type: String, enum: ['active', 'paused'], default: 'active', index: true }
  },
  baseSchemaOptions
);

const tenantAdminSettingsSchema = new Schema<TenantAdminSettings>(
  {
    tenantId: { type: String, required: true, index: true },
    deliveryHeadline: { type: String, required: true, trim: true, default: 'Delivery all over UAE' },
    supportPhoneCountryCode: { type: String, required: true, trim: true, default: '+971' },
    supportPhoneNumber: { type: String, required: true, trim: true, default: '800 287' },
    topBarTagline: { type: String, required: true, trim: true, default: 'Sustainable Grocery Shopping' }
  },
  baseSchemaOptions
);

const carouselSlideSchema = new Schema<StorefrontCarouselSlide>(
  {
    tenantId: { type: String, required: true, index: true },
    placement: { type: String, enum: ['hero', 'showcase'], required: true, index: true },
    title: { type: String, trim: true },
    description: { type: String, trim: true },
    eyebrow: { type: String, trim: true },
    cta: { type: String, trim: true },
    imageName: { type: String },
    imageMimeType: { type: String },
    imageSize: { type: Number, min: 0 },
    imageDriveFileId: { type: String },
    metric: { type: String, trim: true },
    headline: { type: String, trim: true },
    partner: { type: String, trim: true },
    targetCategoryId: { type: String, trim: true },
    targetSearch: { type: String, trim: true },
    sortOrder: { type: Number, default: 0, index: true },
    status: { type: String, enum: ['active', 'draft', 'scheduled'], default: 'draft', index: true },
    startsAt: { type: Date, index: true }
  },
  baseSchemaOptions
);

const highlightIconSchema = new Schema<StorefrontHighlightIcon>(
  {
    tenantId: { type: String, required: true, index: true },
    section: { type: String, enum: ['featured', 'merchandising'], required: true, index: true },
    label: { type: String, required: true, trim: true },
    icon: { type: String, required: true, trim: true },
    color: { type: String, trim: true },
    surfaceColor: { type: String, trim: true },
    textColor: { type: String, trim: true },
    targetCategoryId: { type: String, trim: true },
    targetSearch: { type: String, trim: true },
    sortOrder: { type: Number, default: 0, index: true },
    status: { type: String, enum: ['active', 'hidden'], default: 'active', index: true }
  },
  baseSchemaOptions
);

const productSectionAssignmentSchema = new Schema<StorefrontProductSectionAssignment>(
  {
    tenantId: { type: String, required: true, index: true },
    sectionId: { type: String, enum: ['top-offers', 'top-blooms', 'new-season', 'pantry-ready'], required: true, index: true },
    productId: { type: String, required: true, index: true },
    sortOrder: { type: Number, default: 0, index: true },
    status: { type: String, enum: ['active', 'hidden'], default: 'active', index: true }
  },
  baseSchemaOptions
);

addSoftDeleteFields(customerSchema);
addSoftDeleteFields(promotionSchema);
addSoftDeleteFields(deliveryFeeSchema);
addSoftDeleteFields(tenantAdminSettingsSchema);
addSoftDeleteFields(carouselSlideSchema);
addSoftDeleteFields(highlightIconSchema);
addSoftDeleteFields(productSectionAssignmentSchema);

customerSchema.index({ tenantId: 1, email: 1 }, { unique: true });
promotionSchema.index({ tenantId: 1, code: 1 }, { unique: true });
deliveryFeeSchema.index({ tenantId: 1, region: 1, township: 1 }, { unique: true });
tenantAdminSettingsSchema.index({ tenantId: 1 }, { unique: true });
carouselSlideSchema.index({ tenantId: 1, status: 1 });
carouselSlideSchema.index({ tenantId: 1, placement: 1, status: 1, sortOrder: 1 });
highlightIconSchema.index({ tenantId: 1, status: 1 });
highlightIconSchema.index({ tenantId: 1, section: 1, status: 1, sortOrder: 1 });
productSectionAssignmentSchema.index({ tenantId: 1, status: 1 });
productSectionAssignmentSchema.index({ tenantId: 1, sectionId: 1, status: 1, sortOrder: 1 });
productSectionAssignmentSchema.index(
  { tenantId: 1, sectionId: 1, productId: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: 'active', isDeleted: false } }
);

export const AdminCustomerModel = model<AdminCustomer>('AdminCustomer', customerSchema);
export const PromotionModel = model<Promotion>('Promotion', promotionSchema);
export const DeliveryFeeModel = model<DeliveryFee>('DeliveryFee', deliveryFeeSchema);
export const TenantAdminSettingsModel = model<TenantAdminSettings>('TenantAdminSettings', tenantAdminSettingsSchema);
export const StorefrontCarouselSlideModel = model<StorefrontCarouselSlide>('StorefrontCarouselSlide', carouselSlideSchema);
export const StorefrontHighlightIconModel = model<StorefrontHighlightIcon>('StorefrontHighlightIcon', highlightIconSchema);
export const StorefrontProductSectionAssignmentModel = model<StorefrontProductSectionAssignment>(
  'StorefrontProductSectionAssignment',
  productSectionAssignmentSchema
);
