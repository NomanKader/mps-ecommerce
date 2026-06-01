import { z } from 'zod';

export const createCategorySchema = z.object({
  body: z.object({
    tenantId: z.string(),
    name: z.string().min(2),
    slug: z.string().min(2),
    parentId: z.string().optional()
  })
});
