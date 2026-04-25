import type { ReactNode } from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { QueryProvider } from '@app/providers/query-client/QueryProvider';
import { StoreProvider } from '@app/providers/store/StoreProvider';
import { ThemeProvider } from '@app/providers/theme/ThemeProvider';

const AllProviders = ({ children }: { children: ReactNode }) => (
  <StoreProvider>
    <ThemeProvider>
      <QueryProvider>
        <MemoryRouter>{children}</MemoryRouter>
      </QueryProvider>
    </ThemeProvider>
  </StoreProvider>
);

export const renderWithProviders = (ui: ReactNode, options?: Omit<RenderOptions, 'wrapper'>) =>
  render(ui, { wrapper: AllProviders, ...options });
