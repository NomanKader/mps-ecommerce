import axios from 'axios';

import { appConfig } from '@config/app.config';
import { registerInterceptors } from '@shared/api/interceptors';

export const apiClient = axios.create({
  baseURL: appConfig.apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

registerInterceptors(apiClient);
