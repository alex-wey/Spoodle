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
    // We're interested in 'response.created' when a form is submitted
    if (eventType === 'response.created' || eventType === 'response.updated') {
      const { formId, responseId, answers, respondent } = data || {};
      
      if (!formId || !responseId) {
        console.error('❌ Missing formId or responseId in webhook payload');
        return res.status(400).json({
          success: false,
          error: 'Missing required fields',
          message: 'formId and responseId are required'
        });
      }

      // Find the form in our database by Tally form ID
      const form = await prisma.form.findUnique({
        where: { tallyFormId: formId },
        include: { clinic: true }
      });

      if (!form) {
        console.warn(`⚠️ Form not found in database for Tally formId: ${formId}`);
        // Still return 200 to Tally so they don't retry
        return res.status(200).json({
          success: true,
          message: 'Webhook received but form not found in database'
        });
      }

      // Extract respondent information
      const respondentEmail = respondent?.email || null;
      const respondentName = respondent?.name || null;
      
      // Convert Tally answers to a structured format
      const submissionData = {
        formId: form.id,
        tallyResponseId: responseId,
        respondentEmail,
        respondentName,
        answers: answers || {},
        submittedAt: new Date(),
        rawData: req.body // Store full webhook payload for reference
      };

      // Create form submission record
      const submission = await prisma.formSubmission.create({
        data: {
          formId: form.id,
          tallyResponseId: responseId,
          respondentEmail,
          respondentName,
          submissionData: submissionData as any, // Store as JSON
        },
        include: {
          form: {
            select: {
              id: true,
              title: true,
              clinicId: true
            }
          }
        }
      });

      console.log('✅ Form submission saved:', submission.id);

      // TODO: You can add additional logic here:
      // - Send notifications to clinic staff
      // - Link submission to a pet if form includes pet selection
      // - Trigger workflows based on form answers

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

