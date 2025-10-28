import { Router, Request, Response } from 'express';
import { authenticateClerk } from '../middleware/auth.js';
import { updateUserProfile, deleteUserData } from '../utils/userSync.js';

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

    // User is already synced by authenticateClerk middleware
    return res.json({
      success: true,
      data: req.user,
      message: 'Profile retrieved successfully'
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error',
      message: 'Unable to retrieve user profile'
    });
  }
});

// Update user profile
router.put('/me', authenticateClerk, async (req: Request, res: Response) => {
  try {
    if (!req.auth) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: 'Please log in to update your profile'
      });
    }

    const { firstName, lastName, phone, address } = req.body;
    
    const updatedUser = await updateUserProfile(req.auth.userId, {
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
      error: 'Server error',
      message: 'Unable to update user profile'
    });
  }
});

// Delete account endpoint
router.delete('/me', authenticateClerk, async (req: Request, res: Response) => {
  try {
    if (!req.auth) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: 'Please log in to delete your account'
      });
    }

    await deleteUserData(req.auth.userId);
    
    return res.json({
      success: true,
      message: 'Account and all related data deleted successfully'
    });
  } catch (error) {
    console.error('❌ Delete account error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error',
      message: 'Unable to delete account. Please try again or contact support.'
    });
  }
});

// Health check endpoint for auth service
router.get('/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Clerk authentication service is running',
    timestamp: new Date().toISOString()
  });
});

export default router;