import { env } from '@config/env';

export const appConfig = {
  apiBaseUrl: env.VITE_API_BASE_URL,
  appEnv: env.VITE_APP_ENV,
  appName: env.VITE_APP_NAME,
  assetBaseUrl: env.VITE_ASSET_BASE_URL,
  defaultTenantSlug: env.VITE_DEFAULT_TENANT_SLUG,
  enableAnalytics: env.VITE_ENABLE_ANALYTICS === 'true',
};
