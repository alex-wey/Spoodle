import { Router, Request, Response } from 'express';
import { prisma } from '../index.js';

const router = Router();

// Tally webhook endpoint - receives form submissions
// This endpoint should NOT require authentication as Tally will call it directly
router.post('/tally', async (req: Request, res: Response) => {
  try {
    console.log('📥 Tally webhook received:', JSON.stringify(req.body, null, 2));
    
    const { eventType, data } = req.body;
    
    // Tally sends different event types
    // FORM_RESPONSE is the event type when a form is submitted
    // Also handle response.created/response.updated for compatibility
    if (eventType === 'FORM_RESPONSE' || eventType === 'response.created' || eventType === 'response.updated') {
      // Tally webhook structure can vary:
      // Option 1: { eventType: 'FORM_RESPONSE', data: { formId, responseId, ... } }
      // Option 2: { eventType: 'FORM_RESPONSE', data: { form: { id }, response: { id }, ... } }
      // Option 3: Flattened structure with formId/responseId at top level
      const formId = data?.formId || data?.form?.id || req.body.formId;
      const responseId = data?.responseId || data?.response?.id || req.body.responseId || req.body.response?.id;
      const answers = data?.answers || data?.response?.answers || data?.data?.answers || {};
      const respondent = data?.respondent || data?.response?.respondent || data?.data?.respondent;
      
      console.log('🔍 Extracted data:', { formId, responseId, hasAnswers: !!answers, hasRespondent: !!respondent });
      
      if (!formId || !responseId) {
        console.error('❌ Missing formId or responseId in webhook payload');
        console.error('📋 Full payload structure:', JSON.stringify(req.body, null, 2));
        return res.status(400).json({
          success: false,
          error: 'Missing required fields',
          message: 'formId and responseId are required'
        });
      }

      // Find the form in our database by Tally form ID
      console.log(`🔍 Looking up form with tallyFormId: "${formId}"`);
      const form = await prisma.form.findUnique({
        where: { tallyFormId: formId },
        include: { clinic: true }
      });

      if (!form) {
        // Try to find all forms to see what we have
        const allForms = await prisma.form.findMany({
          select: { id: true, tallyFormId: true, title: true }
        });
        console.warn(`⚠️ Form not found in database for Tally formId: "${formId}"`);
        console.warn(`📋 Available forms in database:`, JSON.stringify(allForms, null, 2));
        // Still return 200 to Tally so they don't retry
        return res.status(200).json({
          success: true,
          message: 'Webhook received but form not found in database'
        });
      }

      console.log(`✅ Found form in database: ${form.id} (${form.title})`);

      // Extract respondent information
      const respondentEmail = respondent?.email || null;
      const respondentName = respondent?.name || null;
      
      // Try to find PetOwner by email
      let petOwnerId: string | null = null;
      let petId: string | null = null;
      
      if (respondentEmail) {
        try {
          // Find User by email, then get PetOwner
          const user = await prisma.user.findUnique({
            where: { email: respondentEmail },
            include: { petOwner: true }
          });
          
          if (user?.petOwner) {
            petOwnerId = user.petOwner.id;
            console.log(`✅ Found PetOwner: ${petOwnerId} for email: ${respondentEmail}`);
            
            // Try to find Pet from form answers
            // Common field names: petId, pet, petName, selectedPet, etc.
            const petFields = ['petId', 'pet', 'petName', 'selectedPet', 'pet_id', 'pet_name'];
            let foundPetId: string | null = null;
            
            // Check answers for pet identifier
            for (const field of petFields) {
              const petValue = answers[field]?.value || answers[field];
              if (petValue) {
                // Try to find pet by ID (UUID format)
                if (typeof petValue === 'string' && petValue.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
                  const pet = await prisma.pet.findFirst({
                    where: {
                      id: petValue,
                      ownerId: petOwnerId
                    }
                  });
                  if (pet) {
                    foundPetId = pet.id;
                    break;
                  }
                }
                // Try to find pet by name
                else if (typeof petValue === 'string') {
                  const pet = await prisma.pet.findFirst({
                    where: {
                      name: { contains: petValue, mode: 'insensitive' },
                      ownerId: petOwnerId
                    }
                  });
                  if (pet) {
                    foundPetId = pet.id;
                    break;
                  }
                }
              }
            }
            
            if (foundPetId) {
              petId = foundPetId;
              console.log(`✅ Found Pet: ${petId} for PetOwner: ${petOwnerId}`);
            } else {
              console.log(`ℹ️ No pet found in form answers for PetOwner: ${petOwnerId}`);
            }
          } else {
            console.log(`ℹ️ No PetOwner found for email: ${respondentEmail}`);
          }
        } catch (error) {
          console.error('❌ Error finding PetOwner/Pet:', error);
          // Continue without linking - submission will still be saved
        }
      }
      
      // Convert Tally answers to a structured format
      const submissionData = {
        formId: form.id,
        tallyResponseId: responseId,
        respondentEmail,
        respondentName,
        petOwnerId,
        petId,
        answers: answers || {},
        submittedAt: new Date(),
        rawData: req.body // Store full webhook payload for reference
      };

      // Create form submission record
      // Build data object conditionally to handle null vs undefined for Prisma
      const submissionData_obj: any = {
        formId: form.id,
        tallyResponseId: responseId,
        respondentEmail: respondentEmail || null,
        respondentName: respondentName || null,
        submissionData: submissionData as any, // Store as JSON
      };
      
      // Only include petOwnerId and petId if they have values (not null)
      if (petOwnerId) {
        submissionData_obj.petOwnerId = petOwnerId;
      }
      if (petId) {
        submissionData_obj.petId = petId;
      }

      const submission = await prisma.formSubmission.create({
        data: submissionData_obj,
        include: {
          form: {
            select: {
              id: true,
              title: true,
              clinicId: true
            }
          },
          petOwner: {
            select: {
              id: true,
              clerkUserId: true
            }
          },
          pet: {
            select: {
              id: true,
              name: true,
              species: true
            }
          }
        }
      });

      console.log('✅ Form submission saved:', submission.id);
      if (submission.petOwner) {
        console.log(`   Linked to PetOwner: ${submission.petOwner.id}`);
      }
      if (submission.pet) {
        console.log(`   Linked to Pet: ${submission.pet.name} (${submission.pet.species})`);
      }

      return res.status(200).json({
        success: true,
        message: 'Webhook processed successfully',
        submissionId: submission.id
      });
    }

    // Handle other event types (form.created, form.updated, etc.)
    console.log(`ℹ️ Received Tally event: ${eventType}`);
    return res.status(200).json({
      success: true,
      message: 'Webhook received but no action taken'
    });

  } catch (error) {
    console.error('❌ Tally webhook error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to process webhook'
    });
  }
});

