import { ROLE_OPTIONS } from '@shared/enums/role.enum';

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'mps_access_token',
  REFRESH_TOKEN: 'mps_refresh_token',
  TENANT_SLUG: 'mps_tenant_slug',
  THEME_MODE: 'mps_theme_mode',
} as const;

export const APP_ROLES = Object.values(ROLE_OPTIONS);
