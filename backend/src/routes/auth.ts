import { Router, Request, Response } from 'express';
import { authenticateClerk } from '../middleware/auth.js';
import { updateUserProfile, deleteUserData } from '../utils/userSync.js';
import { prisma } from '../index.js';

const router = Router();

// Get current user profile
router.get('/me', authenticateClerk, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: 'Please log in to access your profile'
      });
    }

    // Fetch the User record from the database to get the address
    // For authenticated users, clerkUserId is always present
    const dbUser = req.user.clerkUserId ? await prisma.user.findUnique({
      where: { clerkUserId: req.user.clerkUserId },
      select: {
        id: true,
        clerkUserId: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        address: true,
        createdAt: true,
        updatedAt: true
      }
    }) : null;

    // Merge DB user with Clerk profile fields for display
    const merged = {
      id: dbUser?.id ?? req.user.id,
      clerkUserId: req.user.clerkUserId,
      createdAt: dbUser?.createdAt ?? (req.user as any).createdAt,
      updatedAt: dbUser?.updatedAt ?? (req.user as any).updatedAt,
      // Use DB user fields first, fallback to Clerk profile
      email: dbUser?.email ?? req.userProfile?.email ?? null,
      firstName: dbUser?.firstName ?? req.userProfile?.firstName ?? null,
      lastName: dbUser?.lastName ?? req.userProfile?.lastName ?? null,
      phone: dbUser?.phone ?? req.userProfile?.phone ?? null,
      // Address comes from the User table
      address: dbUser?.address ?? null,
      // Include user type (petOwner or staff)
      userType: req.userType || null,
      // Include clinic data if available (already fetched in middleware)
      clinic: req.clinic || null,
    };

    return res.json({
      success: true,
      data: merged,
      message: 'Profile retrieved successfully'
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve profile',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Update user profile
router.put('/profile', authenticateClerk, async (req: Request, res: Response) => {
  try {
    if (!req.petOwner && !req.staff) {
      return res.status(401).json({
        success: false,
        error: 'User record not found',
        message: 'Please complete signup first'
      });
    }

    const { firstName, lastName, phone, address } = req.body;

    if (!req.user?.clerkUserId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: 'User not authenticated'
      });
    }

    const updatedUser = await updateUserProfile(req.user.clerkUserId, {
      firstName,
      lastName,
      phone,
      address
    });

    return res.json({
      success: true,
      data: updatedUser,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to update profile',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Delete user account and all associated data
router.delete('/account', authenticateClerk, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: 'Please log in to delete your account'
      });
    }

    if (!req.user.clerkUserId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: 'User not authenticated'
      });
    }

    await deleteUserData(req.user.clerkUserId);

    return res.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    console.error('Delete account error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to delete account',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
