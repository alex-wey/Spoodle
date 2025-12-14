import { Router, Request, Response } from 'express';
import { prisma } from '../index.js';
import { authenticateClerk } from '../middleware/auth.js';

const router = Router();

// Apply authentication to all task routes
router.use(authenticateClerk);

// Get all tasks for the authenticated user
router.get('/', async (req: Request, res: Response) => {
  try {
    if (!req.petOwner) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: 'Please log in to view tasks'
      });
    }

    const { petId, startDate, endDate } = req.query;

    // Build where clause
    const where: any = {
      pet: {
        ownerId: req.petOwner.id
      }
    };

    // Filter by pet if specified
    if (petId && petId !== 'all') {
      where.petId = petId;
    }

    // Filter by date range if specified
    if (startDate || endDate) {
      const start = startDate ? new Date(startDate as string) : null;
      const end = endDate ? new Date(endDate as string) : null;
      if (end) {
        end.setHours(23, 59, 59, 999);
      }

      // For recurring tasks, include ALL of them (frontend will expand and filter)
      // For non-recurring tasks, filter by scheduledDate
      where.OR = [
        // Non-recurring tasks: scheduledDate must be in range
        {
          AND: [
            { recurring: false },
            {
              scheduledDate: {
                ...(start ? { gte: start } : {}),
                ...(end ? { lte: end } : {}),
              }
            }
          ]
        },
        // Recurring tasks: include all (frontend handles expansion)
        {
          recurring: true
        }
      ];
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        pet: {
          select: {
            id: true,
            name: true,
            species: true
          }
        }
      },
      orderBy: {
        scheduledDate: 'asc'
      }
    });

    return res.json({
      success: true,
      data: tasks,
      count: tasks.length,
      message: 'Tasks retrieved successfully'
    });
  } catch (error: any) {
    console.error('Get tasks error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error',
      message: 'Unable to retrieve tasks'
    });
  }
});

// Get a specific task
router.get('/:id', async (req: Request, res: Response) => {
  try {
    if (!req.petOwner) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: 'Please log in to view task'
      });
    }

    const task = await prisma.task.findFirst({
      where: {
        id: req.params.id,
        pet: {
          ownerId: req.petOwner.id
        }
      },
      include: {
        pet: {
          select: {
            id: true,
            name: true,
            species: true
          }
        }
      }
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found',
        message: 'Task does not exist or does not belong to you'
      });
    }

    return res.json({
      success: true,
      data: task,
      message: 'Task retrieved successfully'
    });
  } catch (error: any) {
    console.error('Get task error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error',
      message: 'Unable to retrieve task'
    });
  }
});

// Create a new task
router.post('/', async (req: Request, res: Response) => {
  try {
    if (!req.petOwner) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: 'Please log in to create tasks'
      });
    }

    const {
      petId,
      taskType,
      title,
      description,
      scheduledDate,
      scheduledTime,
      recurring,
      recurrencePattern,
      recurrenceDaysOfWeek,
      recurrenceEndDate,
      recurrenceTimes
    } = req.body;

    // Validate required fields
    if (!petId || !taskType || !title || !scheduledDate) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        message: 'petId, taskType, title, and scheduledDate are required'
      });
    }

    // Verify pet belongs to the user
    const pet = await prisma.pet.findFirst({
      where: {
        id: petId,
        ownerId: req.petOwner.id
      }
    });

    if (!pet) {
      return res.status(400).json({
        success: false,
        error: 'Invalid pet',
        message: 'Pet not found or does not belong to you'
      });
    }

    // Normalize scheduledDate to midnight UTC
    const normalizedDate = new Date(scheduledDate);
    normalizedDate.setUTCHours(0, 0, 0, 0);

    // Helper function to ensure JSON string format
    const ensureJsonString = (value: any): string | null => {
      if (!value) return null;
      if (typeof value === 'string') {
        // Already a string, check if it's valid JSON
        try {
          JSON.parse(value);
          return value;
        } catch {
          // Not valid JSON, stringify it
          return JSON.stringify(value);
        }
      }
      // Array or object, stringify it
      return JSON.stringify(value);
    };

    // Create task
    const task = await prisma.task.create({
      data: {
        petId,
        taskType,
        title,
        description: description || null,
        scheduledDate: normalizedDate,
        scheduledTime: scheduledTime || '00:00',
        recurring: recurring || false,
        recurrencePattern: recurrencePattern || null,
        recurrenceDaysOfWeek: ensureJsonString(recurrenceDaysOfWeek),
        recurrenceEndDate: recurrenceEndDate ? new Date(recurrenceEndDate) : null,
        recurrenceTimes: ensureJsonString(recurrenceTimes),
        completed: false
      },
      include: {
        pet: {
          select: {
            id: true,
            name: true,
            species: true
          }
        }
      }
    });

    return res.status(201).json({
      success: true,
      data: task,
      message: 'Task created successfully'
    });
  } catch (error: any) {
    console.error('Create task error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error',
      message: 'Unable to create task'
    });
  }
});

