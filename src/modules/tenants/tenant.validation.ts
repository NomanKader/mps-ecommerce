import { z } from 'zod';

const slugSchema = z.string().trim().min(2).toLowerCase();
const tenantIdentifierSchema = z.string().trim().min(2);
const tenantStatusSchema = z.enum(['active', 'inactive', 'trial']);

const tenantSettingsSchema = z.object({
  locale: z.string().trim().min(2).optional(),
  currency: z.string().trim().min(3).optional(),
  timezone: z.string().trim().min(2).optional()
});

const tenantBrandingSchema = z.object({
  logoUrl: z.string().trim().url().optional(),
  primaryColor: z.string().trim().min(4).optional()
});

export const createTenantSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2),
    slug: slugSchema,
    status: tenantStatusSchema.default('trial'),
    subscriptionPlan: z.string().trim().min(2).optional(),
    settings: tenantSettingsSchema.optional(),
    branding: tenantBrandingSchema.optional(),
    featureFlags: z.array(z.string().trim().min(1)).default([])
  })
});

export const tenantSlugParamSchema = z.object({
  params: z.object({
    tenantId: tenantIdentifierSchema
  })
});

export const updateTenantSchema = z.object({
  params: z.object({
    tenantId: tenantIdentifierSchema
  }),
  body: z
    .object({
      name: z.string().trim().min(2).optional(),
      slug: slugSchema.optional(),
      status: tenantStatusSchema.optional(),
      subscriptionPlan: z.string().trim().min(2).optional(),
      settings: tenantSettingsSchema.optional(),
      branding: tenantBrandingSchema.optional(),
      featureFlags: z.array(z.string().trim().min(1)).optional()
    })
    .refine((payload) => Object.keys(payload).length > 0, {
      message: 'At least one tenant field is required'
    })
});
