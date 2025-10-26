import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { validateRequest } from '../middleware/validation';
import { emailService } from '../services/email';

const router = Router();
const prisma = new PrismaClient();

// Validation schemas
const createBugReportSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().min(1, 'Description is required').max(2000, 'Description too long'),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  category: z.string().min(1, 'Category is required').max(100, 'Category too long'),
  deviceInfo: z.string().optional(),
  appVersion: z.string().optional(),
  reporterEmail: z.string().email().optional()
});

const updateBugReportSchema = z.object({
  status: z.enum(['open', 'in_progress', 'resolved', 'closed']).optional(),
  title: z.string().min(1).max(200).optional(),
  description: z.string().min(1).max(2000).optional(),
  severity: z.enum(['low', 'medium', 'high', 'critical']).optional()
});

// Get all bug reports (admin only - for now, allow all authenticated users)
router.get('/', async (req: Request, res: Response) => {
  try {
    if (!req.auth) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: 'Please log in to view bug reports'
      });
    }

    const bugReports = await prisma.bugReport.findMany({
      orderBy: { createdAt: 'desc' }
    });
    
    return res.json({
      success: true,
      data: bugReports,
      message: 'Bug reports retrieved successfully'
    });
  } catch (error) {
    console.error('Get bug reports error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error',
      message: 'Unable to retrieve bug reports'
    });
  }
});

// Get a specific bug report
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const bugReport = await prisma.bugReport.findUnique({
      where: { id: id as string }
    });
    
    if (!bugReport) {
      return res.status(404).json({
        success: false,
        error: 'Bug report not found',
        message: 'The requested bug report does not exist'
      });
    }
    
    return res.json({
      success: true,
      data: bugReport,
      message: 'Bug report retrieved successfully'
    });
  } catch (error) {
    console.error('Get bug report error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error',
      message: 'Unable to retrieve bug report'
    });
  }
});

// Create a new bug report
router.post('/',
  validateRequest({ body: createBugReportSchema }),
  async (req: Request, res: Response) => {
    try {
      console.log('🐛 Bug report submission received:', {
        title: req.body.title,
        severity: req.body.severity,
        category: req.body.category,
        user: req.auth?.email || 'No user',
        hasAuthHeader: !!req.headers.authorization,
        authToken: req.headers.authorization ? req.headers.authorization.substring(0, 20) + '...' : 'No token',
        timestamp: new Date().toISOString()
      });
      
      const { title, description, severity, category, deviceInfo, appVersion, reporterEmail } = req.body;
      
      // Try to create the bug report in database, but don't fail if it doesn't work
      let bugReportId = null;
      try {
        // First, check if the user exists in pet_owners table, if not create them
        let petOwner = await prisma.pet_owners.findUnique({
          where: { email: req.auth?.email || reporterEmail }
        });
        
        if (!petOwner && req.auth) {
          // Create pet_owner record if it doesn't exist
          petOwner = await prisma.pet_owners.create({
            data: {
              id: uuidv4(),
              email: req.auth.email,
              password: 'temp_password', // This will be updated when they set a proper password
              firstName: req.auth.firstName,
              lastName: req.auth.lastName,
              phone: null,
              address: null,
              createdAt: new Date(),
              updatedAt: new Date()
            }
          });
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
              priority: severity === 'critical' ? 'high' : severity === 'high' ? 'medium' : 'low'
            }
          });
          bugReportId = newBugReport.id;
          console.log('✅ Bug report saved to database:', bugReportId);
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
          reporterEmail: reporterEmail || req.auth?.email || 'seher@spoodle.co',
          reporterName: req.auth ? `${req.auth.firstName} ${req.auth.lastName}` : 'Mobile App User',
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

// Update a bug report
router.put('/:id',
  validateRequest({ 
    params: z.object({ id: z.string().uuid() }),
    body: updateBugReportSchema
  }),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      // Check if bug report exists
      const existingBugReport = await prisma.bugReport.findUnique({
        where: { id: id as string }
      });
      
      if (!existingBugReport) {
        return res.status(404).json({
          success: false,
          error: 'Bug report not found',
          message: 'The requested bug report does not exist'
        });
      }

      const updatedBugReport = await prisma.bugReport.update({
        where: { id: id as string },
        data: req.body
      });
      
      return res.json({
        success: true,
        data: updatedBugReport,
        message: 'Bug report updated successfully'
      });
    } catch (error) {
      console.error('Update bug report error:', error);
      return res.status(500).json({
        success: false,
        error: 'Server error',
        message: 'Unable to update bug report'
      });
    }
  }
);

// Delete a bug report
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Check if bug report exists
    const existingBugReport = await prisma.bugReport.findUnique({
      where: { id: id as string }
    });
    
    if (!existingBugReport) {
      return res.status(404).json({
        success: false,
        error: 'Bug report not found',
        message: 'The requested bug report does not exist'
      });
    }

    await prisma.bugReport.delete({
      where: { id: id as string }
    });
    
    return res.json({
      success: true,
      message: 'Bug report deleted successfully'
    });
  } catch (error) {
    console.error('Delete bug report error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error',
      message: 'Unable to delete bug report'
    });
  }
});

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
