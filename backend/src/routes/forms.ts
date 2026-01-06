import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../index.js';
import { authenticateClerk } from '../middleware/auth.js';
import { validateRequest, commonSchemas } from '../middleware/validation.js';

const router = Router();

// Apply authentication to all form routes
router.use(authenticateClerk);

/**
 * GET /api/forms
 * Get all forms (filtered by clinic if user is staff/petOwner)
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    if (!req.petOwner && !req.staff) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: 'Please log in to view forms'
      });
    }

    // Build where clause based on user type
    let where: any = {};
    
    // If user is a petOwner, show forms for their clinic
    if (req.petOwner?.clinicId) {
      where.clinicId = req.petOwner.clinicId;
    }
    
    // If user is staff, show forms for their clinic
    // Note: You may need to add clinicId to Staff model or get it from Clerk org
    // For now, we'll show all active forms if staff

    const forms = await prisma.form.findMany({
      where,
      include: {
        clinic: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        _count: {
          select: {
            submissions: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.json({
      success: true,
      data: forms,
      count: forms.length,
      message: 'Forms retrieved successfully'
    });
  } catch (error) {
    console.error('Get forms error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error',
      message: 'Unable to retrieve forms'
    });
  }
});

/**
 * GET /api/forms/:id
 * Get a specific form by ID
 */
router.get('/:id',
  validateRequest({ params: z.object({ id: commonSchemas.id }) }),
  async (req: Request, res: Response) => {
    try {
      if (!req.petOwner && !req.staff) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
          message: 'Please log in to view forms'
        });
      }

      const { id } = req.params;

      const form = await prisma.form.findUnique({
        where: { id: id as string },
        include: {
          clinic: {
            select: {
              id: true,
              name: true,
              slug: true
            }
          },
          _count: {
            select: {
              submissions: true
            }
          }
        }
      });

      if (!form) {
        return res.status(404).json({
          success: false,
          error: 'Form not found',
          message: 'The requested form does not exist'
        });
      }

      // Check clinic access if form is clinic-specific
      if (form.clinicId && req.petOwner?.clinicId !== form.clinicId) {
        return res.status(403).json({
          success: false,
          error: 'Access denied',
          message: 'You do not have permission to view this form'
        });
      }

      return res.json({
        success: true,
        data: form,
        message: 'Form retrieved successfully'
      });
    } catch (error) {
      console.error('Get form error:', error);
      return res.status(500).json({
        success: false,
        error: 'Server error',
        message: 'Unable to retrieve form'
      });
    }
  }
);

/**
 * POST /api/forms
 * Create a new form (link a Tally form to the system)
 */
router.post('/',
  validateRequest({
    body: z.object({
      tallyFormId: z.string().min(1, 'Tally form ID is required'),
      title: z.string().min(1, 'Title is required'),
      description: z.string().optional(),
      clinicId: z.string().uuid().optional(),
      metadata: z.any().optional()
    })
  }),
  async (req: Request, res: Response) => {
    try {
      if (!req.petOwner && !req.staff) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
          message: 'Please log in to create forms'
        });
      }

      const { tallyFormId, title, description, clinicId, metadata } = req.body;

      // Check if form with this Tally ID already exists
      const existingForm = await prisma.form.findUnique({
        where: { tallyFormId: tallyFormId as string }
      });

      if (existingForm) {
        return res.status(400).json({
          success: false,
          error: 'Form already exists',
          message: 'A form with this Tally ID is already registered'
        });
      }

      // If clinicId is provided, verify it exists
      let finalClinicId = clinicId;
      if (clinicId) {
        const clinic = await prisma.clinic.findUnique({
          where: { id: clinicId as string }
        });

        if (!clinic) {
          return res.status(400).json({
            success: false,
            error: 'Invalid clinic',
            message: 'The specified clinic does not exist'
          });
        }

        // If user is petOwner, ensure they belong to this clinic
        if (req.petOwner && req.petOwner.clinicId !== clinicId) {
          return res.status(403).json({
            success: false,
            error: 'Access denied',
            message: 'You can only create forms for your own clinic'
          });
        }
      } else if (req.petOwner?.clinicId) {
        // Auto-assign to user's clinic if they have one
        finalClinicId = req.petOwner.clinicId;
      }

      // Build data object conditionally to avoid TypeScript errors with optional fields
      const formData: any = {
        tallyFormId: tallyFormId as string,
        title: title as string,
        isActive: true,
        metadata: metadata || {}
      };

      // Only include optional fields if they have values
      if (description) {
        formData.description = description;
      }
      if (finalClinicId) {
        formData.clinicId = finalClinicId;
      }

      const form = await prisma.form.create({
        data: formData,
        include: {
          clinic: {
            select: {
              id: true,
              name: true,
              slug: true
            }
          }
        }
      });

      return res.status(201).json({
        success: true,
        data: form,
        message: 'Form created successfully'
      });
    } catch (error) {
      console.error('Create form error:', error);
      return res.status(500).json({
        success: false,
        error: 'Server error',
        message: 'Unable to create form'
      });
    }
  }
);

