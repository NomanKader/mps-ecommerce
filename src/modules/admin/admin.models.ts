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

addSoftDeleteFields(customerSchema);
addSoftDeleteFields(promotionSchema);
addSoftDeleteFields(deliveryFeeSchema);

customerSchema.index({ tenantId: 1, email: 1 }, { unique: true });
promotionSchema.index({ tenantId: 1, code: 1 }, { unique: true });
deliveryFeeSchema.index({ tenantId: 1, region: 1, township: 1 }, { unique: true });

export const AdminCustomerModel = model<AdminCustomer>('AdminCustomer', customerSchema);
export const PromotionModel = model<Promotion>('Promotion', promotionSchema);
export const DeliveryFeeModel = model<DeliveryFee>('DeliveryFee', deliveryFeeSchema);