// Update a task (PUT)
router.put('/:id', async (req: Request, res: Response) => {
  return handleUpdateTask(req, res);
});

// Update a task (PATCH) - same handler as PUT
router.patch('/:id', async (req: Request, res: Response) => {
  return handleUpdateTask(req, res);
});

// Shared update handler
async function handleUpdateTask(req: Request, res: Response) {
  try {
    if (!req.petOwner) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    // Verify task belongs to user
    const existingTask = await prisma.task.findFirst({
      where: {
        id: req.params.id,
        pet: {
          ownerId: req.petOwner.id
        }
      }
    });

    if (!existingTask) {
      return res.status(404).json({
        success: false,
        error: 'Task not found',
        message: 'Task does not exist or does not belong to you'
      });
    }

    const {
      title,
      description,
      scheduledDate,
      scheduledTime,
      taskType,
      completed,
      completedAt,
      completedBy,
      completedByName,
      notes,
      recurrencePattern,
      recurrenceDaysOfWeek,
      recurrenceEndDate,
      recurrenceTimes
    } = req.body;

    // Build update data
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (scheduledTime !== undefined) updateData.scheduledTime = scheduledTime;
    if (taskType !== undefined) updateData.taskType = taskType;
    if (completed !== undefined) updateData.completed = completed;
    if (completedAt !== undefined) updateData.completedAt = completedAt ? new Date(completedAt) : null;
    if (completedBy !== undefined) updateData.completedBy = completedBy;
    if (completedByName !== undefined) updateData.completedByName = completedByName;
    if (notes !== undefined) updateData.notes = notes;
    // Helper function to ensure JSON string format
    const ensureJsonString = (value: any): string | null => {
      if (!value) return null;
      if (typeof value === 'string') {
        // Already a string, check if it's valid JSON
        try {
          JSON.parse(value);
          return value;
        } catch {
          // Not valid JSON, stringify it
          return JSON.stringify(value);
        }
      }
      // Array or object, stringify it
      return JSON.stringify(value);
    };

    if (recurrencePattern !== undefined) updateData.recurrencePattern = recurrencePattern;
    if (recurrenceDaysOfWeek !== undefined) updateData.recurrenceDaysOfWeek = ensureJsonString(recurrenceDaysOfWeek);
    if (recurrenceEndDate !== undefined) updateData.recurrenceEndDate = recurrenceEndDate ? new Date(recurrenceEndDate) : null;
    if (recurrenceTimes !== undefined) updateData.recurrenceTimes = ensureJsonString(recurrenceTimes);

    // Normalize scheduledDate to midnight UTC if provided
    if (scheduledDate !== undefined) {
      const normalizedDate = new Date(scheduledDate);
      normalizedDate.setUTCHours(0, 0, 0, 0);
      updateData.scheduledDate = normalizedDate;
    }

    const task = await prisma.task.update({
      where: { id: req.params.id },
      data: updateData,
      include: {
        pet: {
          select: {
            id: true,
            name: true,
            species: true
          }
        }
      }
    });

    return res.json({
      success: true,
      data: task,
      message: 'Task updated successfully'
    });
  } catch (error: any) {
    console.error('Update task error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error',
      message: 'Unable to update task'
    });
  }
}

// Mark task as completed
router.patch('/:id/complete', async (req: Request, res: Response) => {
  try {
    if (!req.petOwner) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    // Verify task belongs to user
    const existingTask = await prisma.task.findFirst({
      where: {
        id: req.params.id,
        pet: {
          ownerId: req.petOwner.id
        }
      }
    });

    if (!existingTask) {
      return res.status(404).json({
        success: false,
        error: 'Task not found',
        message: 'Task does not exist or does not belong to you'
      });
    }

    const { completedAt, completedBy, completedByName, notes } = req.body;

    const task = await prisma.task.update({
      where: { id: req.params.id },
      data: {
        completed: true,
        completedAt: completedAt ? new Date(completedAt) : new Date(),
        completedBy: completedBy || null,
        completedByName: completedByName || null,
        notes: notes || existingTask.notes
      },
      include: {
        pet: {
          select: {
            id: true,
            name: true,
            species: true
          }
        }
      }
    });

    return res.json({
      success: true,
      data: task,
      message: 'Task marked as completed'
    });
  } catch (error: any) {
    console.error('Complete task error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error',
      message: 'Unable to complete task'
    });
  }
});

// Delete a task
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    if (!req.petOwner) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    // Verify task belongs to user
    const existingTask = await prisma.task.findFirst({
      where: {
        id: req.params.id,
        pet: {
          ownerId: req.petOwner.id
        }
      }
    });

    if (!existingTask) {
      return res.status(404).json({
        success: false,
        error: 'Task not found',
        message: 'Task does not exist or does not belong to you'
      });
    }

    await prisma.task.delete({
      where: { id: req.params.id }
    });

    return res.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error: any) {
    console.error('Delete task error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error',
      message: 'Unable to delete task'
    });
  }
});

export default router;

