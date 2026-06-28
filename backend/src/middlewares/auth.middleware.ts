import { Request, Response, NextFunction } from 'express';
import { JwtHelper } from '../utils/jwt';
import { UnauthorizedError } from '../utils/errors';
import { prisma } from '../config/db';

// Extend Express Request type locally in modules/middlewares if TS declaration merging is not auto-loaded
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: 'ADMIN' | 'USER';
  };
}

export const authenticate = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Authorization token is missing or invalid');
    }

    const token = authHeader.split(' ')[1];
    let payload;
    try {
      payload = JwtHelper.verifyToken(token);
    } catch (err) {
      throw new UnauthorizedError('Token is invalid or expired');
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });

    if (!user) {
      throw new UnauthorizedError('User associated with token does not exist');
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role as 'ADMIN' | 'USER',
    };

    next();
  } catch (error) {
    next(error);
  }
};
