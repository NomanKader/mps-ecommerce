import { NextFunction, Request, Response } from 'express';

import { Role } from '@common/enums/role.enum';
import { HTTP_STATUS } from '@core/response/http-status';
import { ApiError } from '@utils/ApiError';
import { verifyAccessToken } from '@utils/jwt';

export const authMiddleware = (req: Request, _res: Response, next: NextFunction): void => {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith('Bearer ')) {
    next(new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Authorization token is required'));
    return;
  }

  const token = authorization.replace('Bearer ', '');
  let payload;

  try {
    payload = verifyAccessToken(token);
  } catch {
    next(new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Authorization token is invalid or expired'));
    return;
  }

  req.auth = {
    userId: payload.sub,
    tenantId: payload.tenantId,
    role: (payload.role as Role) ?? Role.CUSTOMER
  };

  next();
};
