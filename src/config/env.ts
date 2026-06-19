import { z } from 'zod';

const envSchema = z.object({
  VITE_APP_NAME: z.string().min(1),
  VITE_API_BASE_URL: z.string().url(),
  VITE_PRODUCTION_API_BASE_URL: z.string().url(),
  VITE_ASSET_BASE_URL: z.string().url(),
  VITE_DEFAULT_TENANT_ID: z.string().optional().default(''),
  VITE_DEFAULT_TENANT_SLUG: z.string().optional().default(''),
  VITE_ENABLE_ANALYTICS: z.enum(['true', 'false']).default('false'),
  VITE_APP_ENV: z.string().default('development'),
});

export const env = envSchema.parse(import.meta.env);
