import { appConfig } from '@config/app.config';
import type { Tenant } from '@entities/tenant/types/tenant.types';
import { STORAGE_KEYS } from '@shared/constants/app.constants';

export type TenantContext = {
  databaseName?: string;
  slug?: string;
  tenantId: string;
};

const readStorageValue = (key: string) =>
  window.localStorage.getItem(key) ?? window.sessionStorage.getItem(key);

const readStoredTenantId = () =>
  window.localStorage.getItem(STORAGE_KEYS.TENANT_ID) ??
  window.sessionStorage.getItem(STORAGE_KEYS.TENANT_ID);

const writeStorageValue = (key: string, value: string | undefined, rememberMe: boolean) => {
  window.localStorage.removeItem(key);
  window.sessionStorage.removeItem(key);

  if (!value) {
    return;
  }

  const storage = rememberMe ? window.localStorage : window.sessionStorage;
  storage.setItem(key, value);
};

export const tenantService = {
  clearTenantContext() {
    window.localStorage.removeItem(STORAGE_KEYS.TENANT_ID);
    window.sessionStorage.removeItem(STORAGE_KEYS.TENANT_ID);
    window.localStorage.removeItem(STORAGE_KEYS.TENANT_SLUG);
    window.sessionStorage.removeItem(STORAGE_KEYS.TENANT_SLUG);
    window.localStorage.removeItem(STORAGE_KEYS.TENANT_DATABASE_NAME);
    window.sessionStorage.removeItem(STORAGE_KEYS.TENANT_DATABASE_NAME);
  },
  clearTenantId() {
    this.clearTenantContext();
  },
  getDefaultTenantContext(): TenantContext | null {
    const tenantId = this.getDefaultTenantId();

    if (!tenantId) {
      return null;
    }

    return {
      slug: appConfig.defaultTenantSlug || undefined,
      tenantId,
    };
  },
  getCurrentTenantContext(): TenantContext | null {
    const tenantId = readStoredTenantId();

    if (!tenantId) {
      return this.getDefaultTenantContext();
    }

    return {
      databaseName: readStorageValue(STORAGE_KEYS.TENANT_DATABASE_NAME) ?? undefined,
      slug: readStorageValue(STORAGE_KEYS.TENANT_SLUG) ?? undefined,
      tenantId,
    };
  },
  getCurrentTenantId() {
    return readStoredTenantId() ?? this.getDefaultTenantId();
  },
  getDefaultTenantId() {
    return appConfig.defaultTenantId || null;
  },
  initializeDefaultTenantContext(rememberMe = false) {
    if (!readStoredTenantId()) {
      const defaultContext = this.getDefaultTenantContext();

      if (defaultContext) {
        this.setTenantContext(defaultContext, rememberMe);
      }
    }
  },
  getRegistrationTenantId() {
    return this.getCurrentTenantId() ?? this.getDefaultTenantId();
  },
  resetToDefaultTenantContext(rememberMe = false) {
    this.clearTenantContext();
    const defaultContext = this.getDefaultTenantContext();

    if (defaultContext) {
      this.setTenantContext(defaultContext, rememberMe);
    }
  },
  setTenantContext(context: TenantContext, rememberMe = false) {
    writeStorageValue(STORAGE_KEYS.TENANT_ID, context.tenantId, rememberMe);
    writeStorageValue(STORAGE_KEYS.TENANT_SLUG, context.slug, rememberMe);
    writeStorageValue(STORAGE_KEYS.TENANT_DATABASE_NAME, context.databaseName, rememberMe);
  },
  setTenant(tenant: Tenant, rememberMe = false) {
    this.setTenantContext(
      {
        databaseName: tenant.databaseName,
        slug: tenant.slug,
        tenantId: tenant.tenantId,
      },
      rememberMe,
    );
  },
  setTenantId(tenantId: string, rememberMe = false) {
    this.setTenantContext({ tenantId }, rememberMe);
  },
};
