import { Schema } from 'mongoose';

import { baseSchemaOptions } from '@core/database/base.schema';
import { Favorite } from '@modules/favorites/favorite.types';

export const favoriteSchema = new Schema<Favorite>(
  {
    tenantId: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    productId: { type: String, required: true, index: true }
  },
  baseSchemaOptions
);

favoriteSchema.index({ tenantId: 1, userId: 1, productId: 1 }, { unique: true });
