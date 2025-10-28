import { Router, Request, Response } from 'express';
import { authenticateClerk } from '../middleware/auth';
import { prisma } from '../index';

const router = Router();

// Apply authentication to all settings routes
router.use(authenticateClerk);

// Get user settings
router.get('/', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: 'Please log in to view settings'
      });
    }

    // Get the PetOwner for this user
    const petOwner = await prisma.petOwner.findUnique({
      where: { clerkUserId: req.user.clerkUserId },
      include: { settings: true }
    });

    if (!petOwner) {
      return res.status(500).json({
        success: false,
        error: 'Pet owner not found',
        message: 'Unable to find pet owner record. Please contact support.'
      });
    }

    // If settings don't exist, create default settings
    if (!petOwner.settings) {
      const newSettings = await prisma.settings.create({
        data: {
          petOwnerId: petOwner.id,
          theme: 'light',
          language: 'en',
          notifications: true,
          biometricAuth: false
        }
      });

      return res.json({
        success: true,
        data: newSettings,
        message: 'Settings retrieved successfully'
      });
    }

    return res.json({
      success: true,
      data: petOwner.settings,
      message: 'Settings retrieved successfully'
    });
  } catch (error) {
    console.error('Get settings error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error',
      message: 'Unable to retrieve settings'
    });
  }
});

// Update user settings
router.put('/', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: 'Please log in to update settings'
      });
    }

    const { theme, language, notifications, biometricAuth, profileImageUrl } = req.body;

    // Get the PetOwner for this user
    const petOwner = await prisma.petOwner.findUnique({
      where: { clerkUserId: req.user.clerkUserId },
      include: { settings: true }
    });

    if (!petOwner) {
      return res.status(500).json({
        success: false,
        error: 'Pet owner not found',
        message: 'Unable to find pet owner record. Please contact support.'
      });
    }

    // Validate image URL if provided
    let cleanImageUrl = profileImageUrl;
    if (profileImageUrl !== undefined) {
      // Reject blob URLs
      if (profileImageUrl && profileImageUrl.startsWith('blob:')) {
        console.warn('Rejected blob URL:', profileImageUrl);
        cleanImageUrl = null;
      }
      // Accept base64 data URLs and HTTP/HTTPS URLs
      else if (
        profileImageUrl &&
        !profileImageUrl.startsWith('data:image/') &&
        !profileImageUrl.startsWith('http://') &&
        !profileImageUrl.startsWith('https://')
      ) {
        console.warn('Rejected invalid image URL:', profileImageUrl);
        cleanImageUrl = null;
      }
    }

    // Prepare update data (only include fields that were provided)
    const updateData: any = {};
    if (theme !== undefined) updateData.theme = theme;
    if (language !== undefined) updateData.language = language;
    if (notifications !== undefined) updateData.notifications = notifications;
    if (biometricAuth !== undefined) updateData.biometricAuth = biometricAuth;
    if (profileImageUrl !== undefined) updateData.profileImageUrl = cleanImageUrl;

    let updatedSettings;

    // If settings exist, update them
    if (petOwner.settings) {
      updatedSettings = await prisma.settings.update({
        where: { petOwnerId: petOwner.id },
        data: updateData
      });
    } else {
      // Create settings with default values and provided updates
      updatedSettings = await prisma.settings.create({
        data: {
          petOwnerId: petOwner.id,
          theme: theme || 'light',
          language: language || 'en',
          notifications: notifications !== undefined ? notifications : true,
          biometricAuth: biometricAuth || false,
          profileImageUrl: cleanImageUrl
        }
      });
    }

    return res.json({
      success: true,
      data: updatedSettings,
      message: 'Settings updated successfully'
    });
  } catch (error) {
    console.error('Update settings error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error',
      message: 'Unable to update settings'
    });
  }
});

export default router;

