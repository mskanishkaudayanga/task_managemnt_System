import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.middleware';
import { ForbiddenError } from '../utils/errors';

export const requireAdmin = (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): void => {
  try {
    if (!req.user || req.user.role !== 'ADMIN') {
      throw new ForbiddenError('Admin privileges required');
    }
    next();
  } catch (error) {
    next(error);
  }
};
