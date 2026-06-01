import { model, Schema } from 'mongoose';

import { addSoftDeleteFields, baseSchemaOptions } from '@core/database/base.schema';
import { Product } from '@modules/products/product.types';

const productSchema = new Schema<Product>(
  {
    tenantId: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true },
    sku: { type: String, required: true, trim: true, index: true },
    categoryId: { type: String, index: true },
    categoryName: { type: String, trim: true },
    description: { type: String, trim: true },
    tags: [{ type: String, trim: true }],
    price: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
    stock: { type: Number, default: 0, min: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    status: { type: String, enum: ['draft', 'active', 'archived'], default: 'draft', index: true }
  },
  baseSchemaOptions
);

addSoftDeleteFields(productSchema);
productSchema.index({ tenantId: 1, sku: 1 }, { unique: true });

export const ProductModel = model<Product>('Product', productSchema);
