import { Router, Request, Response } from 'express';
import { prisma } from '../index.js';
import { authenticateClerk } from '../middleware/auth.js';
import {
  getBooking,
  getEventTypes,
  getEventType,
  getCurrentUser,
  addHiddenFieldsToEventType,
} from '../utils/calcom.js';

const router = Router();

// Apply authentication to all appointment routes
router.use(authenticateClerk);


/**
 * GET /api/appointments/event-types
 * Get all event types from Cal.com
 */
router.get('/event-types', async (req: Request, res: Response) => {
  try {
    // Only staff members use the web app
    if (!req.staff) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: 'Please log in to view event types',
      });
    }

    // Get current Cal.com user
    const calcomUser = await getCurrentUser() as any;
    const userId = calcomUser?.data?.id || calcomUser?.id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'Cal.com user not found',
        message: 'Could not retrieve Cal.com user information',
      });
    }

    // Fetch all event types for the user
    const eventTypesResponse = await getEventTypes({
      userId: userId,
      perPage: 100, // Get up to 100 event types
    }) as any;

    // Cal.com API v2 returns event types nested in eventTypeGroups
    // Structure: { status: "success", data: { eventTypeGroups: [{ eventTypes: [...] }] } }
    let eventTypesArray: any[] = [];
    
    if (eventTypesResponse?.data?.eventTypeGroups && Array.isArray(eventTypesResponse.data.eventTypeGroups)) {
      // Flatten event types from all groups
      eventTypesArray = eventTypesResponse.data.eventTypeGroups.flatMap(
        (group: any) => group.eventTypes || []
      );
    } else if (Array.isArray(eventTypesResponse)) {
      eventTypesArray = eventTypesResponse;
    } else if (Array.isArray(eventTypesResponse?.data)) {
      eventTypesArray = eventTypesResponse.data;
    }

    return res.json({
      success: true,
      data: eventTypesArray,
    });
  } catch (error: any) {
    console.error('Error fetching event types:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch event types',
    });
  }
});

/**
 * GET /api/appointments
 * Get all appointments for the authenticated user/clinic
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    // Only staff members use the web app
    if (!req.staff) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: 'Please log in to view appointments',
      });
    }

    // Get clinicId from query params (preferred) or from authenticated session
    const clinicId = (req.query?.clinicId as string) || req.clinic?.id || null;
    if (!clinicId) {
      return res.status(400).json({
        success: false,
        error: 'Clinic ID required',
        message: 'Please ensure you are part of an organization with a clinic',
      });
    }

    const where: any = {
      clinicId: clinicId,
    };

    // Optional filters
    const { status, petId, staffId } = req.query;
    if (status) where.status = status;
    if (petId) where.petId = petId as string;
    if (staffId) where.staffId = staffId as string;

    const appointments = await prisma.appointment.findMany({
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
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Fetch Cal.com data for all appointments (in parallel)
    const appointmentsWithCalcomData = await Promise.all(
      appointments.map(async (appointment) => {
        try {
          // externalAppointmentId should be the Cal.com booking ID (number)
          const bookingId = parseInt(appointment.externalAppointmentId);
          if (isNaN(bookingId)) {
            return appointment;
          }
          const calcomBooking = await getBooking(bookingId);
          return {
            ...appointment,
            calcomData: calcomBooking,
          };
        } catch (calcomError: any) {
          console.warn(`Failed to fetch Cal.com data for appointment ${appointment.id}:`, calcomError);
          // Return appointment without Cal.com data if fetch fails
          return appointment;
        }
      })
    );

    return res.json({
      success: true,
      data: appointmentsWithCalcomData,
    });
  } catch (error: any) {
    console.error('Error fetching appointments:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch appointments',
    });
  }
});

/**
 * GET /api/appointments/scheduling-link
 * Generate a Cal.com scheduling link for booking an appointment
 * Note: Appointments are created via Cal.com webhooks when users book through these links
 * IMPORTANT: This route must come BEFORE /:id to avoid route conflicts
 */
