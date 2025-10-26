import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '@clerk/backend';

// Extend Express Request type to include Clerk auth
declare global {
  namespace Express {
    interface Request {
      auth?: {
        userId: string;
        email: string;
        firstName: string;
        lastName: string;
        sessionId: string;
      };
    }
  }
}

export const authenticateClerk = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers['authorization'];
    const sessionToken = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!sessionToken) {
      return res.status(401).json({
        success: false,
        error: 'Session token required',
        message: 'Please provide a Clerk session token'
      });
    }

    // Verify Clerk session token
    const payload = await verifyToken(sessionToken, {
      secretKey: process.env.CLERK_SECRET_KEY!
    });

    // Extract user info from Clerk token
    req.auth = {
      userId: payload.sub || '', // Clerk user ID
      email: (payload.email as string) || '',
      firstName: (payload.first_name as string) || '',
      lastName: (payload.last_name as string) || '',
      sessionId: (payload.sid as string) || ''
    };

    return next();
  } catch (error) {
    console.error('Clerk authentication error:', error);
    return res.status(401).json({
      success: false,
      error: 'Invalid session token',
      message: 'Clerk session token is invalid or expired'
    });
  }
};

export const optionalClerkAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers['authorization'];
    const sessionToken = authHeader && authHeader.split(' ')[1];

    if (!sessionToken) {
      return next(); // Continue without authentication
    }

    // Try to verify token, but don't fail if invalid
    const payload = await verifyToken(sessionToken, {
      secretKey: process.env.CLERK_SECRET_KEY!
    });

    req.auth = {
      userId: payload.sub || '',
      email: (payload.email as string) || '',
      firstName: (payload.first_name as string) || '',
      lastName: (payload.last_name as string) || '',
      sessionId: (payload.sid as string) || ''
    };

    next();
  } catch (error) {
    // Continue without authentication if token is invalid
    next();
  }
};
