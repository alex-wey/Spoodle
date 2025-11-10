import { Router, Request, Response } from 'express';
import { authenticateClerk } from '../middleware/auth.js';
import { 
  getAllAvailableClinics, 
  getClinicById, 
  addUserToClerkOrganization 
} from '../utils/clinicSync.js';
import { assignClinicToPetOwner } from '../utils/userSync.js';

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
      count: clinics.length
    });
  } catch (error) {
    console.error('Get clinics error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error'
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
      data: req.clinic
    });
  } catch (error) {
    console.error('Get my clinic error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error'
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

export default router;

