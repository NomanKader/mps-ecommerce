import { NextFunction, Request, Response } from 'express';
import { ZodError, ZodTypeAny } from 'zod';

import { HTTP_STATUS } from '@core/response/http-status';
import { ApiError } from '@utils/ApiError';

export const validateMiddleware =
  (schema: ZodTypeAny) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const result = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params
      }) as {
        body?: Request['body'];
        query?: Request['query'];
        params?: Request['params'];
      };

      if (result.body) req.body = result.body;
      if (result.query) req.query = result.query;
      if (result.params) req.params = result.params;

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        next(new ApiError(HTTP_STATUS.BAD_REQUEST, 'Validation failed', error.flatten()));
        return;
      }

      next(error);
    }
  };
