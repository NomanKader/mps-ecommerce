import { Schema } from 'mongoose';

import { baseSchemaOptions } from '@core/database/base.schema';
import { Order } from '@modules/orders/order.types';

export const orderSchema = new Schema<Order>(
  {
    tenantId: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    orderNumber: { type: String, required: true, unique: true, index: true },
    customerName: { type: String, required: true, trim: true },
    customerEmail: { type: String, trim: true, lowercase: true },
    customerPhone: { type: String, trim: true },
    deliveryAddress: { type: String, trim: true },
    region: { type: String, trim: true, index: true },
    township: { type: String, trim: true },
    itemCount: { type: Number, default: 0, min: 0 },
    itemsCount: { type: Number, default: 0, min: 0 },
    totalAmount: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
    status: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'fulfilled', 'cancelled'],
      default: 'pending',
      index: true
    },
    placedAt: { type: Date, default: Date.now, index: true }
  },
  baseSchemaOptions
);
