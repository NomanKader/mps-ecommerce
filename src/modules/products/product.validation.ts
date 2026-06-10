import { z } from 'zod';

export const createProductSchema = z.object({
  body: z.object({
    tenantId: z.string(),
    name: z.string().min(2),
    sku: z.string().min(2),
    categoryId: z.string().optional(),
    subcategory: z.string().optional(),
    price: z.coerce.number().nonnegative(),
    currency: z.string().default('USD')
  })
});
