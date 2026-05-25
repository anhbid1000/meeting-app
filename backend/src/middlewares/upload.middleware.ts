import multer from 'multer';
import { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/AppError';

const storage = multer.memoryStorage();

const uploader = multer({
  storage,
  limits: {
    fileSize: 200 * 1024 * 1024, // 200MB per request; workspace quota is checked in service
  },
}).single('file');

export const uploadSingleFile = (req: Request, res: Response, next: NextFunction) => {
  uploader(req, res, (err: any) => {
    if (!err) return next();

    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(new AppError('File quá lớn. Giới hạn mỗi file là 200MB', 400, 'FILE_TOO_LARGE'));
      }
      return next(new AppError(err.message || 'Upload file không hợp lệ', 400, 'UPLOAD_INVALID'));
    }

    if (typeof err === 'object' && err !== null && !('message' in err)) {
      return next(new AppError('Upload thất bại do định dạng dữ liệu không hợp lệ', 400, 'UPLOAD_INVALID'));
    }

    return next(err);
  });
};
