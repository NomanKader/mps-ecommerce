import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config({ quiet: true });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(5001),
  API_PREFIX: z.string().default('/api/v1'),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
  JWT_ACCESS_SECRET: z.string().min(16, 'JWT_ACCESS_SECRET must be at least 16 characters'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('1d'),
  JWT_REMEMBER_ME_EXPIRES_IN: z.string().default('30d'),
  OTP_EXPIRES_IN_MINUTES: z.coerce.number().int().positive().default(5),
  OTP_RESEND_DELAY_SECONDS: z.coerce.number().int().nonnegative().default(60),
  CORS_ORIGIN: z.string().default('*'),
  APP_NAME: z.string().default('MPS Ecommerce SaaS API'),
  LOG_LEVEL: z.string().default('info'),
  TENANT_HEADER_KEY: z.string().default('x-tenant-id'),
  AWS_ACCESS_KEY_ID: z.string().min(1, 'AWS_ACCESS_KEY_ID is required for S3 image uploads'),
  AWS_SECRET_ACCESS_KEY: z
    .string()
    .min(1, 'AWS_SECRET_ACCESS_KEY is required for S3 image uploads'),
  AWS_REGION: z.string().default('ap-southeast-1'),
  S3_BUCKET_NAME: z.string().min(1, 'S3_BUCKET_NAME is required for S3 image uploads'),
  S3_SIGNED_URL_EXPIRES_IN_SECONDS: z.coerce.number().int().positive().default(3600),
  GOOGLE_DRIVE_PRODUCT_IMAGES_FOLDER_ID: z.string().default('1xSSxy-7Tk5NPj1ur5Gw8jCLx47Rl42Ym'),
  GOOGLE_SERVICE_ACCOUNT_EMAIL: z.string().optional(),
  GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY: z.string().optional()
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  const formatted = parsedEnv.error.issues
    .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
    .join(', ');

  throw new Error(`Invalid environment configuration: ${formatted}`);
}

export const env = parsedEnv.data;
