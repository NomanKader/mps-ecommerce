import { z } from 'zod';

export const createSystemUserSchema = z.object({
  body: z.object({
    email: z.email(),
    firstName: z.string().trim().min(2),
    lastName: z.string().trim().min(2),
    password: z.string().min(8)
  })
});

export const createTenantAdminSchema = z.object({
  params: z.object({
    tenantSlug: z.string().trim().min(2).toLowerCase().optional()
  }).optional(),
  body: z.object({
    tenantSlug: z.string().trim().min(2).toLowerCase().optional(),
    email: z.email(),
    firstName: z.string().trim().min(2),
    lastName: z.string().trim().min(2),
    password: z.string().min(8)
  })
}).superRefine((payload, context) => {
  if (!payload.params?.tenantSlug && !payload.body.tenantSlug) {
    context.addIssue({
      code: 'custom',
      message: 'Tenant slug is required',
      path: ['body', 'tenantSlug']
    });
  }
});
