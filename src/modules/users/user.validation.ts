import { z } from 'zod';

const dashboardRoleSchema = z.enum([
  'store_owner',
  'operations_manager',
  'catalog_manager',
  'order_fulfillment',
  'customer_support',
  'marketing_manager',
  'delivery_manager',
  'finance_viewer'
]);

export const createSystemUserSchema = z.object({
  body: z.object({
    email: z.email(),
    firstName: z.string().trim().min(2),
    lastName: z.string().trim().min(2),
    password: z.string().min(8)
  })
});

export const createTenantDashboardUserSchema = z.object({
  body: z.object({
    email: z.email(),
    firstName: z.string().trim().min(2),
    lastName: z.string().trim().min(2),
    phone: z.string().trim().optional(),
    password: z.string().min(8),
    dashboardRole: dashboardRoleSchema,
    isActive: z.boolean().optional().default(true)
  })
});

export const updateTenantDashboardUserSchema = z.object({
  params: z.object({
    id: z.string().trim().min(1)
  }),
  body: z.object({
    email: z.email(),
    firstName: z.string().trim().min(2),
    lastName: z.string().trim().min(2),
    phone: z.string().trim().optional(),
    password: z.string().min(8).optional(),
    dashboardRole: dashboardRoleSchema,
    isActive: z.boolean()
  })
});

export const tenantDashboardUserIdSchema = z.object({
  params: z.object({
    id: z.string().trim().min(1)
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
