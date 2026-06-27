import { z } from 'zod';

export const shoppingListBodySchema = z.object({
  body: z.object({ name: z.string().trim().min(1).max(80) })
});

export const shoppingListNameSchema = z.object({
  body: z.object({ name: z.string().trim().min(1).max(80) })
});
