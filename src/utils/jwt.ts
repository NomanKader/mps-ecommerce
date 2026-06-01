import jwt, { JwtPayload, Secret, SignOptions } from 'jsonwebtoken';

import { env } from '@config/env';

type AccessTokenPayload = JwtPayload & {
  sub: string;
  role: string;
  tenantId?: string;
};

export const generateAccessToken = (payload: AccessTokenPayload, rememberMe = false): string =>
  jwt.sign(payload, env.JWT_ACCESS_SECRET as Secret, {
    expiresIn: rememberMe ? env.JWT_REMEMBER_ME_EXPIRES_IN : env.JWT_ACCESS_EXPIRES_IN
  } as SignOptions);

export const verifyAccessToken = (token: string): AccessTokenPayload =>
  jwt.verify(token, env.JWT_ACCESS_SECRET as Secret) as AccessTokenPayload;
