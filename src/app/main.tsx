import React from 'react';
import ReactDOM from 'react-dom/client';

import { QueryProvider } from '@app/providers/query-client/QueryProvider';
import { RouterProvider } from '@app/providers/router/RouterProvider';
import { StoreProvider } from '@app/providers/store/StoreProvider';
import { ThemeProvider } from '@app/providers/theme/ThemeProvider';
import { AppToaster } from '@shared/components/feedback/AppToaster';
import { BackendLoadingGate } from '@shared/components/feedback/BackendLoadingGate';
import { AuthInitializer } from '@features/auth/components/AuthInitializer';
import { I18nProvider } from '@features/i18n/I18nProvider';

import '@app/styles/global.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <StoreProvider>
      <AuthInitializer>
        <I18nProvider>
          <ThemeProvider>
            <QueryProvider>
              <BackendLoadingGate>
                <RouterProvider />
              </BackendLoadingGate>
              <AppToaster />
            </QueryProvider>
          </ThemeProvider>
        </I18nProvider>
      </AuthInitializer>
    </StoreProvider>
  </React.StrictMode>,
);
