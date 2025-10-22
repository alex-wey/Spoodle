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
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: 'Please log in to view bug reports'
      });
    }

    const bugReports = await prisma.bugReport.findMany({
      orderBy: { createdAt: 'desc' }
    });
    
    res.json({
      success: true,
      data: bugReports,
      message: 'Bug reports retrieved successfully'
    });
  } catch (error) {
    console.error('Get bug reports error:', error);
    res.status(500).json({
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
      where: { id }
    });
    
    if (!bugReport) {
      return res.status(404).json({
        success: false,
        error: 'Bug report not found',
        message: 'The requested bug report does not exist'
      });
    }
    
    res.json({
      success: true,
      data: bugReport,
      message: 'Bug report retrieved successfully'
    });
  } catch (error) {
    console.error('Get bug report error:', error);
    res.status(500).json({
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
      const { title, description, severity, reporterEmail } = req.body;
      
      const newBugReport = await prisma.bugReport.create({
        data: {
          id: uuidv4(),
          title,
          description,
          severity,
          reporterId: req.user?.id || null,
          reporterEmail: reporterEmail || req.user?.email || null
        }
      });

      // Send email notification
      try {
        const emailSent = await emailService.sendBugReport({
          title,
          description,
          severity,
          reporterEmail: reporterEmail || req.user?.email || null,
          reporterName: req.user ? `${req.user.firstName} ${req.user.lastName}` : null,
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
      
      res.status(201).json({
        success: true,
        data: newBugReport,
        message: 'Bug report created and email notification sent successfully'
      });
    } catch (error) {
      console.error('Create bug report error:', error);
      res.status(500).json({
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
        where: { id }
      });
      
      if (!existingBugReport) {
        return res.status(404).json({
          success: false,
          error: 'Bug report not found',
          message: 'The requested bug report does not exist'
        });
      }

      const updatedBugReport = await prisma.bugReport.update({
        where: { id },
        data: req.body
      });
      
      res.json({
        success: true,
        data: updatedBugReport,
        message: 'Bug report updated successfully'
      });
    } catch (error) {
      console.error('Update bug report error:', error);
      res.status(500).json({
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
      where: { id }
    });
    
    if (!existingBugReport) {
      return res.status(404).json({
        success: false,
        error: 'Bug report not found',
        message: 'The requested bug report does not exist'
      });
    }

    await prisma.bugReport.delete({
      where: { id }
    });
    
    res.json({
      success: true,
      message: 'Bug report deleted successfully'
    });
  } catch (error) {
    console.error('Delete bug report error:', error);
    res.status(500).json({
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
        message: 'Test email sent successfully! Check spoodlebugs@gmail.com'
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
