import { z } from 'zod';

const optionalDateQuery = z
  .string()
  .optional()
  .transform((value) => (value ? new Date(value) : undefined));

const tagsSchema = z.preprocess((value) => {
  if (typeof value !== 'string') return value;

  try {
    const parsed = JSON.parse(value) as unknown;
    return parsed;
  } catch {
    return value
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);
  }
}, z.array(z.string()).optional());

const stringArraySchema = z.preprocess((value) => {
  if (typeof value !== 'string') return value;

  try {
    const parsed = JSON.parse(value) as unknown;
    return parsed;
  } catch {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }
}, z.array(z.string()).optional());

const booleanStringSchema = z.preprocess((value) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return value.toLowerCase() === 'true';
  return value;
}, z.boolean().optional());

const optionalDateBodySchema = z.preprocess((value) => {
  if (value === undefined || value === null || value === '') return undefined;
  return value;
}, z.coerce.date().optional());

const hexColorSchema = z
  .string()
  .regex(/^#(?:[0-9a-fA-F]{3}){1,2}$/, 'Must be a hex color')
  .optional();

const phoneCountryCodes = ['+971', '+95', '+1', '+44', '+61', '+65', '+66', '+91'];

export const productSectionIds = [
  'top-offers',
  'top-blooms',
  'new-season',
  'pantry-ready'
] as const;

export const idParamSchema = z.object({
  params: z.object({ id: z.string().min(1) })
});

export const productBodySchema = z.object({
  body: z.object({
    name: z.string().min(2),
    sku: z.string().min(2),
    categoryId: z.string().optional(),
    categoryName: z.string().min(1).optional(),
    subcategory: z.string().optional(),
    description: z.string().optional(),
    tags: tagsSchema,
    price: z.coerce.number().min(100),
    currency: z.string().default('MMK'),
    stock: z.coerce.number().int().nonnegative().default(0),
    rating: z.coerce.number().min(0).max(5).default(0),
    status: z.enum(['draft', 'active', 'archived']).default('active'),
    imageUrl: z.url().optional(),
    removeImage: booleanStringSchema
  })
});

const bulkProductItemSchema = productBodySchema.shape.body.omit({ removeImage: true }).extend({
  description: z.string().optional().default(''),
  tags: tagsSchema.default([]),
  status: z.enum(['draft', 'active', 'archived']).default('active')
});

export const bulkProductsBodySchema = z.object({
  body: z.preprocess(
    (value) => (Array.isArray(value) ? { products: value } : value),
    z.object({
      mode: z.enum(['upsert', 'create-only']).default('upsert'),
      products: z.array(bulkProductItemSchema).min(1).max(1000).optional()
    })
  )
});

export const categoryBodySchema = z.object({
  body: z.object({
    name: z.string().min(1),
    slug: z.string().min(1).optional(),
    icon: z.string().optional(),
    color: z.string().optional(),
    subcategories: stringArraySchema
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
    uses: z.coerce.number().int().nonnegative().default(0)
  })
});

export const deliveryFeeBodySchema = z.object({
  body: z.object({
    region: z.string().min(2),
    township: z.string().min(2),
    fee: z.coerce.number().min(4500).max(20000),
    freeOver: z.coerce.number().nonnegative().default(0),
    eta: z.string().min(2),
    status: z.enum(['active', 'paused']).default('active')
  })
});

export const regionBodySchema = z.object({
  body: z.object({
    country: z.literal('Myanmar').default('Myanmar'),
    name: z.string().min(2).max(120),
    status: z.enum(['active', 'paused']).default('active')
  })
});

export const regionQuerySchema = z.object({
  query: z.object({
    country: z.literal('Myanmar').optional(),
    search: z.string().optional(),
    status: z.enum(['active', 'paused', 'all']).optional()
  })
});

export const townshipBodySchema = z.object({
  body: z.object({
    country: z.literal('Myanmar').default('Myanmar'),
    name: z.string().min(2).max(120),
    regionId: z.string().min(1),
    status: z.enum(['active', 'paused']).default('active')
  })
});

export const townshipQuerySchema = z.object({
  query: z.object({
    country: z.literal('Myanmar').optional(),
    search: z.string().optional(),
    region: z.string().optional(),
    regionId: z.string().optional(),
    status: z.enum(['active', 'paused', 'all']).optional()
  })
});

export const adminProfileBodySchema = z.object({
  body: z.object({
    firstName: z.string().min(1).max(80),
    lastName: z.string().min(1).max(80),
    email: z.email(),
    isActive: z.boolean(),
    logoUrl: z.string().url().optional().or(z.literal('')),
    deliveryHeadline: z.string().min(1).max(120),
    supportPhoneCountryCode: z.enum(phoneCountryCodes),
    supportPhoneNumber: z
      .string()
      .min(3)
      .max(40)
      .regex(/^[0-9\s()+.-]+$/, 'Phone number contains unsupported characters'),
    topBarTagline: z.string().min(1).max(120)
  })
});

export const carouselBodySchema = z.object({
  body: z.object({
    placement: z.enum(['hero', 'showcase']),
    title: z.string().max(160).optional(),
    description: z.string().max(500).optional(),
    eyebrow: z.string().max(80).optional(),
    cta: z.string().max(80).optional(),
    metric: z.string().max(80).optional(),
    headline: z.string().max(160).optional(),
    partner: z.string().max(120).optional(),
    targetCategoryId: z.string().max(120).optional(),
    targetSearch: z.string().max(120).optional(),
    sortOrder: z.coerce.number().int().nonnegative().default(0),
    status: z.enum(['active', 'draft', 'scheduled']).default('draft'),
    startsAt: optionalDateBodySchema,
    removeImage: booleanStringSchema
  })
});

export const carouselQuerySchema = z.object({
  query: z.object({
    placement: z.enum(['hero', 'showcase', 'all']).optional()
  })
});

export const storefrontCarouselQuerySchema = z.object({
  query: z.object({
    placement: z.enum(['hero', 'showcase'])
  })
});

export const storefrontIconBodySchema = z.object({
  body: z.object({
    label: z.string().min(1).max(80),
    icon: z.string().trim().min(1).max(24),
    color: z.string().regex(/^#(?:[0-9a-fA-F]{3}){1,2}$/, 'Must be a hex color'),
    surfaceColor: hexColorSchema,
    textColor: hexColorSchema,
    section: z.enum(['featured', 'merchandising']),
    sortOrder: z.coerce.number().int().nonnegative().default(0),
    status: z.enum(['active', 'hidden']).default('active')
  })
});

export const storefrontIconQuerySchema = z.object({
  query: z.object({
    section: z.enum(['featured', 'merchandising', 'all']).optional()
  })
});

export const secondaryCategoryBodySchema = z.object({
  body: z
    .object({
      name: z.string().min(1).max(100),
      slug: z.string().min(1).max(120).optional(),
      icon: z.string().trim().max(24).optional(),
      color: hexColorSchema,
      productId: z.string().min(1).optional(),
      productIds: z.union([z.array(z.string().min(1)).min(1), z.string().min(1)]).optional(),
      targetSectionId: z.enum(productSectionIds),
      status: z.enum(['active', 'hidden']).default('active')
    })
    .refine((body) => Boolean(body.productIds?.length || body.productId), {
      message: 'Select at least one product.',
      path: ['productIds']
    })
});

export const secondaryCategoryQuerySchema = z.object({
  query: z.object({
    search: z.string().optional(),
    status: z.enum(['active', 'hidden', 'all']).optional()
  })
});

export const requiredStorefrontIconQuerySchema = z.object({
  query: z.object({
    section: z.enum(['featured', 'merchandising'])
  })
});

export const productSectionAssignmentBodySchema = z.object({
  body: z.object({
    sectionId: z.enum(productSectionIds),
    productId: z.string().min(1),
    sortOrder: z.coerce.number().int().nonnegative().default(0),
    status: z.enum(['active', 'hidden']).default('active')
  })
});

export const productSectionAssignmentUpdateSchema = z.object({
  body: z.object({
    sectionId: z.enum(productSectionIds).optional(),
    productId: z.string().min(1).optional(),
    sortOrder: z.coerce.number().int().nonnegative().optional(),
    status: z.enum(['active', 'hidden']).optional()
  })
});

const pageSegmentSlideSchema = z.object({
  text: z.string().max(220).optional(),
  sortOrder: z.coerce.number().int().nonnegative().default(0),
  removeImage: booleanStringSchema
});

const pageSegmentSlidesSchema = z.preprocess((value) => {
  if (typeof value !== 'string') return value;

  try {
    return JSON.parse(value) as unknown;
  } catch {
    return value;
  }
}, z.array(pageSegmentSlideSchema).default([]));

export const pageSegmentBodySchema = z.object({
  body: z.object({
    title: z.string().min(1).max(160),
    primaryCategoryId: z.string().min(1).max(120),
    displaySlot: z.enum(['after-storefront-icons', 'after-new-in-season']),
    icon: z.string().trim().max(24).optional(),
    topCarousel: pageSegmentSlidesSchema,
    afterNewProductsCarousel: pageSegmentSlidesSchema,
    haveYouSeenCards: pageSegmentSlidesSchema,
    sortOrder: z.coerce.number().int().nonnegative().default(0),
    status: z.enum(['active', 'hidden']).default('active'),
    removeImage: booleanStringSchema
  })
});

export const pageSegmentQuerySchema = z.object({
  query: z.object({
    displaySlot: z.enum(['after-storefront-icons', 'after-new-in-season', 'all']).optional(),
    primaryCategoryId: z.string().optional(),
    status: z.enum(['active', 'hidden', 'all']).optional()
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
    region: z.string().optional(),
    township: z.string().optional(),
    from: optionalDateQuery,
    to: optionalDateQuery,
    startDate: optionalDateQuery,
    endDate: optionalDateQuery
  })
});

export const productQuerySchema = z.object({
  query: z.object({
    search: z.string().optional(),
    status: z.enum(['draft', 'active', 'archived']).optional(),
    categoryId: z.string().optional(),
    categoryName: z.string().optional()
  })
});

export const customerQuerySchema = z.object({
  query: z.object({
    search: z.string().optional(),
    segment: z.enum(['VIP', 'Loyal', 'New', 'At Risk']).optional()
  })
});
