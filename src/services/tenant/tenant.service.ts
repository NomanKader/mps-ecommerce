import { appConfig } from '@config/app.config';
import { STORAGE_KEYS } from '@shared/constants/app.constants';

export const tenantService = {
  clearTenantId() {
    window.localStorage.removeItem(STORAGE_KEYS.TENANT_ID);
    window.sessionStorage.removeItem(STORAGE_KEYS.TENANT_ID);
  },
  getCurrentTenantId() {
    return (
      window.localStorage.getItem(STORAGE_KEYS.TENANT_ID) ??
      window.sessionStorage.getItem(STORAGE_KEYS.TENANT_ID)
    );
  },
  getDefaultTenantId() {
    return appConfig.defaultTenantSlug;
  },
  getRegistrationTenantId() {
    return this.getCurrentTenantId() ?? this.getDefaultTenantId();
  },
  setTenantId(tenantId: string, rememberMe = false) {
    this.clearTenantId();
    const storage = rememberMe ? window.localStorage : window.sessionStorage;
    storage.setItem(STORAGE_KEYS.TENANT_ID, tenantId);
  },
};
