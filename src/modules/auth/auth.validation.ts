import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    email: z.email(),
    name: z.string().trim().min(2),
    phone: z.string().trim().min(7).max(20),
    otp: z.string().regex(/^\d{6}$/, 'OTP must contain 6 digits'),
    password: z.string().min(8)
  })
});

export const requestOtpSchema = z.object({
  body: z.object({
    phone: z.string().trim().min(7).max(20)
  })
});

export const loginSchema = z.object({
  body: z.object({
    email: z.email(),
    password: z.string().min(8),
    rememberMe: z.boolean().optional().default(false)
  })
});
