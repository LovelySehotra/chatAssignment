import { Request, Response, NextFunction } from 'express';

// Extend Express Request interface to include 'user'
declare global {
  namespace Express {
    interface Request {
      user?: {
        role: string;
      };
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

export function IsAdministrator(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (req.user.role.trim() !== 'admin')
    throw new Error('404::Resource Not Found');
  next();
}
