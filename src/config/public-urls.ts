type PublicUrlConfig = {
  APP_ENV?: 'development' | 'production';
  PUBLIC_API_BASE_URL?: string;
  PUBLIC_APP_BASE_URL?: string;
  DEVELOPMENT_PUBLIC_API_BASE_URL?: string;
  DEVELOPMENT_PUBLIC_APP_BASE_URL?: string;
  PRODUCTION_PUBLIC_API_BASE_URL?: string;
  PRODUCTION_PUBLIC_APP_BASE_URL?: string;
};

export function resolvePublicUrls(config: PublicUrlConfig) {
  if (config.APP_ENV === 'development') {
    return {
      PUBLIC_API_BASE_URL: config.DEVELOPMENT_PUBLIC_API_BASE_URL,
      PUBLIC_APP_BASE_URL: config.DEVELOPMENT_PUBLIC_APP_BASE_URL ?? 'http://localhost:5173'
    };
  }
  if (config.APP_ENV === 'production') {
    return {
      PUBLIC_API_BASE_URL: config.PRODUCTION_PUBLIC_API_BASE_URL,
      PUBLIC_APP_BASE_URL: config.PRODUCTION_PUBLIC_APP_BASE_URL
    };
  }
  // Preserve existing deployments until they opt into environment-specific URLs.
  return {
    PUBLIC_API_BASE_URL: config.PUBLIC_API_BASE_URL,
    PUBLIC_APP_BASE_URL: config.PUBLIC_APP_BASE_URL
  };
}
