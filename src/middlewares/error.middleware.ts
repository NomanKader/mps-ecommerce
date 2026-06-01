import { NextFunction, Request, Response } from 'express';

import { logger } from '@config/logger';
import { HTTP_STATUS } from '@core/response/http-status';
import { ApiError } from '@utils/ApiError';
import { ApiResponse } from '@utils/ApiResponse';

export const errorMiddleware = (
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const normalizedError =
    error instanceof ApiError
      ? error
      : new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Internal server error');

  logger.error(error.message, { stack: error.stack });

  res
    .status(normalizedError.statusCode)
    .json(ApiResponse.error(normalizedError.message, normalizedError.details));
};
