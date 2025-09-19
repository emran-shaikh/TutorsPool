import { Request, Response, NextFunction } from 'express';
import { dataManager } from '../dataManager';

// Simple JWT-like token generation (for development)
const generateToken = (userId: string, email: string, role: string) => {
  return Buffer.from(JSON.stringify({ userId, email, role, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 })).toString('base64');
};

const verifyToken = (token: string) => {
  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
    if (decoded.exp < Date.now()) {
      throw new Error('Token expired');
    }
    return decoded;
  } catch (error) {
    throw new Error('Invalid token');
  }
};

// Authentication middleware
export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

// Role-based authorization middleware
export const requireRole = (roles: string | string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        required: allowedRoles,
        current: req.user.role
      });
    }

    next();
  };
};

// Middleware to check user status (ACTIVE users only)
export const requireActiveUser = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  const user = dataManager.getUserById(req.user.userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  if (user.status !== 'ACTIVE') {
    return res.status(403).json({ 
      error: 'Account not approved', 
      status: user.status,
      message: user.status === 'PENDING' ? 'Your account is pending approval' :
               user.status === 'REJECTED' ? 'Your account has been rejected' :
               user.status === 'SUSPENDED' ? 'Your account has been suspended' :
               'Your account is not active'
    });
  }
  
  next();
};

export { generateToken, verifyToken };
