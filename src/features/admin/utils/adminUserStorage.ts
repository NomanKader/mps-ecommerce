import type { User } from '@entities/user/types/user.types';

export const adminUserStorageKey = 'mps-ecommerce.admin-user-info';

export type AdminUserInfo = Pick<
  User,
  | 'dashboardRole'
  | 'email'
  | 'firstName'
  | 'id'
  | 'isActive'
  | 'lastName'
  | 'logoUrl'
  | 'role'
  | 'tenantId'
> & {
  supportPhoneLabel?: string;
  topBarTagline?: string;
  deliveryHeadline?: string;
};

const isAdminUserInfo = (value: unknown): value is AdminUserInfo => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const user = value as Partial<AdminUserInfo>;

  return (
    typeof user.email === 'string' &&
    typeof user.firstName === 'string' &&
    typeof user.id === 'string' &&
    typeof user.lastName === 'string' &&
    user.role === 'tenant_admin' &&
    (typeof user.dashboardRole === 'string' || typeof user.dashboardRole === 'undefined') &&
    (typeof user.deliveryHeadline === 'string' || typeof user.deliveryHeadline === 'undefined') &&
    (typeof user.isActive === 'boolean' || typeof user.isActive === 'undefined') &&
    (typeof user.logoUrl === 'string' || typeof user.logoUrl === 'undefined') &&
    (typeof user.supportPhoneLabel === 'string' || typeof user.supportPhoneLabel === 'undefined') &&
    (typeof user.topBarTagline === 'string' || typeof user.topBarTagline === 'undefined') &&
    (typeof user.tenantId === 'string' || typeof user.tenantId === 'undefined')
  );
};

export const readAdminUserInfo = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  const stored = window.localStorage.getItem(adminUserStorageKey);

  if (!stored) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(stored);

    if (isAdminUserInfo(parsed)) {
      return parsed;
    }
  } catch {
    window.localStorage.removeItem(adminUserStorageKey);
  }

  return null;
};

export const writeAdminUserInfo = (user: AdminUserInfo) => {
  window.localStorage.setItem(adminUserStorageKey, JSON.stringify(user));
};

export const mergeAdminUserInfo = (user: User) => {
  const stored = readAdminUserInfo();

  if (!stored || stored.id !== user.id) {
    return user;
  }

  return { ...user, ...stored };
};
