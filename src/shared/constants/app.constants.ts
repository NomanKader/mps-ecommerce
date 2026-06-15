import { ROLE_OPTIONS } from '@shared/enums/role.enum';

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'avs_access_token',
  REFRESH_TOKEN: 'avs_refresh_token',
  TENANT_DATABASE_NAME: 'avs_tenant_database_name',
  TENANT_ID: 'avs_tenant_id',
  TENANT_SLUG: 'avs_tenant_slug',
  THEME_MODE: 'avs_theme_mode',
} as const;

export const APP_ROLES = Object.values(ROLE_OPTIONS);
