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

export default router;

