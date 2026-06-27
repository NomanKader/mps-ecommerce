import { Schema } from 'mongoose';

import { baseSchemaOptions } from '@core/database/base.schema';
import { ShoppingList } from '@modules/shopping-lists/shopping-list.types';

export const shoppingListSchema = new Schema<ShoppingList>(
  {
    tenantId: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true },
    productIds: { type: [String], default: [] }
  },
  baseSchemaOptions
);

shoppingListSchema.index({ tenantId: 1, userId: 1, name: 1 }, { unique: true });
