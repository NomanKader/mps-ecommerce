import { NextFunction, Request, Response } from 'express';

import {
  createMemoryImageUpload,
  handleImageUploadError
} from '@shared/lib/multer-image-upload';

const upload = createMemoryImageUpload().single('image');
const pageSegmentUpload = createMemoryImageUpload({ files: 25 }).any();

export const productImageUploadMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  upload(req, res, (error: unknown) => {
    handleImageUploadError(error, next);
  });
};

export const pageSegmentImageUploadMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  pageSegmentUpload(req, res, (error: unknown) => {
    handleImageUploadError(error, next);
  });
};
