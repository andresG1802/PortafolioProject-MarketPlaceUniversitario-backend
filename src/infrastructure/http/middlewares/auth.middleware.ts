import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../../../shared/utils/jwt.util';
import { UnauthorizedError } from '../../../shared/errors/AppError';

export interface AuthRequest extends Request {
  userId?: number;
  userEmail?: string;
}

export const authMiddleware = (req: AuthRequest, _res: Response, next: NextFunction): void => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) throw new UnauthorizedError('Token requerido');

  const token = auth.split(' ')[1];
  const payload = verifyToken(token);
  req.userId = payload.userId;
  req.userEmail = payload.email;
  next();
};
