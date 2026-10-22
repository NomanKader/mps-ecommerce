import { z } from 'zod';

export const createProductSchema = z.object({
  body: z.object({
    tenantId: z.string(),
    name: z.string().min(2),
    sku: z.string().min(2),
    unit: z.string().optional(),
    categoryId: z.string().optional(),
    subcategory: z.string().optional(),
    price: z.coerce.number().min(100),
    currency: z.string().default('MMK')
  })
});