// Cal.com webhook endpoint - receives appointment events
// This endpoint should NOT require authentication as Cal.com will call it directly
// Configure webhooks in Cal.com dashboard: Settings > Developer > Webhooks
router.post('/calcom', async (req: Request, res: Response) => {
  try {
    console.log('📥 Cal.com webhook received:', JSON.stringify(req.body, null, 2));
    
    // Cal.com webhook structure: { triggerEvent: 'BOOKING_CREATED', payload: {...} }
    const { triggerEvent, payload } = req.body;
    
    if (!triggerEvent || !payload) {
      console.error('❌ Invalid webhook payload structure');
      return res.status(400).json({
        success: false,
        error: 'Invalid webhook payload',
        message: 'Missing triggerEvent or payload fields'
      });
    }

    console.log('🔍 Cal.com webhook payload:', JSON.stringify(payload, null, 2));

    // Handle different event types
    if (triggerEvent === 'BOOKING_CREATED') {
      return await handleBookingCreated(payload, res);
    } else if (triggerEvent === 'BOOKING_CANCELLED') {
      return await handleBookingCancelled(payload, res);
    } else if (triggerEvent === 'BOOKING_RESCHEDULED') {
      return await handleBookingRescheduled(payload, res);
    } else {
      console.log(`ℹ️ Received Cal.com event: ${triggerEvent} - no handler implemented`);
      return res.status(200).json({
        success: true,
        message: 'Webhook received but no action taken'
      });
    }
  } catch (error: any) {
    console.error('❌ Cal.com webhook error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to process webhook'
    });
  }
});

