// @ts-nocheck
import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { prisma } from '../index.js';
import { validateRequest, validationSchemas, commonSchemas } from '../middleware/validation.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// Apply authentication to all task routes
router.use(authenticateToken);

// Get all tasks for the authenticated user
router.get('/', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: 'Please log in to view tasks'
      });
    }

    // Get date filter from query params
    const { date } = req.query;
    
    let whereClause: any = {
      ownerId: req.user.id
    };
    
    if (date) {
      const startDate = new Date(date as string);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);
      
      whereClause.scheduledTime = {
        gte: startDate,
        lt: endDate
      };
    }

    const tasks = await prisma.task.findMany({
      where: whereClause,
      include: {
        pet: {
          select: {
            id: true,
            name: true,
            breed: true
          }
        }
      },
      orderBy: { scheduledTime: 'asc' }
    });
    
    res.json({
      success: true,
      data: tasks,
      message: 'Tasks retrieved successfully'
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error',
      message: 'Unable to retrieve tasks'
    });
  }
});

// Get tasks for a specific pet
router.get('/pet/:petId',
  validateRequest({ params: { petId: commonSchemas.id } }),
  async (req: Request, res: Response) => {
    try {
      const { petId } = req.params;
      
      // Verify pet belongs to the authenticated user
      const pet = await prisma.pet.findFirst({
        where: { 
          id: petId,
          ownerId: req.user!.id
        }
      });
      
      if (!pet) {
        return res.status(404).json({
          success: false,
          error: 'Pet not found',
          message: 'The requested pet does not exist or you do not have permission to view its tasks'
        });
      }

      const tasks = await prisma.task.findMany({
        where: { 
          petId,
          ownerId: req.user!.id
        },
        orderBy: { scheduledTime: 'asc' }
      });
      
      res.json({
        success: true,
        data: tasks,
        message: 'Tasks retrieved successfully'
      });
    } catch (error) {
      console.error('Get pet tasks error:', error);
      res.status(500).json({
        success: false,
        error: 'Server error',
        message: 'Unable to retrieve tasks'
      });
    }
  }
);

// Get a specific task by ID
router.get('/:id',
  validateRequest({ params: commonSchemas.id }),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      const task = await prisma.task.findFirst({
        where: { 
          id,
          ownerId: req.user!.id
        },
        include: {
          pet: {
            select: {
              id: true,
              name: true,
              breed: true
            }
          }
        }
      });
      
      if (!task) {
        return res.status(404).json({
          success: false,
          error: 'Task not found',
          message: 'The requested task does not exist or you do not have permission to view it'
        });
      }
      
      res.json({
        success: true,
        data: task,
        message: 'Task retrieved successfully'
      });
    } catch (error) {
      console.error('Get task error:', error);
      res.status(500).json({
        success: false,
        error: 'Server error',
        message: 'Unable to retrieve task'
      });
    }
  }
);

// Create a new task
router.post('/',
  validateRequest({ body: validationSchemas.createTask }),
  async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
          message: 'Please log in to create tasks'
        });
      }

      const { petId, ...taskData } = req.body;
      
      // Verify pet belongs to the user
      const pet = await prisma.pet.findFirst({
        where: { 
          id: petId,
          ownerId: req.user.id
        }
      });
      
      if (!pet) {
        return res.status(400).json({
          success: false,
          error: 'Invalid pet',
          message: 'Pet not found or does not belong to you'
        });
      }
      
      const newTask = await prisma.task.create({
        data: {
          id: uuidv4(),
          petId,
          ownerId: req.user.id,
          type: taskData.type,
          title: taskData.title,
          description: taskData.description,
          scheduledTime: new Date(taskData.scheduledTime),
          completionStatus: false,
          recurring: taskData.recurring || false,
          recurrencePattern: taskData.recurrencePattern
        },
        include: {
          pet: {
            select: {
              id: true,
              name: true,
              breed: true
            }
          }
        }
      });
      
      res.status(201).json({
        success: true,
        data: newTask,
        message: 'Task created successfully'
      });
    } catch (error) {
      console.error('Create task error:', error);
      res.status(500).json({
        success: false,
        error: 'Server error',
        message: 'Unable to create task'
      });
    }
  }
);

