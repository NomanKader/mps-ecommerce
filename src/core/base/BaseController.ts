import { Response } from 'express';

import { ApiResponse } from '@utils/ApiResponse';

export abstract class BaseController {
  protected ok<T>(res: Response, data: T, message = 'Request successful', statusCode = 200): void {
    res.status(statusCode).json(ApiResponse.success(data, message));
  }
}
