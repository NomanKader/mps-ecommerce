import type { Role } from '../../../types/common';

import { routePaths } from '@routes/routePaths';

const adminRoles: Role[] = ['tenant_admin', 'staff', 'super_admin'];

export const getAuthenticatedRedirect = (role: Role) =>
  adminRoles.includes(role) ? routePaths.tenantAdmin.dashboard : routePaths.home;

export const normalizeInternationalPhone = (phone: string) => {
  const digits = phone.replace(/\D/g, '');

  return digits ? `+${digits}` : '';
};

export const isValidInternationalPhone = (phone: string) => /^\+[1-9]\d{7,14}$/.test(phone);
