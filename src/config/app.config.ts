import { env } from '@config/env';

const selectedApiBaseUrl =
  env.VITE_APP_ENV === 'production' ? env.VITE_PRODUCTION_API_BASE_URL : env.VITE_API_BASE_URL;
const apiBaseUrl = selectedApiBaseUrl.replace(/\/$/, '');
const versionedApiBaseUrl = apiBaseUrl.endsWith('/api/v1') ? apiBaseUrl : `${apiBaseUrl}/api/v1`;

export const appConfig = {
  apiBaseUrl: versionedApiBaseUrl,
  appEnv: env.VITE_APP_ENV,
  appName: env.VITE_APP_NAME,
  assetBaseUrl: env.VITE_ASSET_BASE_URL,
  defaultTenantId: env.VITE_DEFAULT_TENANT_ID.trim() || 'AV',
  defaultTenantSlug: env.VITE_DEFAULT_TENANT_SLUG.trim() || 'av',
  enableAnalytics: env.VITE_ENABLE_ANALYTICS === 'true',
};
