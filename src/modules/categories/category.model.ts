import { Schema } from 'mongoose';

import { addSoftDeleteFields, baseSchemaOptions } from '@core/database/base.schema';
import { Category } from '@modules/categories/category.types';

export const categorySchema = new Schema<Category>(
  {
    tenantId: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true },
    parentId: { type: String, index: true },
    icon: { type: String },
    color: { type: String, trim: true },
    itemCount: { type: Number, default: 0, min: 0 },
    subcategories: [{ type: String }]
  },
  baseSchemaOptions
);

addSoftDeleteFields(categorySchema);
categorySchema.index({ tenantId: 1, slug: 1 }, { unique: true });
