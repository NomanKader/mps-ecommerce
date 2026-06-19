import type { Role } from '../../../types/common';

import { routePaths } from '@routes/routePaths';

const adminRoles: Role[] = ['tenant_admin', 'staff'];
const knownRoles: Role[] = ['tenant_admin', 'staff', 'customer'];

export const getAuthenticatedRedirect = (role: Role) =>
  adminRoles.includes(role)
    ? routePaths.tenantAdmin.dashboard
    : role === 'customer'
      ? routePaths.account
      : routePaths.home;

export const isKnownRole = (role: string): role is Role => knownRoles.includes(role as Role);

export const normalizeInternationalPhone = (phone: string) => {
  const digits = phone.replace(/\D/g, '');

  return digits ? `+${digits}` : '';
};

export const isValidInternationalPhone = (phone: string) => /^\+[1-9]\d{7,14}$/.test(phone);
