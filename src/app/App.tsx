import { Outlet } from 'react-router-dom';

import { ScrollToTop } from '@app/providers/router/ScrollToTop';

export const App = () => (
  <>
    <ScrollToTop />
    <Outlet />
  </>
);
