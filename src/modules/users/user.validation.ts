import { z } from 'zod';

import { Role } from '@common/enums/role.enum';

export const createUserSchema = z.object({
  body: z.object({
    tenantId: z.string().optional(),
    email: z.email(),
    firstName: z.string().min(2),
    lastName: z.string().min(2),
    password: z.string().min(8),
    role: z.nativeEnum(Role).optional()
  })
});
