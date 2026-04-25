import { RouterProvider as ReactRouterProvider } from 'react-router-dom';

import { router } from '@routes/index';

export const RouterProvider = () => <ReactRouterProvider router={router} />;
