// import { Request, Response, NextFunction } from 'express';
// import jwt from 'jsonwebtoken';

// export const auth = (req: Request, res: Response, next: NextFunction) => {
//   const token = req.headers.authorization?.split(' ')[1];
//   if (!token) return res.status(401).json({ message: 'Không tìm thấy token xác thực' });

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
//     (req as any).user = decoded; // Gán payload (chứa id user) vào req
//     next();
//   } catch (err) {
//     res.status(401).json({ message: 'Token không hợp lệ' });
//   }
// };


// Fake auth middleware cho dev (bỏ khi có module User thật)
import { Request, Response, NextFunction } from 'express';

export const auth = (req: Request, res: Response, next: NextFunction) => {
  // Mock user cho dev (bỏ dòng này khi có module User thật)
  (req as any).user = {
    id: '507f1f77bcf86cd799439011', // ObjectId giả
    plan: 'pro' // hoặc 'standard'
  };
  next();
};