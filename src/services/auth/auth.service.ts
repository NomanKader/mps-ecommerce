import { jwtDecode } from 'jwt-decode';

import type { User } from '@entities/user/types/user.types';
import { tokenService } from '@services/auth/token.service';
import { tenantService } from '@services/tenant/tenant.service';

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
  setAuthenticatedSession(token: string, user: User, rememberMe = false) {
    tokenService.setAccessToken(token, rememberMe);
    if (user.tenantId) {
      tenantService.setTenantId(user.tenantId, rememberMe);
    }
  },
  signOut() {
    tokenService.clear();
  },
};
