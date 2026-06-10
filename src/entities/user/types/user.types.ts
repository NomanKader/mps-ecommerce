import type { Role } from '../../../types/common';

export type User = {
  deliveryHeadline?: string;
  email: string;
  firstName: string;
  id: string;
  isActive?: boolean;
  lastName: string;
  role: Role;
  supportPhoneLabel?: string;
  tenantId?: string;
  topBarTagline?: string;
};