/**
 * Handle BOOKING_CREATED event - create new appointment
 */
async function handleBookingCreated(payload: any, res: Response) {
  try {
    const booking = payload.booking || payload;
    const eventTypeId = booking.eventTypeId || payload.eventTypeId;
    
    if (!booking || !eventTypeId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        message: 'booking and eventTypeId are required'
      });
    }

    // Extract hidden field values from booking responses
    // These are populated when using our generated scheduling links with hidden fields
    // Responses come as objects with { label, value, isHidden } structure
    const responses = booking.responses || {};
    const petId = responses.petId?.value || responses.petId;
    const petOwnerId = responses.petOwnerId?.value || responses.petOwnerId;
    const clinicId = responses.clinicId?.value || responses.clinicId;
    const staffId = responses.staffId?.value || responses.staffId;

    if (!petId || !petOwnerId || !clinicId || !staffId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required metadata',
        message: 'Booking must include petId, petOwnerId, clinicId, and staffId in hidden fields'
      });
    }

    // Verify that pet, clinic, and staff exist and are valid
    const [pet, clinic, staff] = await Promise.all([
      prisma.pet.findUnique({ where: { id: petId } }),
      prisma.clinic.findUnique({ where: { id: clinicId } }),
      prisma.staff.findUnique({ where: { id: staffId } }),
    ]);

    if (!pet) {
      return res.status(404).json({
        success: false,
        error: 'Pet not found',
        message: `Pet with ID ${petId} not found`
      });
    }

    if (!clinic) {
      return res.status(404).json({
        success: false,
        error: 'Clinic not found',
        message: `Clinic with ID ${clinicId} not found`
      });
    }

    if (!staff) {
      return res.status(404).json({
        success: false,
        error: 'Staff not found',
        message: `Staff with ID ${staffId} not found`
      });
    }

    // Verify pet owner exists and belongs to the clinic
    const petOwner = await prisma.petOwner.findUnique({
      where: { id: petOwnerId },
      include: { clinic: true }
    });
    
    if (!petOwner) {
      return res.status(404).json({
        success: false,
        error: 'Pet owner not found',
        message: `Pet owner with ID ${petOwnerId} not found`
      });
    }
    
    // Verify pet belongs to this owner
    if (pet.ownerId !== petOwnerId) {
      return res.status(400).json({
        success: false,
        error: 'Pet does not belong to owner',
        message: 'Pet is not associated with the specified pet owner'
      });
    }
    
    if (petOwner.clinicId !== clinicId) {
      return res.status(400).json({
        success: false,
        error: 'Pet does not belong to clinic',
        message: 'Pet owner is not associated with the specified clinic'
      });
    }

    // Extract start and end times from booking
    // Cal.com uses startTime and endTime fields (ISO 8601 strings)
    const startTime = booking.startTime ? new Date(booking.startTime) : new Date();
    const endTime = booking.endTime ? new Date(booking.endTime) : new Date(startTime.getTime() + 30 * 60000); // Default 30 min if not provided

    // Extract booking details from payload
    const bookingId = payload.bookingId || booking.bookingId;
    const eventTitle = payload.eventTitle || booking.eventTitle || null;
    const eventDescription = payload.eventDescription || booking.eventDescription || null;

    // Create appointment record
    const appointment = await prisma.appointment.create({
      data: {
        externalAppointmentId: String(bookingId || booking.id),
        eventTypeId: String(eventTypeId),
        eventTitle,
        eventDescription,
        clinicId,
        staffId,
        petId,
        petOwnerId,
        status: 'CONFIRMED',
        startTime,
        endTime,
      },
      include: {
        clinic: true,
        staff: { include: { user: true } },
        pet: true,
        petOwner: { include: { user: true } },
      },
    });

    console.log('✅ Appointment created from webhook:', appointment.id);
    return res.status(200).json({
      success: true,
      message: 'Appointment created successfully',
      appointmentId: appointment.id
    });
  } catch (error: any) {
    console.error('❌ Error handling BOOKING_CREATED:', error);
    throw error;
  }
}