router.get('/scheduling-link', async (req: Request, res: Response) => {
  try {
    // Only staff members use the web app
    if (!req.staff) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: 'Please log in to generate scheduling links',
      });
    }

    // Get clinicId from query params (preferred) or from authenticated session
    const clinicId = (req.query?.clinicId as string) || req.clinic?.id || null;
    if (!clinicId) {
      return res.status(400).json({
        success: false,
        error: 'Clinic ID required',
        message: 'Please ensure you are part of an organization with a clinic',
      });
    }

    const { eventTypeId, petId } = req.query;

    if (!eventTypeId || typeof eventTypeId !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Event type ID required',
        message: 'Please provide an eventTypeId as a query parameter',
      });
    }

    if (!petId || typeof petId !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Pet ID required',
        message: 'Please provide a petId as a query parameter',
      });
    }

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

    // Check access permissions - staff can only generate links for pets in their clinic
    if (pet.petOwner.clinicId !== clinicId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        message: 'Pet does not belong to the specified clinic',
      });
    }

    // Get event type from Cal.com
    let eventType;
    let eventTypeResponse: any;
    try {
      const eventTypeIdNum = parseInt(eventTypeId);
      if (isNaN(eventTypeIdNum)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid event type ID',
          message: 'Event type ID must be a number',
        });
      }
      eventTypeResponse = await getEventType(eventTypeIdNum) as any;
      
      // Cal.com API v2 wraps the event type in different ways:
      // Option 1: { data: { slug, title, ... } }
      // Option 2: { eventType: { id, slug, title, ... }, locationOptions, ... }
      // Option 3: Direct event type object
      eventType = eventTypeResponse?.data?.eventType || 
                  eventTypeResponse?.data || 
                  eventTypeResponse?.eventType || 
                  eventTypeResponse;
      
      // Ensure hidden fields are configured in the event type
      // This adds petId, petOwnerId, clinicId, and staffId as hidden booking fields
      let hiddenFieldsResult;
      try {
        hiddenFieldsResult = await addHiddenFieldsToEventType(eventTypeIdNum);
        console.log('✅ Hidden fields configuration:', hiddenFieldsResult.message);
        if (hiddenFieldsResult.addedFields && hiddenFieldsResult.addedFields.length > 0) {
          console.log('✅ Added hidden fields:', hiddenFieldsResult.addedFields.join(', '));
        }
      } catch (fieldError: any) {
        console.error('❌ Could not add hidden fields to event type:', fieldError.message);
        // Continue anyway - fields might already exist or event type might not support updates
      }
    } catch (calcomError: any) {
      return res.status(404).json({
        success: false,
        error: 'Event type not found',
        message: calcomError.message || 'Could not find the specified event type in Cal.com',
      });
    }

    // Get current user to build scheduling URL
    let calcomUserResponse;
    try {
      calcomUserResponse = await getCurrentUser() as any;
    } catch (userError: any) {
      // Continue without user response, will try to extract from eventType
    }
    
    // Extract username from response - Cal.com API v2 returns { status: "success", data: { username: "...", ... } }
    const calcomUser = calcomUserResponse?.data || calcomUserResponse;
    const username = calcomUser?.username || 
                     calcomUser?.name || 
                     calcomUserResponse?.data?.username ||
                     calcomUserResponse?.data?.name ||
                     eventType?.owner?.username || 
                     eventType?.profile?.slug || 
                     eventType?.owner?.slug;
    
    // Extract event slug - check data.slug first, then eventType.slug
    const eventSlug = eventTypeResponse?.data?.slug ||
                      eventType?.slug || 
                      eventType?.title?.toLowerCase().replace(/\s+/g, '-');

    if (!username || !eventSlug) {
      return res.status(400).json({
        success: false,
        error: 'Scheduling URL not available',
        message: 'Could not determine username or event slug from Cal.com',
      });
    }

    // Build Cal.com scheduling URL
    // Format: https://cal.com/[username]/[event-slug] or https://[team].cal.com/[event-slug]
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
        message: 'Pet owner must have an email address to generate a scheduling link',
      });
    }

    // Create a URL with pre-filled data and hidden fields
    // Cal.com supports pre-filling via URL parameters
    // Hidden fields configured in event type will be populated with these values
    const schedulingLink = new URL(schedulingUrl);
    schedulingLink.searchParams.set('name', ownerName);
    schedulingLink.searchParams.set('email', ownerEmail);
    
    // Get staff ID
    const staffId = req.staff?.id;
    if (!staffId) {
      return res.status(400).json({
        success: false,
        error: 'Staff member required',
        message: 'Appointments must be created by staff members',
      });
    }

    // Populate hidden fields with IDs (these match the identifiers in event type configuration)
    const petOwnerId = pet.petOwner.id;
    schedulingLink.searchParams.set('petId', petId);
    schedulingLink.searchParams.set('petOwnerId', petOwnerId);
    schedulingLink.searchParams.set('clinicId', clinicId);
    schedulingLink.searchParams.set('staffId', staffId);

    const finalUrl = schedulingLink.toString();

    return res.json({
      success: true,
      data: {
        schedulingUrl: finalUrl,
        eventType: {
          id: eventType.id,
          name: eventType.title || eventType.name,
          duration: eventType.length,
          slug: eventSlug,
        },
        pet: {
          id: pet.id,
          name: pet.name,
        },
        petOwner: {
          id: pet.petOwner.id,
          name: ownerName,
          email: ownerEmail,
        },
      },
      message: 'Scheduling link generated. When the appointment is booked through Cal.com, it will be synced to the database via webhook.',
    });
  } catch (error: any) {
    console.error('Error generating scheduling link:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate scheduling link',
    });
  }
});

