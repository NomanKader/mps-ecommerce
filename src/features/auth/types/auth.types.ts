import type { User } from '@entities/user/types/user.types';

export type LoginPayload = {
  email: string;
  password: string;
  rememberMe: boolean;
};

export type AuthSession = {
  accessToken: string;
  user: User;
};

export type RegisterPayload = {
  email: string;
  name: string;
  otp: string;
  password: string;
  phone: string;
};

export type RequestOtpPayload = Pick<RegisterPayload, 'phone'>;

export type RequestOtpResult = {
  developmentOtp?: string;
  expiresInSeconds: number;
};

export type UpdateProfilePayload = {
  email: string;
  name: string;
  phone: string;
};

export type ChangePasswordPayload = {
  currentPassword: string;
  newPassword: string;
};

export type DeleteAccountPayload = {
  confirmation: 'DELETE';
  password: string;
};

export type AuthApiResult<T> = {
  data: T;
  message: string;
};
