import { NextFunction, Request, Response } from 'express';
import multer from 'multer';

import { HTTP_STATUS } from '@core/response/http-status';
import { ApiError } from '@utils/ApiError';

const MAX_RECEIPT_SIZE_BYTES = 5 * 1024 * 1024;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_RECEIPT_SIZE_BYTES,
    files: 1
  },
  fileFilter: (_req, file, callback) => {
    if (!file.mimetype.startsWith('image/')) {
      callback(new ApiError(HTTP_STATUS.BAD_REQUEST, 'Only receipt image files are allowed.'));
      return;
    }

    callback(null, true);
  }
}).single('receipt');

export const walletReceiptUploadMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  upload(req, res, (error: unknown) => {
    if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
      next(new ApiError(HTTP_STATUS.BAD_REQUEST, 'Receipt image is too large. Please upload an image under 5MB.'));
      return;
    }

    if (error) {
      next(error);
      return;
    }

    next();
  });
};
