import { NextFunction, Request, Response } from 'express';

import { HTTP_STATUS } from '@core/response/http-status';
import { ApiError } from '@utils/ApiError';

export const notFoundMiddleware = (req: Request, _res: Response, next: NextFunction): void => {
  next(new ApiError(HTTP_STATUS.NOT_FOUND, `Route ${req.originalUrl} not found`));
};
