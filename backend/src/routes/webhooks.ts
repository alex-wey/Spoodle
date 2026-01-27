import { Router, Request, Response } from 'express';
import { prisma } from '../index.js';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import * as path from 'path';
import * as fs from 'fs/promises';

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

      // Extract hidden fields from Tally payload (can arrive either in answers or rawData.data.fields)
      const hiddenFieldMap = (() => {
        const fields = data?.data?.fields || data?.fields || [];
        const map: Record<string, string | null> = {};

        for (const field of fields) {
          if (field?.type === 'HIDDEN_FIELDS') {
            const label = (field.label || '').trim().toLowerCase();
            const value = field.value ?? null;
            if (!label) continue;

            if (label === 'petid') map.petId = value;
            if (label === 'petownerid') map.petOwnerId = value;
            if (label === 'petname') map.petName = value;
            if (label === 'email') map.email = value;
            if (label === 'phone') map.phone = value;
          }
        }
        return map;
      })();

      // Extract respondent information and hidden fields (from query params mapped as hidden fields in Tally)
      let respondentEmail = respondent?.email || answers?.email || hiddenFieldMap.email || null;
      const respondentName = respondent?.name || answers?.name || answers?.petOwnerName || null;
      const explicitPetOwnerId = answers?.petOwnerId?.value || answers?.petOwnerId || hiddenFieldMap.petOwnerId || null;
      const explicitPetId = answers?.petId?.value || answers?.petId || hiddenFieldMap.petId || null;
      const petNameFromForm = answers?.petName?.value || answers?.petName || hiddenFieldMap.petName || null;
      
      // Try to link PetOwner and Pet
      let petOwnerId: string | null = explicitPetOwnerId || null;
      let petId: string | null = explicitPetId || null;

      // If petOwnerId not provided, try to find by email
      if (!petOwnerId && respondentEmail) {
        try {
          const user = await prisma.user.findUnique({
            where: { email: respondentEmail },
            include: { petOwner: true }
          });
          if (user?.petOwner) {
            petOwnerId = user.petOwner.id;
            console.log(`✅ Found PetOwner: ${petOwnerId} for email: ${respondentEmail}`);
          }
        } catch (error) {
          console.error('❌ Error finding PetOwner by email:', error);
        }
      }

      // If petId not provided, try to find pet belonging to the petOwner by ID or name from form fields
      if (!petId && petOwnerId) {
        const petFields = ['petId', 'pet', 'petName', 'selectedPet', 'pet_id', 'pet_name'];
        for (const field of petFields) {
          const petValue = answers[field]?.value || answers[field];
          if (!petValue) continue;

          if (typeof petValue === 'string' && petValue.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
            const pet = await prisma.pet.findFirst({
              where: { id: petValue, ownerId: petOwnerId }
            });
            if (pet) {
              petId = pet.id;
              break;
            }
          } else if (typeof petValue === 'string') {
            const pet = await prisma.pet.findFirst({
              where: { name: { contains: petValue, mode: 'insensitive' }, ownerId: petOwnerId }
            });
            if (pet) {
              petId = pet.id;
              break;
            }
          }
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

      // Generate and store a discharge report document when the discharge form is submitted
      // Form mapping: discharge form (tallyId pbDM2q or title contains "discharge") -> create doc for pet in veterinary_notes
      try {
        const isDischargeForm =
          form.tallyFormId === 'pbDM2q' ||
          (form.title && form.title.toLowerCase().includes('discharge'));

        if (isDischargeForm) {
          // Last-resort pet lookup: if we have petOwnerId but no petId, use the most recent pet for this owner
          if (!petId && petOwnerId) {
            const ownerPets = await prisma.pet.findMany({
              where: { ownerId: petOwnerId },
              orderBy: { createdAt: 'desc' },
              select: { id: true, name: true }
            });
            if (ownerPets.length > 0) {
              petId = ownerPets[0].id;
              console.log(`ℹ️ Using fallback pet for discharge doc: ${ownerPets[0].id} (${ownerPets[0].name || 'Unnamed'})`);
            }
          }

          const petIdForDoc = petId || submission.petId || null;
          if (petIdForDoc) {
            const useS3 = process.env.USE_S3 === 'true';
            const uploadDir = process.env.UPLOAD_DIR || './uploads';
            const documentsDir = path.join(uploadDir, 'documents');
            const today = new Date();
            const dateLabel = today.toISOString().slice(0, 10);
            const displayName = `Discharge Report ${petNameFromForm || 'Pet'} ${dateLabel}`;
            const baseFileName = `discharge-${petIdForDoc}-${Date.now()}.txt`;
            const content = [
              `Discharge Report`,
              ``,
              `Pet: ${petNameFromForm || 'Unknown'}`,
              `Date: ${dateLabel}`,
              `Pet ID: ${petIdForDoc}`,
              petOwnerId ? `Pet Owner ID: ${petOwnerId}` : null,
              respondentEmail ? `Owner Email: ${respondentEmail}` : null,
              ``,
              `Submission Data:`,
              JSON.stringify(answers || {}, null, 2),
            ].filter(Boolean).join('\n');
            const buffer = Buffer.from(content, 'utf8');
            let filePathStored = '';
            let fileSize = buffer.length;
            const mimeType = 'text/plain';
            let storedViaS3 = false;

            if (useS3) {
              try {
                const bucket = process.env.S3_BUCKET_NAME || 'spoodle-documents';
                const region = process.env.AWS_REGION || 'us-east-2';
                const client = new S3Client({
                  region,
                  credentials: {
                    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
                    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
                  },
                });
                const key = `documents/${baseFileName}`;
                await client.send(new PutObjectCommand({
                  Bucket: bucket,
                  Key: key,
                  Body: buffer,
                  ContentType: mimeType,
                }));
                filePathStored = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
                storedViaS3 = true;
              } catch (s3Err) {
                console.error('⚠️ S3 upload failed, falling back to local storage:', s3Err);
              }
            }

            if (!storedViaS3) {
              try {
                await fs.mkdir(documentsDir, { recursive: true });
                const fullPath = path.join(documentsDir, baseFileName);
                await fs.writeFile(fullPath, buffer);
                filePathStored = fullPath;
              } catch (localErr) {
                console.error('❌ Local write failed for discharge doc:', localErr);
                throw localErr;
              }
            }

            await prisma.document.create({
              data: {
                petId: petIdForDoc,
                category: 'veterinary_notes',
                fileName: displayName,
                filePath: filePathStored,
                fileSize,
                mimeType,
              },
            });
            console.log(`📄 Created discharge doc for pet ${petIdForDoc}: ${displayName}`);
          } else {
            console.warn('⚠️ Discharge form submitted but no petId found to attach document.');
          }
        }
      } catch (docErr) {
        console.error('⚠️ Error creating discharge document:', docErr);
      }

      // Delete form invites for this petOwner (and pet if provided) so submitted forms disappear
      // Fallback: if petOwnerId is missing but petId is known, delete by petId
      if (petOwnerId || petId) {
        try {
          const where: any = {};
          if (petOwnerId) where.petOwnerId = petOwnerId;
          if (petId) where.petId = petId;

          const deletedInvites = await prisma.formInvite.deleteMany({ where });
          
          if (deletedInvites.count > 0) {
            console.log(
              `🗑️  Deleted ${deletedInvites.count} form invite(s)` +
              (petOwnerId ? ` for petOwner ${petOwnerId}` : '') +
              (petId ? ` and pet ${petId}` : '')
            );
          }
        } catch (deleteError) {
          // Log error but don't fail the webhook - form submission is more important
          console.error('⚠️  Error deleting form invites (non-fatal):', deleteError);
        }
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
    const bookingUid = payload.uid || booking.uid; // Cal.com booking UID for confirmation link
    
    const eventTitle = payload.eventTitle || booking.eventTitle || null;
    const eventDescription = payload.eventDescription || booking.eventDescription || null;

    // Create appointment record
    const appointment = await prisma.appointment.create({
      data: {
        externalAppointmentId: String(bookingId || booking.id),
        externalAppointmentUid: String(bookingUid),
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

    // Clean up appointment invites: delete any invites that match this booking
    // Match criteria: same eventTypeId, petId, and petOwnerId
    try {
      const matchingInvites = await prisma.appointmentInvite.findMany({
        where: {
          eventTypeId: String(eventTypeId),
          petId: petId,
          petOwnerId: petOwnerId,
        },
      });

      if (matchingInvites.length > 0) {
        await prisma.appointmentInvite.deleteMany({
          where: {
            eventTypeId: String(eventTypeId),
            petId: petId,
            petOwnerId: petOwnerId,
          },
        });
        console.log(`✅ Cleaned up ${matchingInvites.length} appointment invite(s) for pet ${petId} and event type ${eventTypeId}`);
      }
    } catch (inviteError: any) {
      // Log error but don't fail the webhook - invite cleanup is not critical
      console.error('⚠️ Error cleaning up appointment invites:', inviteError);
    }

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
    
    // Extract booking ID - can be bookingId, id, or booking.id
    const bookingId = payload.bookingId || booking?.bookingId || booking?.id || payload.id;
    
    if (!bookingId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        message: 'bookingId is required in webhook payload'
      });
    }

    // Find appointment by external appointment ID (Cal.com booking ID)
    const appointment = await prisma.appointment.findUnique({
      where: { externalAppointmentId: String(bookingId) }
    });

    if (!appointment) {
      console.warn(`⚠️ Appointment not found for canceled booking: ${bookingId}`);
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
    
    // Extract booking IDs - rescheduleId is the old booking, bookingId is the new booking
    const oldBookingId = payload.rescheduleId || booking?.rescheduleId || booking?.id || payload.id;
    const newBookingId = payload.bookingId || rescheduledBooking?.bookingId || rescheduledBooking?.id || booking?.bookingId || booking?.id;
    
    if (!oldBookingId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        message: 'rescheduleId (old booking ID) is required in webhook payload'
      });
    }
    
    // Find appointment by external appointment ID (Cal.com booking ID)
    // Use the old booking ID (rescheduleId) to find the existing appointment
    const appointment = await prisma.appointment.findUnique({
      where: { externalAppointmentId: String(oldBookingId) }
    });

    if (!appointment) {
      console.warn(`⚠️ Appointment not found for rescheduled booking: ${oldBookingId}`);
      // If appointment doesn't exist, treat it as a new creation
      return await handleBookingCreated(payload, res);
    }

    // Extract updated booking details
    // Use the new booking ID and UID from the rescheduled booking
    const bookingUid = payload.uid || rescheduledBooking?.uid || booking?.uid || payload.rescheduleUid;
    
    if (!bookingUid) {
      return res.status(400).json({
        success: false,
        error: 'Missing booking UID',
        message: 'Booking UID is required for updating appointment'
      });
    }
    const eventTitle = payload.eventTitle || rescheduledBooking?.eventTitle || booking.eventTitle || null;
    const eventDescription = payload.eventDescription || rescheduledBooking?.eventDescription || booking.eventDescription || null;
    const startTime = rescheduledBooking?.startTime ? new Date(rescheduledBooking.startTime) : booking.startTime ? new Date(booking.startTime) : null;
    const endTime = rescheduledBooking?.endTime ? new Date(rescheduledBooking.endTime) : booking.endTime ? new Date(booking.endTime) : null;

    // Update appointment status to RESCHEDULED and update fields
    const updateData: any = { status: 'RESCHEDULED' };
    // Update to new booking ID if different from old one
    if (newBookingId && newBookingId !== oldBookingId) {
      updateData.externalAppointmentId = String(newBookingId);
    }
    updateData.externalAppointmentUid = String(bookingUid);
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

