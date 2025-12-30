import { Router, Request, Response } from 'express';
import { authenticateClerk } from '../middleware/auth.js';
import { createClerkClient } from '@clerk/backend';
import { 
  getAllAvailableClinics, 
  getClinicById, 
  addUserToClerkOrganization,
  removeUserFromClerkOrganization
} from '../utils/clinicSync.js';
import { assignClinicToPetOwner } from '../utils/userSync.js';
import { requireStaffClinic } from '../utils/clinicAuth.js';

const router = Router();

/**
 * GET /api/clinics
 * Get all active clinics for selection during signup
 * No authentication required (users need this before completing signup)
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const clinics = await getAllAvailableClinics();

    return res.json({
      success: true,
      data: clinics,
      count: clinics.length,
      message: 'Clinics retrieved successfully'
    });
  } catch (error) {
    console.error('Get clinics error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error',
      message: 'Unable to retrieve clinics'
    });
  }
});

/**
 * GET /api/clinics/my-clinic
 * Get the current user's clinic information
 * Requires authentication
 */
router.get('/my-clinic', authenticateClerk, async (req: Request, res: Response) => {
  try {
    if (!req.petOwner) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    // Clinic is already fetched by auth middleware and attached to req.clinic
    if (!req.clinic) {
      return res.status(404).json({
        success: false,
        error: 'No clinic assigned',
        message: 'You have not selected a clinic yet',
        requiresSetup: true
      });
    }

    return res.json({
      success: true,
      data: req.clinic,
      message: 'Clinic retrieved successfully'
    });
  } catch (error) {
    console.error('Get my clinic error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error',
      message: 'Unable to retrieve clinic'
    });
  }
});

/**
 * POST /api/clinics/select
 * Select a clinic during signup
 * Requires authentication
 */
router.post('/select', authenticateClerk, async (req: Request, res: Response) => {
  try {
    if (!req.auth || !req.petOwner) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: 'Please log in to select a clinic'
      });
    }

    const { clinicId } = req.body;

    if (!clinicId) {
      return res.status(400).json({
        success: false,
        error: 'Missing clinic ID',
        message: 'Please provide a clinic ID'
      });
    }

    // Check if clinic exists and is active
    const clinic = await getClinicById(clinicId);

    if (!clinic) {
      return res.status(404).json({
        success: false,
        error: 'Clinic not found',
        message: 'The selected clinic does not exist'
      });
    }

    if (!clinic.isActive) {
      return res.status(400).json({
        success: false,
        error: 'Clinic inactive',
        message: 'This clinic is not currently accepting new members'
      });
    }

    // Check if user already has a clinic assigned
    if (req.petOwner.clinicId) {
      return res.status(400).json({
        success: false,
        error: 'Clinic already assigned',
        message: 'You have already selected a clinic',
        currentClinic: await getClinicById(req.petOwner.clinicId)
      });
    }

    // Assign clinic to pet owner
    const updatedPetOwner = await assignClinicToPetOwner(req.petOwner.id, clinicId);

    // Add user to Clerk organization
    try {
      await addUserToClerkOrganization(req.auth.userId, clinic.clerkOrgId);
    } catch (orgError) {
      console.error('Warning: Failed to add user to Clerk organization:', orgError);
      // Continue anyway - the database assignment is more important
    }

    return res.json({
      success: true,
      data: {
        petOwner: updatedPetOwner,
        clinic: updatedPetOwner.clinic
      },
      message: 'Clinic selected successfully'
    });
  } catch (error) {
    console.error('Select clinic error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error',
      message: 'Unable to select clinic'
    });
  }
});

/**
 * POST /api/clinics/switch
 * Switch to a different clinic
 * Requires authentication
 */
router.post('/switch', authenticateClerk, async (req: Request, res: Response) => {
  try {
    if (!req.auth || !req.petOwner) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: 'Please log in to switch clinics'
      });
    }

    const { clinicId } = req.body;

    if (!clinicId) {
      return res.status(400).json({
        success: false,
        error: 'Missing clinic ID',
        message: 'Please provide a clinic ID'
      });
    }

    // Check if user has a current clinic
    if (!req.petOwner.clinicId) {
      return res.status(400).json({
        success: false,
        error: 'No current clinic',
        message: 'You must have a clinic assigned before switching'
      });
    }

    // Check if trying to switch to the same clinic
    if (req.petOwner.clinicId === clinicId) {
      return res.status(400).json({
        success: false,
        error: 'Same clinic',
        message: 'You are already a member of this clinic'
      });
    }

    // Get current clinic info
    const currentClinic = await getClinicById(req.petOwner.clinicId);
    if (!currentClinic) {
      return res.status(404).json({
        success: false,
        error: 'Current clinic not found',
        message: 'Could not find your current clinic'
      });
    }

    // Get new clinic info
    const newClinic = await getClinicById(clinicId);
    if (!newClinic) {
      return res.status(404).json({
        success: false,
        error: 'Clinic not found',
        message: 'The selected clinic does not exist'
      });
    }

    if (!newClinic.isActive) {
      return res.status(400).json({
        success: false,
        error: 'Clinic inactive',
        message: 'This clinic is not currently accepting new members'
      });
    }

    // Step 1: Remove from current Clerk organization
    try {
      await removeUserFromClerkOrganization(req.auth.userId, currentClinic.clerkOrgId);
    } catch (orgError) {
      console.error('Warning: Failed to remove user from current Clerk organization:', orgError);
      // Continue anyway - we'll try to add to new org
    }

    // Step 2: Add to new Clerk organization
    try {
      await addUserToClerkOrganization(req.auth.userId, newClinic.clerkOrgId);
    } catch (orgError) {
      console.error('Error: Failed to add user to new Clerk organization:', orgError);
      // Try to rollback - add user back to original org
      try {
        await addUserToClerkOrganization(req.auth.userId, currentClinic.clerkOrgId);
      } catch (rollbackError) {
        console.error('Critical: Failed to rollback Clerk org membership:', rollbackError);
      }
      
      return res.status(500).json({
        success: false,
        error: 'Organization update failed',
        message: 'Failed to update your organization membership. Please try again.'
      });
    }

    // Step 3: Update database
    const updatedPetOwner = await assignClinicToPetOwner(req.petOwner.id, clinicId);

    return res.json({
      success: true,
      data: {
        petOwner: updatedPetOwner,
        previousClinic: currentClinic,
        newClinic: updatedPetOwner.clinic
      },
      message: `Successfully switched from ${currentClinic.name} to ${newClinic.name}`
    });
  } catch (error) {
    console.error('Switch clinic error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error',
      message: 'Unable to switch clinics'
    });
  }
});

/**
 * POST /api/clinics/staff/verify
 * Verify staff access to a clinic
 * Staff must pass clinicId as query param or in body
 * Uses requireStaffClinic middleware to verify access
 */
router.post('/staff/verify', authenticateClerk, requireStaffClinic, async (req: Request, res: Response) => {
  return res.json({
    success: true,
    data: {
      clinic: req.clinic
    },
    message: `Successfully verified access to ${req.clinic!.name}`
  });
});

export default router;

