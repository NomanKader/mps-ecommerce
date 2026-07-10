import { z } from 'zod';

export const deliveryQuoteSchema = z.object({
  body: z.object({
    city: z.string().trim().min(2),
    region: z.string().trim().min(2),
    subtotalAmount: z.coerce.number().min(0),
    township: z.string().trim().min(2)
  })
});

export const createOrderSchema = z.object({
  body: z.object({
    customerEmail: z.string().email().optional(),
    customerName: z.string().trim().min(1),
    customerPhone: z.string().trim().optional(),
    city: z.string().trim().min(2),
    deliveryAddress: z.string().trim().min(1),
    itemCount: z.coerce.number().int().positive(),
    items: z
      .array(
        z.object({
          productId: z.string().min(1),
          quantity: z.coerce.number().int().positive().max(999)
        })
      )
      .default([]),
    paymentMethod: z.enum(['wallet', 'cash_on_delivery']),
    productIds: z.array(z.string().min(1)).default([]),
    region: z.string().trim().optional(),
    township: z.string().trim().optional(),
    subtotalAmount: z.coerce.number().min(100)
  })
});
