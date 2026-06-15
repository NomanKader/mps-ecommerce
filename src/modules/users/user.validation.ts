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
    tenantId: z.string().trim().min(2).optional()
  }).optional(),
  body: z.object({
    tenantId: z.string().trim().min(2).optional(),
    tenantSlug: z.string().trim().min(2).toLowerCase().optional(),
    email: z.email(),
    firstName: z.string().trim().min(2),
    lastName: z.string().trim().min(2),
    password: z.string().min(8)
  })
}).superRefine((payload, context) => {
  if (!payload.params?.tenantId && !payload.body.tenantId && !payload.body.tenantSlug) {
    context.addIssue({
      code: 'custom',
      message: 'Tenant id is required',
      path: ['body', 'tenantId']
    });
  }
});
