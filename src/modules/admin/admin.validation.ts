import { z } from 'zod';

const optionalDateQuery = z
  .string()
  .optional()
  .transform((value) => (value ? new Date(value) : undefined));

export const idParamSchema = z.object({
  params: z.object({ id: z.string().min(1) })
});

export const productBodySchema = z.object({
  body: z.object({
    name: z.string().min(2),
    sku: z.string().min(2),
    categoryId: z.string().optional(),
    categoryName: z.string().min(1).optional(),
    description: z.string().optional(),
    tags: z.array(z.string()).optional(),
    price: z.number().nonnegative(),
    currency: z.string().default('USD'),
    stock: z.number().int().nonnegative().default(0),
    rating: z.number().min(0).max(5).default(0),
    status: z.enum(['draft', 'active', 'archived']).default('active')
  })
});

export const categoryBodySchema = z.object({
  body: z.object({
    name: z.string().min(2),
    slug: z.string().min(2).optional(),
    icon: z.string().optional(),
    color: z.string().optional(),
    itemCount: z.number().int().nonnegative().default(0),
    subcategories: z.array(z.string()).default([])
  })
});

export const promotionBodySchema = z.object({
  body: z.object({
    campaign: z.string().min(2),
    code: z.string().min(2),
    discount: z.string().min(1),
    startsAt: z.coerce.date(),
    endsAt: z.coerce.date(),
    status: z.enum(['active', 'scheduled', 'expired', 'paused']).default('active'),
    uses: z.number().int().nonnegative().default(0)
  })
});

export const deliveryFeeBodySchema = z.object({
  body: z.object({
    region: z.string().min(2),
    township: z.string().min(2),
    fee: z.number().nonnegative(),
    freeOver: z.number().nonnegative().default(0),
    eta: z.string().min(2),
    status: z.enum(['active', 'paused']).default('active')
  })
});

export const orderStatusSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'fulfilled', 'cancelled'])
  })
});

export const orderQuerySchema = z.object({
  query: z.object({
    search: z.string().optional(),
    status: z.string().optional(),
    from: optionalDateQuery,
    to: optionalDateQuery
  })
});
