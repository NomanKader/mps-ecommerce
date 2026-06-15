import type { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

import { authService } from '@services/auth/auth.service';
import { tenantService } from '@services/tenant/tenant.service';
import { routePaths } from '@routes/routePaths';
import { endpoints } from '@shared/api/endpoints';
import { toApiError } from '@shared/api/apiError';

const skipTenantHeader = 'x-skip-tenant-id';

const getRequestPath = (url: string | undefined) => url?.split('?')[0] ?? '';

const isSystemAdminRequest = (url: string | undefined) =>
  Boolean(
    url?.startsWith('/system-admin/') ||
    url?.startsWith('/tenants') ||
    url === endpoints.auth.bootstrap,
  );

const isAnonymousPublicRequest = (url: string | undefined) => {
  const path = getRequestPath(url);

  return (
    path === endpoints.categories.list ||
    path === endpoints.products.list ||
    path.startsWith('/products/') ||
    path === endpoints.storefront.carousel ||
    path === endpoints.storefront.headerSettings ||
    path === endpoints.storefront.icons ||
    path === endpoints.storefront.productSections
  );
};

const handleRequest = (config: InternalAxiosRequestConfig) => {
  const token = authService.getCurrentToken();
  const requestUrl = config.url;
  const isFormData = typeof FormData !== 'undefined' && config.data instanceof FormData;
  const isPublicRequest = isAnonymousPublicRequest(requestUrl);
  const shouldSkipTenantHeader =
    config.headers[skipTenantHeader] === 'true' ||
    config.headers[skipTenantHeader] === true ||
    isSystemAdminRequest(requestUrl);

  if (isFormData) {
    delete config.headers['Content-Type'];
    delete config.headers['content-type'];
  }

  if (token && !isPublicRequest) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    delete config.headers.Authorization;
  }

  delete config.headers[skipTenantHeader];

  if (shouldSkipTenantHeader) {
    delete config.headers['x-tenant-id'];
    delete config.headers['X-Tenant-Id'];
  } else {
    const tenantId = isPublicRequest
      ? tenantService.getDefaultTenantId()
      : (tenantService.getCurrentTenantId() ?? tenantService.getDefaultTenantId());

    if (tenantId) {
      config.headers['x-tenant-id'] = config.headers['x-tenant-id'] ?? tenantId;
    }
  }

  return config;
};

const handleResponseError = async (error: AxiosError) => {
  const requestUrl = error.config?.url;
  const isPublicAuthRequest =
    requestUrl === endpoints.auth.login ||
    requestUrl === endpoints.auth.register ||
    requestUrl === endpoints.auth.requestOtp;
  const isPublicRequest = isAnonymousPublicRequest(requestUrl);

  if (error.response?.status === 401 && !isPublicAuthRequest && !isPublicRequest) {
    authService.signOut();
    window.dispatchEvent(new Event('auth:unauthorized'));

    if (window.location.pathname !== routePaths.auth.login) {
      window.location.assign(routePaths.auth.login);
    }
  }

  return Promise.reject(toApiError(error));
};

export const registerInterceptors = (instance: AxiosInstance) => {
  instance.interceptors.request.use(handleRequest);
  instance.interceptors.response.use((response) => response, handleResponseError);
};
