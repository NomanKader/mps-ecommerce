import { NextFunction } from 'express';
import multer from 'multer';

import {
  IMAGE_UPLOAD_MAX_BYTES,
  imageUploadTooLargeMessage
} from '@shared/constants/upload.constants';
import { HTTP_STATUS } from '@core/response/http-status';
import { ApiError } from '@utils/ApiError';

type ImageUploadOptions = {
  files?: number;
  invalidTypeMessage?: string;
};

export const createMemoryImageUpload = ({
  files = 1,
  invalidTypeMessage = 'Only image files are allowed.'
}: ImageUploadOptions = {}) =>
  multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: IMAGE_UPLOAD_MAX_BYTES,
      files
    },
    fileFilter: (_req, file, callback) => {
      if (!file.mimetype.startsWith('image/')) {
        callback(new ApiError(HTTP_STATUS.BAD_REQUEST, invalidTypeMessage));
        return;
      }

      callback(null, true);
    }
  });

export const handleImageUploadError = (
  error: unknown,
  next: NextFunction,
  label = 'Image'
): void => {
  if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
    next(new ApiError(HTTP_STATUS.BAD_REQUEST, imageUploadTooLargeMessage(label)));
    return;
  }

  if (error) {
    next(error);
    return;
  }

  next();
};