/**
 * Handle BOOKING_CANCELLED event - update appointment status
 */
async function handleBookingCancelled(payload: any, res: Response) {
  try {
    const booking = payload.booking || payload;
    
    if (!booking || !booking.id) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        message: 'booking with id is required'
      });
    }

    // Find appointment by external appointment ID (Cal.com booking ID)
    const appointment = await prisma.appointment.findUnique({
      where: { externalAppointmentId: String(booking.id) }
    });

    if (!appointment) {
      console.warn(`⚠️ Appointment not found for canceled booking: ${booking.id}`);
      return res.status(200).json({
        success: true,
        message: 'Appointment not found in database (may have been created externally)'
      });
    }

    // Update appointment status to CANCELLED
    await prisma.appointment.update({
      where: { id: appointment.id },
      data: { status: 'CANCELLED' }
    });

    console.log('✅ Appointment canceled:', appointment.id);
    return res.status(200).json({
      success: true,
      message: 'Appointment canceled successfully',
      appointmentId: appointment.id
    });
  } catch (error: any) {
    console.error('❌ Error handling BOOKING_CANCELLED:', error);
    throw error;
  }
}

/**
 * Handle BOOKING_RESCHEDULED event - update appointment (rescheduled)
 */
async function handleBookingRescheduled(payload: any, res: Response) {
  try {
    const booking = payload.booking || payload;
    const rescheduledBooking = payload.rescheduledBooking || booking;
    
    if (!booking || !booking.id) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        message: 'booking with id is required'
      });
    }

    // Find appointment by external appointment ID (Cal.com booking ID)
    // Cal.com sends both old and new booking info in reschedule events
    const oldBookingId = booking.id;
    const newBookingId = rescheduledBooking?.id || oldBookingId;
    
    const appointment = await prisma.appointment.findUnique({
      where: { externalAppointmentId: String(oldBookingId) }
    });

    if (!appointment) {
      console.warn(`⚠️ Appointment not found for rescheduled booking: ${oldBookingId}`);
      // If appointment doesn't exist, treat it as a new creation
      return await handleBookingCreated(payload, res);
    }

    // Extract updated booking details
    const bookingId = payload.bookingId || rescheduledBooking?.bookingId || booking.bookingId;
    const eventTitle = payload.eventTitle || rescheduledBooking?.eventTitle || booking.eventTitle || null;
    const eventDescription = payload.eventDescription || rescheduledBooking?.eventDescription || booking.eventDescription || null;
    const startTime = rescheduledBooking?.startTime ? new Date(rescheduledBooking.startTime) : booking.startTime ? new Date(booking.startTime) : null;
    const endTime = rescheduledBooking?.endTime ? new Date(rescheduledBooking.endTime) : booking.endTime ? new Date(booking.endTime) : null;

    // Update appointment status to RESCHEDULED and update fields
    const updateData: any = { status: 'RESCHEDULED' };
    if (newBookingId !== oldBookingId) {
      updateData.externalAppointmentId = String(newBookingId);
    }
    if (eventTitle !== null) {
      updateData.eventTitle = eventTitle;
    }
    if (eventDescription !== null) {
      updateData.eventDescription = eventDescription;
    }
    if (startTime) {
      updateData.startTime = startTime;
    }
    if (endTime) {
      updateData.endTime = endTime;
    }
    
    await prisma.appointment.update({
      where: { id: appointment.id },
      data: updateData
    });

    console.log('✅ Appointment updated/rescheduled:', appointment.id);
    return res.status(200).json({
      success: true,
      message: 'Appointment updated successfully',
      appointmentId: appointment.id
    });
  } catch (error: any) {
    console.error('❌ Error handling BOOKING_RESCHEDULED:', error);
    throw error;
  }
}

export default router;

