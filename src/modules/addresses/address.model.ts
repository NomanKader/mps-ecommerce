import { Schema } from 'mongoose';

import { addSoftDeleteFields, baseSchemaOptions } from '@core/database/base.schema';
import { Address } from '@modules/addresses/address.types';

export const addressSchema = new Schema<Address>(
  {
    tenantId: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    label: { type: String, enum: ['home', 'work', 'other'], default: 'home' },
    recipientName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    addressLine1: { type: String, required: true, trim: true },
    addressLine2: { type: String, trim: true },
    city: { type: String, required: true, trim: true },
    township: { type: String, required: true, trim: true },
    region: { type: String, required: true, trim: true },
    landmark: { type: String, trim: true },
    deliveryInstructions: { type: String, trim: true },
    isDefault: { type: Boolean, default: false, index: true }
  },
  baseSchemaOptions
);

addSoftDeleteFields(addressSchema);
addressSchema.index({ tenantId: 1, userId: 1, isDefault: 1 });