/**
 * GET /api/forms/:id/submissions
 * Get all submissions for a specific form
 */
router.get('/:id/submissions',
  validateRequest({ params: z.object({ id: commonSchemas.id }) }),
  async (req: Request, res: Response) => {
    try {
      if (!req.petOwner && !req.staff) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
          message: 'Please log in to view form submissions'
        });
      }

      const { id } = req.params;

      // First verify form exists and user has access
      const form = await prisma.form.findUnique({
        where: { id: id as string }
      });

      if (!form) {
        return res.status(404).json({
          success: false,
          error: 'Form not found',
          message: 'The requested form does not exist'
        });
      }

      // Check clinic access
      if (form.clinicId && req.petOwner?.clinicId !== form.clinicId) {
        return res.status(403).json({
          success: false,
          error: 'Access denied',
          message: 'You do not have permission to view submissions for this form'
        });
      }

      const submissions = await prisma.formSubmission.findMany({
        where: { formId: id as string },
        orderBy: { createdAt: 'desc' },
        include: {
          form: {
            select: {
              id: true,
              title: true
            }
          }
        }
      });

      return res.json({
        success: true,
        data: submissions,
        count: submissions.length,
        message: 'Form submissions retrieved successfully'
      });
    } catch (error) {
      console.error('Get form submissions error:', error);
      return res.status(500).json({
        success: false,
        error: 'Server error',
        message: 'Unable to retrieve form submissions'
      });
    }
  }
);

/**
 * PUT /api/forms/:id
 * Update a form (title, description, isActive, etc.)
 */
router.put('/:id',
  validateRequest({
    params: z.object({ id: commonSchemas.id }),
    body: z.object({
      title: z.string().min(1).optional(),
      description: z.string().optional(),
      isActive: z.boolean().optional(),
      metadata: z.any().optional()
    })
  }),
  async (req: Request, res: Response) => {
    try {
      if (!req.petOwner && !req.staff) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
          message: 'Please log in to update forms'
        });
      }

      const { id } = req.params;
      const { title, description, isActive, metadata } = req.body;

      // Verify form exists and user has access
      const existingForm = await prisma.form.findUnique({
        where: { id: id as string }
      });

      if (!existingForm) {
        return res.status(404).json({
          success: false,
          error: 'Form not found',
          message: 'The requested form does not exist'
        });
      }

      // Check clinic access
      if (existingForm.clinicId && req.petOwner?.clinicId !== existingForm.clinicId) {
        return res.status(403).json({
          success: false,
          error: 'Access denied',
          message: 'You do not have permission to update this form'
        });
      }

      const updateData: any = {};
      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (isActive !== undefined) updateData.isActive = isActive;
      if (metadata !== undefined) updateData.metadata = metadata;

      const updatedForm = await prisma.form.update({
        where: { id: id as string },
        data: updateData,
        include: {
          clinic: {
            select: {
              id: true,
              name: true,
              slug: true
            }
          }
        }
      });

      return res.json({
        success: true,
        data: updatedForm,
        message: 'Form updated successfully'
      });
    } catch (error) {
      console.error('Update form error:', error);
      return res.status(500).json({
        success: false,
        error: 'Server error',
        message: 'Unable to update form'
      });
    }
  }
);

export default router;

