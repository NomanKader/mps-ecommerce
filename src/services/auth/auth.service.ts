import { jwtDecode } from 'jwt-decode';

import type { User } from '@entities/user/types/user.types';
import { tokenService } from '@services/auth/token.service';

type JwtPayload = {
  exp?: number;
  sub?: string;
};

export const authService = {
  getCurrentToken() {
    return tokenService.getAccessToken();
  },
  getDecodedToken() {
    const token = tokenService.getAccessToken();

    return token ? jwtDecode<JwtPayload>(token) : null;
  },
  isAuthenticated() {
    const payload = this.getDecodedToken();

    return Boolean(payload?.sub);
  },
  setAuthenticatedSession(token: string, _user?: User, rememberMe = false) {
    tokenService.setAccessToken(token, rememberMe);
  },
  signOut() {
    tokenService.clear();
  },
};
