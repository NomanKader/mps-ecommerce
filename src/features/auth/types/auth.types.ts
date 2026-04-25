import type { User } from '@entities/user/types/user.types';

export type LoginPayload = {
  email: string;
  password: string;
};

export type AuthSession = {
  accessToken: string;
  user: User;
};
