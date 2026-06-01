import { model, Schema } from 'mongoose';

import { addSoftDeleteFields, baseSchemaOptions } from '@core/database/base.schema';
import { Tenant } from '@modules/tenants/tenant.types';

const tenantSchema = new Schema<Tenant>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, unique: true, index: true },
    status: { type: String, enum: ['active', 'inactive', 'trial'], default: 'trial', index: true },
    subscriptionPlan: { type: String },
    settings: {
      locale: { type: String },
      currency: { type: String },
      timezone: { type: String }
    },
    branding: {
      logoUrl: { type: String },
      primaryColor: { type: String }
    },
    featureFlags: [{ type: String }]
  },
  baseSchemaOptions
);

addSoftDeleteFields(tenantSchema);

export const TenantModel = model<Tenant>('Tenant', tenantSchema);
