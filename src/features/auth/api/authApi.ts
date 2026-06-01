import { apiClient } from '@shared/api/axios';
import { endpoints } from '@shared/api/endpoints';

import type { User } from '@entities/user/types/user.types';
import type {
  AuthApiResult,
  AuthSession,
  LoginPayload,
  RegisterPayload,
  RequestOtpPayload,
  RequestOtpResult,
} from '@features/auth/types/auth.types';

type BackendResponse<T> = {
  data: T;
  message: string;
  success: boolean;
};

type BackendUser = Omit<User, 'id'> & {
  _id: string;
};

type BackendAuthSession = {
  accessToken: string;
  user: BackendUser;
};

const mapUser = ({ _id, ...user }: BackendUser): User => ({
  ...user,
  id: _id,
});

const mapSession = (session: BackendAuthSession): AuthSession => ({
  accessToken: session.accessToken,
  user: mapUser(session.user),
});

export const authApi = {
  async getCurrentUser(): Promise<AuthApiResult<User>> {
    const response = await apiClient.get<BackendResponse<BackendUser>>(endpoints.auth.me);

    return {
      data: mapUser(response.data.data),
      message: response.data.message,
    };
  },
  async login(payload: LoginPayload): Promise<AuthApiResult<AuthSession>> {
    const response = await apiClient.post<BackendResponse<BackendAuthSession>>(
      endpoints.auth.login,
      payload,
    );

    return {
      data: mapSession(response.data.data),
      message: response.data.message,
    };
  },
  async logout(): Promise<AuthApiResult<{ loggedOut: boolean }>> {
    const response = await apiClient.post<BackendResponse<{ loggedOut: boolean }>>(
      endpoints.auth.logout,
    );

    return {
      data: response.data.data,
      message: response.data.message,
    };
  },
  async register(payload: RegisterPayload): Promise<AuthApiResult<AuthSession>> {
    const response = await apiClient.post<BackendResponse<BackendAuthSession>>(
      endpoints.auth.register,
      payload,
    );

    return {
      data: mapSession(response.data.data),
      message: response.data.message,
    };
  },
  async requestOtp(payload: RequestOtpPayload): Promise<AuthApiResult<RequestOtpResult>> {
    const response = await apiClient.post<BackendResponse<RequestOtpResult>>(
      endpoints.auth.requestOtp,
      payload,
    );

    return {
      data: response.data.data,
      message: response.data.message,
    };
  },
};
