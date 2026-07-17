import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/UserModel';

// Validates the JWT (from HttpOnly cookie or Authorization header) against the
// database and exposes the authenticated user via req.user.
export const attachUser = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies?.auth_token || req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    res.status(401).json({ error: { message: 'Authentication required', statusCode: 401 } });
    return;
  }

  try {
    const secret = process.env.JWT_SECRET || '';
    if (!secret) {
      res.status(500).json({ error: { message: 'JWT_SECRET not configured', statusCode: 500 } });
      return;
    }
    const decoded = jwt.verify(token, secret) as { userId: number; jti?: string };
    const userModel = new UserModel();
    const user = userModel.findById(decoded.userId);
    if (!user || !user.is_active) {
      res.status(401).json({ error: { message: 'User not found or inactive', statusCode: 401 } });
      return;
    }
    req.user = { id: user.id, role: user.role || 'user' };
    next();
  } catch (error) {
    res.status(401).json({ error: { message: 'Invalid or expired token', statusCode: 401 } });
  }
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({ error: { message: 'Admin access required', statusCode: 403 } });
    return;
  }
  next();
};
