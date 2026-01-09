import { Router, Request, Response } from 'express';
import { prisma } from '../index.js';
import { authenticateClerk } from '../middleware/auth.js';
import {
  getEventType,
  getCurrentUser,
} from '../utils/calcom.js';
import { z } from 'zod';

const router = Router();

// Apply authentication to all appointment invite routes
router.use(authenticateClerk);

// Validation schemas
const createInviteSchema = z.object({
  eventTypeId: z.string().min(1, 'Event type ID is required'),
  petId: z.string().uuid('Invalid pet ID'),
  appointmentId: z.string().uuid('Invalid appointment ID').optional(),
});

/**
 * GET /api/appointment-invites
 * Get all appointment invites for the authenticated user/clinic
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    if (!req.staff && !req.petOwner) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: 'Please log in to view appointment invites',
      });
    }

    const where: any = {};

    // Staff can see all clinic invites
    if (req.staff && req.clinic) {
      where.clinicId = req.clinic.id;
    }
    // Pet owners can only see their own invites
    else if (req.petOwner) {
      where.petOwnerId = req.petOwner.id;
    } else {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        message: 'You do not have permission to view appointment invites',
      });
    }

    // Optional filters
    const { petId, staffId, clinicId, appointmentId } = req.query;
    if (petId) where.petId = petId as string;
    if (staffId) where.staffId = staffId as string;
    if (clinicId && req.staff) where.clinicId = clinicId as string;
    if (appointmentId) where.appointmentId = appointmentId as string;

    const invites = await prisma.appointmentInvite.findMany({
      where,
      include: {
        clinic: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        staff: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
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
        appointment: {
          select: {
            id: true,
            status: true,
            externalAppointmentId: true,
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
    console.error('Error fetching appointment invites:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch appointment invites',
    });
  }
});

/**
 * GET /api/appointment-invites/:id
 * Get a specific appointment invite by ID
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Appointment invite ID is required',
      });
    }

    const invite = await prisma.appointmentInvite.findUnique({
      where: { id },
      include: {
        clinic: true,
        staff: {
          include: {
            user: true,
          },
        },
        pet: true,
        petOwner: {
          include: {
            user: true,
          },
        },
        appointment: true,
      },
    });

    if (!invite) {
      return res.status(404).json({
        success: false,
        error: 'Appointment invite not found',
      });
    }

    // Check access permissions
    if (req.petOwner && invite.petOwnerId !== req.petOwner.id) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        message: 'You do not have permission to view this invite',
      });
    }

    if (req.staff && req.clinic && invite.clinicId !== req.clinic.id) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        message: 'You do not have permission to view this invite',
      });
    }

    // Return invite data (booking link is stored in database)
    return res.json({
      success: true,
      data: invite,
    });
  } catch (error: any) {
    console.error('Error fetching appointment invite:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch appointment invite',
    });
  }
});

/**
 * POST /api/appointment-invites
 * Create a new appointment invite (generates Cal.com booking link)
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    if (!req.staff) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        message: 'Only staff members can create appointment invites',
      });
    }

    // Validate request body
    const validationResult = createInviteSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: validationResult.error.errors,
      });
    }

    const {
      eventTypeId,
      petId,
      appointmentId,
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

    const staffId = req.staff.id;

    // If appointmentId is provided, verify it exists and belongs to the same clinic
    if (appointmentId) {
      const appointment = await prisma.appointment.findUnique({
        where: { id: appointmentId },
      });

      if (!appointment) {
        return res.status(404).json({
          success: false,
          error: 'Appointment not found',
        });
      }

      if (appointment.clinicId !== clinicId) {
        return res.status(403).json({
          success: false,
          error: 'Access denied',
          message: 'Appointment does not belong to this clinic',
        });
      }
    }

    // Get event type from Cal.com to generate booking link
    let eventType;
    try {
      const eventTypeIdNum = parseInt(eventTypeId);
      if (isNaN(eventTypeIdNum)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid event type ID',
          message: 'Event type ID must be a number',
        });
      }
      eventType = await getEventType(eventTypeIdNum) as any;
    } catch (calcomError: any) {
      return res.status(404).json({
        success: false,
        error: 'Event type not found',
        message: calcomError.message || 'Could not find the specified event type in Cal.com',
      });
    }

    // Get current user to build scheduling URL
    const calcomUser = await getCurrentUser() as any;
    const username = calcomUser?.username || calcomUser?.name;
    const eventSlug = eventType?.slug || eventType?.title?.toLowerCase().replace(/\s+/g, '-');

    if (!username || !eventSlug) {
      return res.status(400).json({
        success: false,
        error: 'Scheduling URL not available',
        message: 'Could not determine username or event slug from Cal.com',
      });
    }

    // Build Cal.com scheduling URL
    const baseUrl = eventType?.teamId 
      ? `https://${eventType.teamSlug}.cal.com`
      : 'https://cal.com';
    const schedulingUrl = `${baseUrl}/${username}/${eventSlug}`;

    const ownerName = `${pet.petOwner.user.firstName} ${pet.petOwner.user.lastName}`;
    const ownerEmail = pet.petOwner.user.email;

    if (!ownerEmail) {
      return res.status(400).json({
        success: false,
        error: 'Pet owner email required',
        message: 'Pet owner must have an email address to generate a booking link',
      });
    }

    // Create a URL with pre-filled data and hidden fields
    // Hidden fields configured in event type will be populated with these values
    const appointmentLink = new URL(schedulingUrl);
    appointmentLink.searchParams.set('name', ownerName);
    appointmentLink.searchParams.set('email', ownerEmail);
    
    // Populate hidden fields with IDs (these match the identifiers in event type configuration)
    const petOwnerId = pet.petOwner.id;
    appointmentLink.searchParams.set('petId', petId);
    appointmentLink.searchParams.set('petOwnerId', petOwnerId);
    appointmentLink.searchParams.set('clinicId', clinicId);
    appointmentLink.searchParams.set('staffId', staffId);

    // Create invite in database with appointment link
    const invite = await prisma.appointmentInvite.create({
      data: {
        appointmentLink: appointmentLink.toString(),
        eventTypeId: eventTypeId,
        clinicId,
        staffId,
        petId,
        petOwnerId: pet.ownerId,
        appointmentId: appointmentId || null,
      },
      include: {
        clinic: true,
        staff: {
          include: {
            user: true,
          },
        },
        pet: true,
        petOwner: {
          include: {
            user: true,
          },
        },
        appointment: true,
      },
    });

    return res.status(201).json({
      success: true,
      data: invite,
      message: 'Appointment invite created successfully. Share the appointment link with the pet owner.',
    });
  } catch (error: any) {
    console.error('Error creating appointment invite:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to create appointment invite',
    });
  }
});

/**
 * DELETE /api/appointment-invites/:id
 * Cancel an appointment invite
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Appointment invite ID is required',
      });
    }

    const invite = await prisma.appointmentInvite.findUnique({
      where: { id },
    });

    if (!invite) {
      return res.status(404).json({
        success: false,
        error: 'Appointment invite not found',
      });
    }

    // Check access permissions
    if (req.petOwner && invite.petOwnerId !== req.petOwner.id) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
      });
    }

    if (req.staff && req.clinic && invite.clinicId !== req.clinic.id) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
      });
    }

    // Delete from database (Cal.com booking links don't need cancellation)
    await prisma.appointmentInvite.delete({
      where: { id },
    });

    return res.json({
      success: true,
      message: 'Appointment invite cancelled successfully',
    });
  } catch (error: any) {
    console.error('Error cancelling appointment invite:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to cancel appointment invite',
    });
  }
});

export default router;

