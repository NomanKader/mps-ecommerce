import { NextFunction, Request, Response } from 'express';
import multer from 'multer';

import { HTTP_STATUS } from '@core/response/http-status';
import { ApiError } from '@utils/ApiError';

const MAX_BULK_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const allowedMimeTypes = new Set([
  'text/csv',
  'application/csv',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_BULK_FILE_SIZE_BYTES,
    files: 1
  },
  fileFilter: (_req, file, callback) => {
    const filename = file.originalname.toLowerCase();
    const hasAllowedExtension =
      filename.endsWith('.csv') || filename.endsWith('.xls') || filename.endsWith('.xlsx');

    if (!allowedMimeTypes.has(file.mimetype) && !hasAllowedExtension) {
      callback(new ApiError(HTTP_STATUS.BAD_REQUEST, 'Only CSV or Excel files are allowed.'));
      return;
    }

    callback(null, true);
  }
}).single('file');

export const bulkProductUploadMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  upload(req, res, (error: unknown) => {
    if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
      next(new ApiError(HTTP_STATUS.BAD_REQUEST, 'Bulk file is too large. Please upload a file under 10MB.'));
      return;
    }

    if (error) {
      next(error);
      return;
    }

    next();
  });
};
