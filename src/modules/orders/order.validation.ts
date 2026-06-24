import { z } from 'zod';

export const createOrderSchema = z.object({
  body: z.object({
    customerEmail: z.string().email().optional(),
    customerName: z.string().trim().min(1),
    customerPhone: z.string().trim().optional(),
    deliveryAddress: z.string().trim().min(1),
    itemCount: z.coerce.number().int().positive(),
    region: z.string().trim().optional(),
    township: z.string().trim().optional(),
    totalAmount: z.coerce.number().min(100)
  })
});
