import { z } from 'zod';

export const createOrderSchema = z.object({
  body: z.object({
    tenantId: z.string(),
    userId: z.string(),
    totalAmount: z.number().nonnegative()
  })
});
