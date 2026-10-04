import { Outlet } from 'react-router-dom';

import { ScrollToTop } from '@app/providers/router/ScrollToTop';
import { StaticTextTranslator } from '@features/i18n/StaticTextTranslator';

export const App = () => (
  <>
    <ScrollToTop />
    <StaticTextTranslator />
    <Outlet />
  </>
);
