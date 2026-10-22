import { resolvePublicUrls } from '../../config/public-urls';

describe('public payment URLs', () => {
  const config = {
    PUBLIC_API_BASE_URL: 'https://legacy.example.com',
    PRODUCTION_PUBLIC_API_BASE_URL: 'https://api.avsstoreonline.com',
    PRODUCTION_PUBLIC_APP_BASE_URL: 'https://avsstoreonline.com',
    DEVELOPMENT_PUBLIC_API_BASE_URL: 'https://tunnel.example.com'
  };
  it('selects development URLs', () => {
    expect(resolvePublicUrls({ ...config, APP_ENV: 'development' })).toEqual({
      PUBLIC_API_BASE_URL: 'https://tunnel.example.com',
      PUBLIC_APP_BASE_URL: 'http://localhost:5173'
    });
  });
  it('never falls back to production for a missing development tunnel', () => {
    expect(resolvePublicUrls({ ...config, APP_ENV: 'development', DEVELOPMENT_PUBLIC_API_BASE_URL: undefined }).PUBLIC_API_BASE_URL).toBeUndefined();
  });
  it('selects production URLs', () => {
    expect(resolvePublicUrls({ ...config, APP_ENV: 'production' }).PUBLIC_API_BASE_URL).toBe(config.PRODUCTION_PUBLIC_API_BASE_URL);
  });
  it('preserves legacy configuration without the switch', () => {
    expect(resolvePublicUrls(config).PUBLIC_API_BASE_URL).toBe(config.PUBLIC_API_BASE_URL);
  });
});
