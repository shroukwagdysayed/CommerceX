import { Response, NextFunction } from 'express';
import { AuthRequest } from './authMiddleware';

/**
 * Middleware to restrict route access to administrators.
 * Expects user session to be loaded on request by 'protect' middleware.
 */
export const admin = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Not authorized. Admin access required.',
    });
  }
};
