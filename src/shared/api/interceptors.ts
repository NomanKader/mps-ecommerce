import type { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

import { appConfig } from '@config/app.config';
import { authService } from '@services/auth/auth.service';
import { endpoints } from '@shared/api/endpoints';
import { toApiError } from '@shared/api/apiError';

const handleRequest = (config: InternalAxiosRequestConfig) => {
  const token = authService.getCurrentToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  config.headers['x-tenant-id'] = appConfig.defaultTenantSlug;

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
  }

  return Promise.reject(toApiError(error));
};

export const registerInterceptors = (instance: AxiosInstance) => {
  instance.interceptors.request.use(handleRequest);
  instance.interceptors.response.use((response) => response, handleResponseError);
};
