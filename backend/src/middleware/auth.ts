import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthUser } from '../database/entities/index.js';

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export interface JWTPayload {
  petOwnerId: string;
  email: string;
  username: string;
  iat?: number;
  exp?: number;
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Access token required',
      message: 'Please provide a valid authentication token'
    });
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    console.error('JWT_SECRET not configured');
    return res.status(500).json({
      success: false,
      error: 'Server configuration error',
      message: 'Authentication service not properly configured'
    });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as JWTPayload;
    
    // Set user info on request
    req.user = {
      petOwnerId: decoded.petOwnerId,
      email: decoded.email,
      username: decoded.username
    };
    
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        success: false,
        error: 'Token expired',
        message: 'Your session has expired. Please log in again.'
      });
    } else if (error instanceof jwt.JsonWebTokenError) {
      return res.status(403).json({
        success: false,
        error: 'Invalid token',
        message: 'The provided token is not valid'
      });
    }
    
    return res.status(403).json({
      success: false,
      error: 'Authentication failed',
      message: 'Unable to verify authentication token'
    });
  }
};

export const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next(); // Continue without user info
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    return next(); // Continue without user info if JWT not configured
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as JWTPayload;
    req.user = {
      petOwnerId: decoded.petOwnerId,
      email: decoded.email,
      username: decoded.username
    };
  } catch (error) {
    // Ignore auth errors for optional auth
  }
  
  next();
};
