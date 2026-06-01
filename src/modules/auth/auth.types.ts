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

export interface AuthTokens {
  accessToken: string;
}
