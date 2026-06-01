import React from 'react';
import ReactDOM from 'react-dom/client';

import { QueryProvider } from '@app/providers/query-client/QueryProvider';
import { RouterProvider } from '@app/providers/router/RouterProvider';
import { StoreProvider } from '@app/providers/store/StoreProvider';
import { ThemeProvider } from '@app/providers/theme/ThemeProvider';
import { AppToaster } from '@shared/components/feedback/AppToaster';
import { AuthInitializer } from '@features/auth/components/AuthInitializer';

import '@app/styles/global.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <StoreProvider>
      <AuthInitializer>
        <ThemeProvider>
          <QueryProvider>
            <RouterProvider />
            <AppToaster />
          </QueryProvider>
        </ThemeProvider>
      </AuthInitializer>
    </StoreProvider>
  </React.StrictMode>,
);
