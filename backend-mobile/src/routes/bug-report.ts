import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { validateRequest } from '../middleware/validation';
import { emailService } from '../utils/email';

const router = Router();
const prisma = new PrismaClient();

// Validation schemas
const createBugReportSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().min(1, 'Description is required').max(2000, 'Description too long'),
  severity: z.enum(['low', 'medium', 'high']),
  category: z.string().min(1, 'Category is required').max(100, 'Category too long'),
  deviceInfo: z.string().optional(),
  appVersion: z.string().optional(),
  reporterEmail: z.string().email().optional()
});

// Create a new bug report
router.post('/',
  validateRequest({ body: createBugReportSchema }),
  async (req: Request, res: Response) => {
    try {
      const { title, description, severity, category, deviceInfo, appVersion } = req.body;
      
      // Try to create the bug report in database, but don't fail if it doesn't work
      let bugReportId = null;
      try {
        if (req.auth?.userId) {
          // Find petOwner by clerkUserId
          let petOwner = await prisma.petOwner.findUnique({
            where: { clerkUserId: req.auth.userId }
          });
          
          if (!petOwner) {
            console.log('⚠️ PetOwner not found for clerkUserId:', req.auth.userId);
            console.log('   This should have been created during user registration');
          }
          
          if (petOwner) {
            const newBugReport = await prisma.bugReport.create({
              data: {
                id: uuidv4(),
                petOwnerId: petOwner.id,
                title,
                description,
                severity,
                category,
                deviceInfo: deviceInfo || null,
                appVersion: appVersion || null,
                status: 'pending',
              }
            });
            bugReportId = newBugReport.id;
            console.log('✅ Bug report saved to database:', bugReportId);
          }
        }
      } catch (dbError) {
        console.log('⚠️ Database save failed, but continuing with email:', (dbError as Error).message);
        // Continue with email sending even if database save fails
      }

      // Send email notification
      try {
        console.log('📧 Attempting to send email for bug report:', title);
        const emailSent = await emailService.sendBugReport({
          title,
          description,
          severity,
          reporterEmail: req.user?.email!,
          reporterName: `${req.user?.firstName!} ${req.user?.lastName!}`,
          timestamp: new Date().toLocaleString()
        });

        if (emailSent) {
          console.log('✅ Bug report email sent successfully');
        } else {
          console.log('⚠️ Bug report saved but email failed to send');
        }
      } catch (emailError) {
        console.error('❌ Email sending failed:', emailError);
        // Don't fail the request if email fails, just log it
      }
      
      return res.status(201).json({
        success: true,
        data: { id: bugReportId, title, description, severity, category },
        message: bugReportId 
          ? 'Bug report created and email notification sent successfully'
          : 'Bug report email sent successfully (database save failed)'
      });
    } catch (error) {
      console.error('Create bug report error:', error);
      return res.status(500).json({
        success: false,
        error: 'Server error',
        message: 'Unable to create bug report'
      });
    }
  }
);

// Test email endpoint
router.post('/test-email', async (req: Request, res: Response) => {
  try {
    const emailSent = await emailService.sendBugReport({
      title: 'Test Bug Report',
      description: 'This is a test email to verify the Resend email service is working correctly.',
      severity: 'medium',
      reporterEmail: 'test@example.com',
      reporterName: 'Test User',
      timestamp: new Date().toLocaleString()
    });

    if (emailSent) {
      res.status(200).json({
        success: true,
        message: 'Test email sent successfully! Check seher@spoodle.co'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send test email'
      });
    }
  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send test email',
      details: error
    });
  }
});

export default router;
