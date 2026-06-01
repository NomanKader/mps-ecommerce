import { z } from 'zod';

export const createTenantSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    slug: z.string().min(2)
  })
});
