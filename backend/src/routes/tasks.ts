import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import Joi from 'joi';
import db from '../database/crud/index.js';
import { Task, CreateTaskRequest, Pet } from '../database/entities/index.js';
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

    // Get all pets for the user first
    const userPets = await db.getPetsByOwner(req.user.petOwnerId);
    const petIds = userPets.map(pet => pet.petId);
    
    // Get all tasks for these pets
    const allTasks: Task[] = [];
    for (const petId of petIds) {
      const petTasks = await db.getTasksByPet(petId);
      allTasks.push(...petTasks);
    }
    
    // Sort by scheduled time (most recent first)
    allTasks.sort((a, b) => new Date(b.scheduledTime).getTime() - new Date(a.scheduledTime).getTime());
    
    res.json({
      success: true,
      data: allTasks,
      message: 'Tasks retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error',
      message: 'Unable to retrieve tasks'
    });
  }
});

// Get tasks for a specific pet
router.get('/pet/:petId',
  validateRequest({ params: Joi.object({ petId: commonSchemas.id }) }),
  async (req: Request, res: Response) => {
    try {
      const { petId } = req.params;
      
      // Verify pet belongs to the authenticated user
      const pet = await db.findById<Pet>('pets', petId);
      
      if (!pet) {
        return res.status(404).json({
          success: false,
          error: 'Pet not found',
          message: 'The requested pet does not exist'
        });
      }

      if (pet.ownerId !== req.user?.petOwnerId) {
        return res.status(403).json({
          success: false,
          error: 'Access denied',
          message: 'You do not have permission to view this pet\'s tasks'
        });
      }

      const tasks = await db.getTasksByPet(petId);
      
      // Sort by scheduled time (most recent first)
      tasks.sort((a, b) => new Date(b.scheduledTime).getTime() - new Date(a.scheduledTime).getTime());
      
      res.json({
        success: true,
        data: tasks,
        message: 'Tasks retrieved successfully'
      });
    } catch (error) {
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
  validateRequest({ params: Joi.object({ id: commonSchemas.id }) }),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      const task = await db.findById<Task>('tasks', id);
      
      if (!task) {
        return res.status(404).json({
          success: false,
          error: 'Task not found',
          message: 'The requested task does not exist'
        });
      }

      // Verify task belongs to the authenticated user through pet ownership
      const pet = await db.findById<Pet>('pets', task.petId);
      if (!pet || pet.ownerId !== req.user?.petOwnerId) {
        return res.status(403).json({
          success: false,
          error: 'Access denied',
          message: 'You do not have permission to view this task'
        });
      }
      
      res.json({
        success: true,
        data: task,
        message: 'Task retrieved successfully'
      });
    } catch (error) {
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

      const taskData: CreateTaskRequest = req.body;
      
      // Verify pet belongs to the user
      const pet = await db.findById<Pet>('pets', taskData.petId);
      if (!pet || pet.ownerId !== req.user.petOwnerId) {
        return res.status(400).json({
          success: false,
          error: 'Invalid pet',
          message: 'Pet not found or does not belong to you'
        });
      }
      
      const newTask = await db.createTask({
        taskId: uuidv4(),
        petId: taskData.petId,
        ownerId: req.user.petOwnerId,
        type: taskData.type,
        title: taskData.title,
        description: taskData.description,
        scheduledTime: taskData.scheduledTime,
        completionStatus: false,
        recurring: taskData.recurring || false,
        recurrencePattern: taskData.recurrencePattern
      });
      
      res.status(201).json({
        success: true,
        data: newTask,
        message: 'Task created successfully'
      });
    } catch (error) {
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
    params: Joi.object({ id: commonSchemas.id }),
    body: Joi.object({
      type: Joi.string().valid(
        'walk', 'feed', 'medicate', 'groom', 'training', 'checkup', 'other'
      ).optional(),
      title: Joi.string().min(1).max(100).optional(),
      description: Joi.string().max(500).optional(),
      scheduledTime: Joi.date().iso().optional(),
      recurring: Joi.boolean().optional(),
      recurrencePattern: Joi.string().valid('daily', 'weekly', 'monthly').optional(),
      notes: Joi.string().max(1000).optional()
    })
  }),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      // Check if task exists and belongs to user
      const existingTask = await db.findById<Task>('tasks', id);
      
      if (!existingTask) {
        return res.status(404).json({
          success: false,
          error: 'Task not found',
          message: 'The requested task does not exist'
        });
      }

      // Verify task belongs to the authenticated user through pet ownership
      const pet = await db.findById<Pet>('pets', existingTask.petId);
      if (!pet || pet.ownerId !== req.user?.petOwnerId) {
        return res.status(403).json({
          success: false,
          error: 'Access denied',
          message: 'You do not have permission to update this task'
        });
      }

      const updatedTask = await db.update<Task>('tasks', id, req.body);
      
      if (!updatedTask) {
        return res.status(500).json({
          success: false,
          error: 'Update failed',
          message: 'Unable to update task'
        });
      }
      
      res.json({
        success: true,
        data: updatedTask,
        message: 'Task updated successfully'
      });
    } catch (error) {
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
    params: Joi.object({ id: commonSchemas.id }),
    body: Joi.object({
      notes: Joi.string().max(1000).optional(),
      completedBy: Joi.string().max(100).optional()
    })
  }),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { notes, completedBy } = req.body;
      
      // Check if task exists and belongs to user
      const existingTask = await db.findById<Task>('tasks', id);
      
      if (!existingTask) {
        return res.status(404).json({
          success: false,
          error: 'Task not found',
          message: 'The requested task does not exist'
        });
      }

      // Verify task belongs to the authenticated user through pet ownership
      const pet = await db.findById<Pet>('pets', existingTask.petId);
      if (!pet || pet.ownerId !== req.user?.petOwnerId) {
        return res.status(403).json({
          success: false,
          error: 'Access denied',
          message: 'You do not have permission to complete this task'
        });
      }

      if (existingTask.completionStatus) {
        return res.status(400).json({
          success: false,
          error: 'Task already completed',
          message: 'This task has already been marked as completed'
        });
      }

      const updatedTask = await db.update<Task>('tasks', id, {
        completionStatus: true,
        completedAt: new Date().toISOString(),
        completedBy: completedBy || req.user?.username,
        notes: notes || existingTask.notes
      });
      
      res.json({
        success: true,
        data: updatedTask,
        message: 'Task marked as completed successfully'
      });
    } catch (error) {
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
  validateRequest({ params: Joi.object({ id: commonSchemas.id }) }),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      // Check if task exists and belongs to user
      const existingTask = await db.findById<Task>('tasks', id);
      
      if (!existingTask) {
        return res.status(404).json({
          success: false,
          error: 'Task not found',
          message: 'The requested task does not exist'
        });
      }

      // Verify task belongs to the authenticated user through pet ownership
      const pet = await db.findById<Pet>('pets', existingTask.petId);
      if (!pet || pet.ownerId !== req.user?.petOwnerId) {
        return res.status(403).json({
          success: false,
          error: 'Access denied',
          message: 'You do not have permission to modify this task'
        });
      }

      const updatedTask = await db.update<Task>('tasks', id, {
        completionStatus: false,
        completedAt: undefined,
        completedBy: undefined
      });
      
      res.json({
        success: true,
        data: updatedTask,
        message: 'Task marked as incomplete successfully'
      });
    } catch (error) {
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
  validateRequest({ params: Joi.object({ id: commonSchemas.id }) }),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      // Check if task exists and belongs to user
      const existingTask = await db.findById<Task>('tasks', id);
      
      if (!existingTask) {
        return res.status(404).json({
          success: false,
          error: 'Task not found',
          message: 'The requested task does not exist'
        });
      }

      // Verify task belongs to the authenticated user through pet ownership
      const pet = await db.findById<Pet>('pets', existingTask.petId);
      if (!pet || pet.ownerId !== req.user?.petOwnerId) {
        return res.status(403).json({
          success: false,
          error: 'Access denied',
          message: 'You do not have permission to delete this task'
        });
      }

      const deleted = await db.delete('tasks', id);
      
      if (!deleted) {
        return res.status(500).json({
          success: false,
          error: 'Delete failed',
          message: 'Unable to delete task'
        });
      }
      
      res.json({
        success: true,
        message: 'Task deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Server error',
        message: 'Unable to delete task'
      });
    }
  }
);

export default router;