// Update a task
router.put('/:id',
  validateRequest({ 
    params: commonSchemas.id,
    body: {
      type: z.enum(['walk', 'feed', 'medicate', 'groom', 'training', 'checkup', 'other']).optional(),
      title: z.string().min(1).max(100).optional(),
      description: z.string().max(500).optional(),
      scheduledTime: z.string().datetime().optional(),
      recurring: z.boolean().optional(),
      recurrencePattern: z.enum(['daily', 'weekly', 'monthly']).optional(),
      notes: z.string().max(1000).optional()
    }
  }),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      // Check if task exists and belongs to user
      const existingTask = await prisma.task.findFirst({
        where: { 
          id,
          ownerId: req.user!.id
        }
      });
      
      if (!existingTask) {
        return res.status(404).json({
          success: false,
          error: 'Task not found',
          message: 'The requested task does not exist or you do not have permission to update it'
        });
      }

      const updateData = { ...req.body };
      if (updateData.scheduledTime) {
        updateData.scheduledTime = new Date(updateData.scheduledTime);
      }

      const updatedTask = await prisma.task.update({
        where: { id },
        data: updateData,
        include: {
          pet: {
            select: {
              id: true,
              name: true,
              breed: true
            }
          }
        }
      });
      
      res.json({
        success: true,
        data: updatedTask,
        message: 'Task updated successfully'
      });
    } catch (error) {
      console.error('Update task error:', error);
      res.status(500).json({
        success: false,
        error: 'Server error',
        message: 'Unable to update task'
      });
    }
  }
);

// Mark task as completed
router.patch('/:id/complete',
  validateRequest({ 
    params: commonSchemas.id,
    body: {
      notes: z.string().max(1000).optional(),
      completedBy: z.string().max(100).optional()
    }
  }),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { notes, completedBy } = req.body;
      
      // Check if task exists and belongs to user
      const existingTask = await prisma.task.findFirst({
        where: { 
          id,
          ownerId: req.user!.id
        }
      });
      
      if (!existingTask) {
        return res.status(404).json({
          success: false,
          error: 'Task not found',
          message: 'The requested task does not exist or you do not have permission to complete it'
        });
      }

      if (existingTask.completionStatus) {
        return res.status(400).json({
          success: false,
          error: 'Task already completed',
          message: 'This task has already been marked as completed'
        });
      }

      const updatedTask = await prisma.task.update({
        where: { id },
        data: {
          completionStatus: true,
          completedAt: new Date(),
          completedBy: completedBy || `${req.user!.firstName} ${req.user!.lastName}`,
          notes: notes || existingTask.notes
        },
        include: {
          pet: {
            select: {
              id: true,
              name: true,
              breed: true
            }
          }
        }
      });
      
      res.json({
        success: true,
        data: updatedTask,
        message: 'Task marked as completed successfully'
      });
    } catch (error) {
      console.error('Complete task error:', error);
      res.status(500).json({
        success: false,
        error: 'Server error',
        message: 'Unable to complete task'
      });
    }
  }
);

// Mark task as incomplete
router.patch('/:id/uncomplete',
  validateRequest({ params: commonSchemas.id }),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      // Check if task exists and belongs to user
      const existingTask = await prisma.task.findFirst({
        where: { 
          id,
          ownerId: req.user!.id
        }
      });
      
      if (!existingTask) {
        return res.status(404).json({
          success: false,
          error: 'Task not found',
          message: 'The requested task does not exist or you do not have permission to modify it'
        });
      }

      const updatedTask = await prisma.task.update({
        where: { id },
        data: {
          completionStatus: false,
          completedAt: null,
          completedBy: null
        },
        include: {
          pet: {
            select: {
              id: true,
              name: true,
              breed: true
            }
          }
        }
      });
      
      res.json({
        success: true,
        data: updatedTask,
        message: 'Task marked as incomplete successfully'
      });
    } catch (error) {
      console.error('Uncomplete task error:', error);
      res.status(500).json({
        success: false,
        error: 'Server error',
        message: 'Unable to update task'
      });
    }
  }
);

// Delete a task
router.delete('/:id',
  validateRequest({ params: commonSchemas.id }),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      // Check if task exists and belongs to user
      const existingTask = await prisma.task.findFirst({
        where: { 
          id,
          ownerId: req.user!.id
        }
      });
      
      if (!existingTask) {
        return res.status(404).json({
          success: false,
          error: 'Task not found',
          message: 'The requested task does not exist or you do not have permission to delete it'
        });
      }

      await prisma.task.delete({
        where: { id }
      });
      
      res.json({
        success: true,
        message: 'Task deleted successfully'
      });
    } catch (error) {
      console.error('Delete task error:', error);
      res.status(500).json({
        success: false,
        error: 'Server error',
        message: 'Unable to delete task'
      });
    }
  }
);

export default router;
