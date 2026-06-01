import { model, Schema } from 'mongoose';

import { addSoftDeleteFields, baseSchemaOptions } from '@core/database/base.schema';
import { Category } from '@modules/categories/category.types';

const categorySchema = new Schema<Category>(
  {
    tenantId: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true },
    parentId: { type: String, index: true },
    icon: { type: String, trim: true },
    color: { type: String, trim: true },
    itemCount: { type: Number, default: 0, min: 0 },
    subcategories: [{ type: String, trim: true }]
  },
  baseSchemaOptions
);

addSoftDeleteFields(categorySchema);
categorySchema.index({ tenantId: 1, slug: 1 }, { unique: true });

export const CategoryModel = model<Category>('Category', categorySchema);
