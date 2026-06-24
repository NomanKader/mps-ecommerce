import type { Role } from '../../../types/common';

export type User = {
  dashboardRole?: string;
  deliveryHeadline?: string;
  email: string;
  firstName: string;
  id: string;
  isActive?: boolean;
  lastName: string;
  logoUrl?: string;
  phone?: string;
  role: Role;
  supportPhoneLabel?: string;
  tenantId?: string;
  topBarTagline?: string;
};
