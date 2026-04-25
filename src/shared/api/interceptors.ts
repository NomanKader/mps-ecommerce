import type { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

import { authService } from '@services/auth/auth.service';

const handleRequest = (config: InternalAxiosRequestConfig) => {
  const token = authService.getCurrentToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
};

const handleResponseError = async (error: AxiosError) => {
  return Promise.reject(error);
};

export const registerInterceptors = (instance: AxiosInstance) => {
  instance.interceptors.request.use(handleRequest);
  instance.interceptors.response.use((response) => response, handleResponseError);
};
