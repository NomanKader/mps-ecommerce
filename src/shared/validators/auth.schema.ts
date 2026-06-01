import { z } from 'zod';

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  rememberMe: z.boolean(),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  email: z.email(),
  name: z.string().min(2, 'Name is required'),
  otp: z.string().regex(/^\d{6}$/, 'Enter the 6-digit verification OTP'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  phone: z.string().regex(/^\+[1-9]\d{7,14}$/, 'Enter a valid international phone number'),
});

export type RegisterFormValues = z.infer<typeof registerSchema>;
