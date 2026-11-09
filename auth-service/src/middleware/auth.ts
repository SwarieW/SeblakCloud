import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extend the Express Request interface so TypeScript knows about req.user
export interface AuthRequest extends Request {
  user?: { id: number; username: string; role: string };
}

// 1. Verify if the token exists and is valid
export const authenticateJWT = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
    return;
  }

  const token = authHeader.split(' ')[1];
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    res.status(500).json({ error: 'Internal Server Error: JWT_SECRET missing' });
    return;
  }

  try {
    const decoded = jwt.verify(token, secret) as { id: number; username: string; role: string };
    req.user = decoded; // Attach the decoded payload (id, username, role) to the request
    next(); // Pass control to the next function
  } catch (error) {
    res.status(403).json({ error: 'Forbidden: Invalid or expired token' });
  }
};

// 2. Verify if the user holds the correct role (Admin vs User)
export const authorizeRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ error: 'Forbidden: Insufficient permissions for this action' });
      return;
    }
    next();
  };
};