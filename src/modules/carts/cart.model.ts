import { Schema } from 'mongoose';

import { baseSchemaOptions } from '@core/database/base.schema';
import { Cart } from '@modules/carts/cart.types';

export const cartSchema = new Schema<Cart>(
  {
    tenantId: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    items: [
      {
        productId: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 }
      }
    ],
    status: { type: String, enum: ['active', 'abandoned', 'converted'], default: 'active', index: true }
  },
  baseSchemaOptions
);
