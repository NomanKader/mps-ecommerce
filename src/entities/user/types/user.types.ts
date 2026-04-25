import type { Role } from '../../../types/common';

export type User = {
  email: string;
  firstName: string;
  id: string;
  lastName: string;
  role: Role;
  tenantId?: string;
};
