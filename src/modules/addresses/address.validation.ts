import { z } from 'zod';

export const addressBodySchema = z.object({
  body: z.object({
    label: z.enum(['home', 'work', 'other']).default('home'),
    recipientName: z.string().trim().min(2),
    phone: z.string().trim().min(6),
    addressLine1: z.string().trim().min(4),
    addressLine2: z.string().trim().optional(),
    city: z.string().trim().min(2),
    township: z.string().trim().min(2),
    region: z.string().trim().min(2),
    landmark: z.string().trim().optional(),
    deliveryInstructions: z.string().trim().optional(),
    isDefault: z.coerce.boolean().default(false)
  })
});

export const addressUpdateSchema = z.object({
  body: addressBodySchema.shape.body.partial()
});

export const addressIdParamSchema = z.object({
  params: z.object({ id: z.string().min(1) })
});
