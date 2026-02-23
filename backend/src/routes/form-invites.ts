import { Router, Request, Response } from 'express';
import { prisma } from '../index.js';
import { authenticateClerk } from '../middleware/auth.js';
import { z } from 'zod';

const router = Router();

// Apply authentication to all form invite routes
router.use(authenticateClerk);

// Validation schemas
const createFormInviteSchema = z.object({
  formLink: z.string().url('Invalid form URL'),
  formName: z.string().min(1, 'Form name is required'),
  petId: z.string().uuid('Invalid pet ID'),
});

/**
 * GET /api/form-invites
 * Get all form invites for the authenticated user/clinic
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    if (!req.staff && !req.petOwner) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: 'Please log in to view form invites',
      });
    }

    const where: any = {};

    // Optional filters from query params
    const { petId, clinicId: queryClinicId } = req.query;

    // Staff can see all clinic invites
    if (req.staff) {
      const targetClinicId = req.clinic?.id || (queryClinicId as string);
      
      if (!targetClinicId) {
        return res.status(400).json({
          success: false,
          error: 'Clinic ID required',
          message: 'Please provide a clinicId as a query parameter or ensure you are in an organization',
        });
      }
      where.clinicId = targetClinicId;
    } else if (req.petOwner) {
      // Pet owners can only see their own invites
      where.petOwnerId = req.petOwner.id;
    }

    // Apply pet filter if provided
    if (petId) {
      where.petId = petId as string;
    }

    const invites = await prisma.formInvite.findMany({
      where,
      include: {
        clinic: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        pet: {
          select: {
            id: true,
            name: true,
            species: true,
            breed: true,
            imageUrl: true,
          },
        },
        petOwner: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return res.json({
      success: true,
      data: invites,
    });
  } catch (error: any) {
    console.error('Error fetching form invites:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch form invites',
    });
  }
});

/**
 * GET /api/form-invites/:id
 * Get a specific form invite by ID
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    if (!req.staff && !req.petOwner) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: 'Please log in to view form invites',
      });
    }

    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request',
        message: 'Form invite ID is required',
      });
    }

    const invite = await prisma.formInvite.findUnique({
      where: { id },
      include: {
        clinic: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        pet: {
          select: {
            id: true,
            name: true,
            species: true,
            breed: true,
            imageUrl: true,
          },
        },
        petOwner: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
              },
            },
          },
        },
      },
    });

    if (!invite) {
      return res.status(404).json({
        success: false,
        error: 'Form invite not found',
      });
    }

    // Check permissions
    if (req.petOwner && invite.petOwnerId !== req.petOwner.id) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        message: 'You can only view your own form invites',
      });
    }

    if (req.staff && req.clinic && invite.clinicId !== req.clinic.id) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        message: 'You can only view form invites from your clinic',
      });
    }

    return res.json({
      success: true,
      data: invite,
    });
  } catch (error: any) {
    console.error('Error fetching form invite:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch form invite',
    });
  }
});

/**
 * POST /api/form-invites
 * Create a new form invite
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    if (!req.staff) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        message: 'Only staff members can create form invites',
      });
    }

    // Validate request body
    const validationResult = createFormInviteSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: validationResult.error.errors,
      });
    }

    const {
      formLink,
      formName,
      petId,
    } = validationResult.data;

    // Get pet and owner information
    const pet = await prisma.pet.findUnique({
      where: { id: petId },
      include: {
        petOwner: {
          include: {
            user: true,
            clinic: true,
          },
        },
      },
    });

    if (!pet) {
      return res.status(404).json({
        success: false,
        error: 'Pet not found',
      });
    }

    // Determine clinic
    const clinicId = req.clinic?.id || pet.petOwner.clinicId;
    if (!clinicId) {
      return res.status(400).json({
        success: false,
        error: 'Clinic required',
        message: 'Pet owner must be associated with a clinic',
      });
    }

    // Build form link with pre-filled data
    const formUrl = new URL(formLink);
    
    // Pre-populate form fields with pet and owner information
    const petOwnerId = pet.petOwner.id;
    formUrl.searchParams.set('petId', petId);
    formUrl.searchParams.set('petOwnerId', petOwnerId);
    formUrl.searchParams.set('clinicId', clinicId);
    
    if (pet.name) formUrl.searchParams.set('petName', pet.name);
    // Get owner email/phone from linked user
    const ownerEmail = pet.petOwner.user.email;
    const ownerPhone = pet.petOwner.user.phone;
    if (ownerEmail) formUrl.searchParams.set('email', ownerEmail);
    if (ownerPhone) formUrl.searchParams.set('phone', ownerPhone);

    const formLinkString = formUrl.toString();

    // Create invite in database
    const invite = await prisma.formInvite.create({
      data: {
        formLink: formLinkString,
        formName,
        clinicId,
        petId,
        petOwnerId: pet.petOwner.id,
      },
      include: {
        clinic: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        pet: {
          select: {
            id: true,
            name: true,
            species: true,
            breed: true,
            imageUrl: true,
          },
        },
        petOwner: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
              },
            },
          },
        },
      },
    });

    return res.status(201).json({
      success: true,
      data: invite,
      message: 'Form invite created successfully. The pet owner can now access the form.',
    });
  } catch (error: any) {
    console.error('Error creating form invite:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to create form invite',
    });
  }
});

/**
 * DELETE /api/form-invites/:id
 * Delete a form invite
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    if (!req.staff && !req.petOwner) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: 'Please log in to delete form invites',
      });
    }

    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request',
        message: 'Form invite ID is required',
      });
    }

    const invite = await prisma.formInvite.findUnique({
      where: { id },
    });

    if (!invite) {
      return res.status(404).json({
        success: false,
        error: 'Form invite not found',
      });
    }

    // Check permissions
    if (req.petOwner && invite.petOwnerId !== req.petOwner.id) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        message: 'You can only delete your own form invites',
      });
    }

    if (req.staff && req.clinic && invite.clinicId !== req.clinic.id) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        message: 'You can only delete form invites from your clinic',
      });
    }

    await prisma.formInvite.delete({
      where: { id },
    });

    return res.json({
      success: true,
      message: 'Form invite deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting form invite:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete form invite',
    });
  }
});

export default router;
