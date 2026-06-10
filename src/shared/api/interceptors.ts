import type { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

import { authService } from '@services/auth/auth.service';
import { tenantService } from '@services/tenant/tenant.service';
import { routePaths } from '@routes/routePaths';
import { endpoints } from '@shared/api/endpoints';
import { toApiError } from '@shared/api/apiError';

const isAdminRequest = (url: string | undefined) => Boolean(url?.startsWith('/admin/'));
const isStorefrontRequest = (url: string | undefined) => Boolean(url?.startsWith('/storefront/'));

const handleRequest = (config: InternalAxiosRequestConfig) => {
  const token = authService.getCurrentToken();
  const requestUrl = config.url;
  const isFormData = typeof FormData !== 'undefined' && config.data instanceof FormData;

  if (isFormData) {
    delete config.headers['Content-Type'];
    delete config.headers['content-type'];
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (requestUrl === endpoints.auth.login || isAdminRequest(requestUrl)) {
    delete config.headers['x-tenant-id'];
    delete config.headers['X-Tenant-Id'];
  } else if (isStorefrontRequest(requestUrl)) {
    const tenantId = tenantService.getCurrentTenantId() ?? tenantService.getDefaultTenantId();

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

  if (error.response?.status === 401 && !isPublicAuthRequest) {
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
