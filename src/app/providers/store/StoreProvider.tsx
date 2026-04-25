import type { ReactNode } from 'react';
import { Provider } from 'react-redux';

import { store } from '@store/index';

export const StoreProvider = ({ children }: { children: ReactNode }) => (
  <Provider store={store}>{children}</Provider>
);
