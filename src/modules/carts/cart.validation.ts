import { z } from 'zod';

export const updateCartSchema = z.object({
  body: z.object({
    items: z.array(
      z.object({
        productId: z.string(),
        quantity: z.number().int().positive()
      })
    )
  })
});
