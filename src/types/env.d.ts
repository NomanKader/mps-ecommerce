interface ImportMetaEnv {
  readonly VITE_APP_NAME: string;
  readonly VITE_API_BASE_URL: string;
  readonly VITE_PRODUCTION_API_BASE_URL: string;
  readonly VITE_ASSET_BASE_URL: string;
  readonly VITE_DEFAULT_TENANT_ID?: string;
  readonly VITE_DEFAULT_TENANT_SLUG: string;
  readonly VITE_ENABLE_ANALYTICS: string;
  readonly VITE_APP_ENV: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
