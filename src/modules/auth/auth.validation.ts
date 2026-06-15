import { z } from 'zod';

const internationalPhoneSchema = z.string().trim().regex(/^\+\d{7,15}$/, 'Phone number must include a valid country code');

export const registerSchema = z.object({
  body: z.object({
    email: z.email(),
    name: z.string().trim().min(2),
    phone: internationalPhoneSchema,
    otp: z.string().regex(/^\d{6}$/, 'OTP must contain 6 digits'),
    password: z.string().min(8)
  })
});

export const requestOtpSchema = z.object({
  body: z.object({
    phone: internationalPhoneSchema
  })
});

export const loginSchema = z.object({
  body: z.object({
    email: z.email(),
    password: z.string().min(8),
    rememberMe: z.boolean().optional().default(false)
  })
});