/**
 * GET /api/appointments/:id
 * Get a specific appointment by ID
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Appointment ID is required',
      });
    }

    // Only staff members use the web app
    if (!req.staff) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: 'Please log in to view appointments',
      });
    }

    // Fetch appointment first to get its clinicId
    const appointment = await prisma.appointment.findUnique({
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
      },
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: 'Appointment not found',
      });
    }

    // Get clinicId from query params, authenticated session, or appointment itself
    const requestedClinicId = (req.query?.clinicId as string) || req.clinic?.id || null;
    const appointmentClinicId = appointment.clinicId;

    // If no clinicId provided, use the appointment's clinicId
    // Otherwise verify the requested clinicId matches the appointment's clinicId
    if (requestedClinicId && appointmentClinicId !== requestedClinicId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        message: 'You do not have permission to view this appointment',
      });
    }

    // Verify staff has access to this clinic (check organization membership)
    if (appointmentClinicId && req.clinic?.id !== appointmentClinicId) {
      // If req.clinic doesn't match, verify access via organization membership
      const appointmentClinic = await prisma.clinic.findUnique({
        where: { id: appointmentClinicId },
        select: { clerkOrgId: true }
      });

      if (appointmentClinic) {
        try {
          const { createClerkClient } = await import('@clerk/backend');
          const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY! });
          const { data: memberships } = await clerk.organizations.getOrganizationMembershipList({
            organizationId: appointmentClinic.clerkOrgId,
            userId: [req.auth.userId],
            limit: 1
          });

          if (!memberships || memberships.length === 0) {
            return res.status(403).json({
              success: false,
              error: 'Access denied',
              message: 'You do not have permission to view appointments from this clinic',
            });
          }
        } catch (error) {
          console.error('Error verifying clinic access:', error);
          // If verification fails, deny access for security
          return res.status(403).json({
            success: false,
            error: 'Access denied',
            message: 'Unable to verify clinic access',
          });
        }
      }
    }

    // Fetch latest data from Cal.com
    try {
      const bookingId = parseInt(appointment.externalAppointmentId);
      if (!isNaN(bookingId)) {
        const calcomBooking = await getBooking(bookingId);
        return res.json({
          success: true,
          data: {
            ...appointment,
            calcomData: calcomBooking,
          },
        });
      }
      // Return appointment data if booking ID is invalid
      return res.json({
        success: true,
        data: appointment,
        warning: 'Invalid Cal.com booking ID',
      });
    } catch (calcomError: any) {
      console.warn('Failed to fetch Cal.com data:', calcomError);
      // Return appointment data even if Cal.com fetch fails
      return res.json({
        success: true,
        data: appointment,
        warning: 'Could not fetch latest data from Cal.com',
      });
    }
  } catch (error: any) {
    console.error('Error fetching appointment:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch appointment',
    });
  }
});

/**
 * Note: Cal.com webhooks are configured through the Cal.com dashboard
 * (Settings > Developer > Webhooks), not via API endpoints.
 * Webhook events will be sent to /api/webhooks/calcom
 */

export default router;

