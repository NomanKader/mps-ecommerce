export interface RegisterInput {
  tenantId?: string;
  email: string;
  name: string;
  phone: string;
  otp: string;
  password: string;
}

export interface LoginInput {
  tenantId?: string;
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RequestOtpInput {
  tenantId?: string;
  phone: string;
}

export interface UpdateProfileInput {
  email: string;
  name: string;
  phone: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export interface DeleteAccountInput {
  confirmation: 'DELETE';
  password: string;
}

export interface AuthTokens {
  accessToken: string;
}
