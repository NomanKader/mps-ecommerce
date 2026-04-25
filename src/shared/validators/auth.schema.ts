import { z } from 'zod';

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  email: z.email(),
  name: z.string().min(2, 'Name is required'),
  otp: z.string().min(4, 'Verification OTP is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  phone: z.string().min(8, 'Phone number is required'),
});

export type RegisterFormValues = z.infer<typeof registerSchema>;
