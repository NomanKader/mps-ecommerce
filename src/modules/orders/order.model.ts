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
    city: { type: String, trim: true },
    categoryIds: { type: [String], default: [], index: true },
    deliveryAddress: { type: String, trim: true },
    paymentMethod: {
      type: String,
      enum: ['wallet', 'cash_on_delivery', 'mopayments'],
      default: 'cash_on_delivery',
      required: true
    },
    paymentStatus: {
      type: String,
      enum: ['paid', 'pending', 'failed', 'expired', 'timeout'],
      default: 'pending',
      required: true
    },
    paymentGateway: { type: String, trim: true },
    paymentGatewayStatus: { type: String, trim: true },
    paymentRedirectUrl: { type: String, trim: true },
    paymentToken: { type: String, trim: true, index: true },
    paymentTokenExpiresAt: { type: Date },
    region: { type: String, trim: true, index: true },
    township: { type: String, trim: true },
    itemCount: { type: Number, default: 0, min: 0 },
    itemsCount: { type: Number, default: 0, min: 0 },
    lineItems: {
      type: [
        {
          categoryId: { type: String },
          categoryName: { type: String, trim: true },
          imageUrl: { type: String, trim: true },
          lineTotal: { type: Number, required: true, min: 0 },
          name: { type: String, required: true, trim: true },
          productId: { type: String, required: true },
          quantity: { type: Number, required: true, min: 1 },
          sku: { type: String, required: true, trim: true },
          subcategory: { type: String, trim: true },
          unitPrice: { type: Number, required: true, min: 0 }
        }
      ],
      default: []
    },
    productIds: { type: [String], default: [] },
    subcategories: { type: [String], default: [], index: true },
    subtotalAmount: { type: Number, required: true, min: 0 },
    deliveryFee: { type: Number, required: true, min: 0, default: 0 },
    totalAmount: { type: Number, required: true },
    currency: { type: String, default: 'MMK' },
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
