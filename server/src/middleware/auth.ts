import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JwtPayload, AuthenticatedRequest } from '../types/trip';

interface JwtPayloadFromToken {
  userId: string;
  email: string;
}

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    res.status(401).json({ error: 'Access token required' });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayloadFromToken;
    req.user = { userId: decoded.userId, email: decoded.email };
    next();
  } catch (error) {
    res.status(403).json({ error: 'Invalid or expired token' });
  }
};
