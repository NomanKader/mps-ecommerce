import { NextFunction, Request, Response } from 'express';

import {
  createMemoryImageUpload,
  handleImageUploadError
} from '@shared/lib/multer-image-upload';

const upload = createMemoryImageUpload({
  invalidTypeMessage: 'Only receipt image files are allowed.'
}).single('receipt');

export const walletReceiptUploadMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  upload(req, res, (error: unknown) => {
    handleImageUploadError(error, next, 'Receipt image');
  });
};
