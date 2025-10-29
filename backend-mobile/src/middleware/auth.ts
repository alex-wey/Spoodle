import { Request, Response, NextFunction } from 'express';
import { createClerkClient, verifyToken } from '@clerk/backend';
import { getOrCreateUser } from '../utils/userSync.js';

// Initialize Clerk client once
const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY! });

// Extend Express Request type to include Clerk auth
declare global {
  namespace Express {
    interface Request {
      auth: {
        userId: string;
        sessionToken: string;
      };
      // Backward-compat: historically used in routes for ownership checks
      user?: {
        id: string;
        clerkUserId: string;
        createdAt: Date;
        updatedAt: Date;
      };
      // Explicit DB owner used for authorization/ownership checks
      petOwner?: {
        id: string;
        clerkUserId: string;
        createdAt: Date;
        updatedAt: Date;
      };
      // Minimal profile snapshot from Clerk used for email/display
      userProfile?: {
        email?: string;
        firstName?: string;
        lastName?: string;
        phone?: string | null;
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
    const { sub: userId } = await verifyToken(sessionToken, {
      secretKey: process.env.CLERK_SECRET_KEY!
    });
 
    // Get the user ID from the token
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token',
        message: 'User ID not found in token'
      });
    }

    req.auth = {
      userId: userId,
      sessionToken: sessionToken
    };

    // Fetch full user data from Clerk
    const { id, firstName, lastName, primaryEmailAddress, primaryPhoneNumber } = await clerk.users.getUser(userId);

    // Sync user to database (creates User + PetOwner if doesn't exist)
    try {
      const petOwner = await getOrCreateUser({
        clerkUserId: id,
        email: primaryEmailAddress?.emailAddress!,
        firstName: firstName!,
        lastName: lastName!,
        phone: primaryPhoneNumber?.phoneNumber ?? null,
      });
      
      // Attach objects to request
      // Backward-compat: keep req.user pointing to petOwner
      req.user = petOwner;
      req.petOwner = petOwner;
      req.userProfile = {
        email: primaryEmailAddress?.emailAddress,
        firstName: firstName ?? undefined,
        lastName: lastName ?? undefined,
        phone: primaryPhoneNumber?.phoneNumber ?? null,
      };
    } catch (syncError) {
      console.error('User sync error:', syncError);
      // Continue anyway - the auth is still valid even if sync fails
    }

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
