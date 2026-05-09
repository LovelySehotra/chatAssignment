import { IUser } from '@/domain/models';
import { Request, Response, NextFunction } from 'express';

// Extend Express Request interface to include 'user'
declare global {
  namespace Express {
    interface Request {
      user?: IUser
    }
  }
}

export const PERMITTED_USER_TYPES = ['admin', 'staff'];
export function IsAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (!req.user) throw new Error('401::Unauthenticated');
  return next();
}

