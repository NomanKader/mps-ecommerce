import { NextFunction, Request, Response } from 'express';

import { Role } from '@common/enums/role.enum';
import { HTTP_STATUS } from '@core/response/http-status';
import { ApiError } from '@utils/ApiError';

export const roleMiddleware =
  (...roles: Role[]) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    const role = req.auth?.role;

    if (!role || !roles.includes(role)) {
      next(new ApiError(HTTP_STATUS.FORBIDDEN, 'Insufficient permissions'));
      return;
    }

    next();
  };
