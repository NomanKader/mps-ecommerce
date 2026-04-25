import { appConfig } from '@config/app.config';

export const analyticsService = {
  identify(userId: string) {
    if (!appConfig.enableAnalytics) {
      return;
    }

    console.info('Analytics identify hook', userId);
  },
  pageView(pathname: string) {
    if (!appConfig.enableAnalytics) {
      return;
    }

    console.info('Analytics page view hook', pathname);
  },
};
