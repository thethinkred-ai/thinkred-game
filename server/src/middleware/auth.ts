import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Decodes the JWT from the Authorization header and exposes the user id
// to downstream handlers via the `x-user-id` header.
export const attachUser = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

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
    const decoded = jwt.verify(token, secret) as any;
    req.headers['x-user-id'] = String(decoded.userId);
    next();
  } catch (error) {
    res.status(401).json({ error: { message: 'Invalid or expired token', statusCode: 401 } });
  }
};
