import { appConfig } from '@config/app.config';

export const tenantService = {
  getDefaultTenantSlug() {
    return appConfig.defaultTenantSlug;
  },
};
