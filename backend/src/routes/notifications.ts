import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import Joi from 'joi';
import db from '../database/crud/index.js';
import { Notification } from '../database/entities/index.js';
import { validateRequest, commonSchemas } from '../middleware/validation.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// Apply authentication to all notification routes
router.use(authenticateToken);

// Get all notifications for the authenticated user
router.get('/', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: 'Please log in to view notifications'
      });
    }

    const notifications = await db.findWhere<Notification>('notifications', 
      notification => notification.userId === req.user!.petOwnerId
    );
    
    // Sort by creation date (most recent first)
    notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    res.json({
      success: true,
      data: notifications,
      message: 'Notifications retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error',
      message: 'Unable to retrieve notifications'
    });
  }
});

// Get unread notifications count
router.get('/unread-count', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: 'Please log in to view notification count'
      });
    }

    const notifications = await db.findWhere<Notification>('notifications', 
      notification => notification.userId === req.user!.petOwnerId && !notification.isRead
    );
    
    res.json({
      success: true,
      data: {
        count: notifications.length
      },
      message: 'Unread notifications count retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error',
      message: 'Unable to retrieve notification count'
    });
  }
});

// Get notifications by type
router.get('/type/:type',
  validateRequest({ 
    params: Joi.object({ 
      type: Joi.string().valid(
        'task_reminder', 'task_overdue', 'appointment_confirmation', 'appointment_reminder', 
        'appointment_update', 'record_shared', 'friend_request', 'system_update'
      ).required()
    })
  }),
  async (req: Request, res: Response) => {
    try {
      const { type } = req.params;
      
      const notifications = await db.findWhere<Notification>('notifications', 
        notification => notification.userId === req.user!.petOwnerId && notification.type === type
      );
      
      // Sort by creation date (most recent first)
      notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      res.json({
        success: true,
        data: notifications,
        message: `Notifications of type "${type}" retrieved successfully`
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Server error',
        message: 'Unable to retrieve notifications'
      });
    }
  }
);

// Get a specific notification by ID
router.get('/:id',
  validateRequest({ params: Joi.object({ id: commonSchemas.id }) }),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      const notification = await db.findById<Notification>('notifications', id);
      
      if (!notification) {
        return res.status(404).json({
          success: false,
          error: 'Notification not found',
          message: 'The requested notification does not exist'
        });
      }

      // Verify notification belongs to the authenticated user
      if (notification.userId !== req.user?.petOwnerId) {
        return res.status(403).json({
          success: false,
          error: 'Access denied',
          message: 'You do not have permission to view this notification'
        });
      }
      
      res.json({
        success: true,
        data: notification,
        message: 'Notification retrieved successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Server error',
        message: 'Unable to retrieve notification'
      });
    }
  }
);

// Mark notification as read
router.patch('/:id/read',
  validateRequest({ params: Joi.object({ id: commonSchemas.id }) }),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      // Check if notification exists and belongs to user
      const existingNotification = await db.findById<Notification>('notifications', id);
      
      if (!existingNotification) {
        return res.status(404).json({
          success: false,
          error: 'Notification not found',
          message: 'The requested notification does not exist'
        });
      }

      if (existingNotification.userId !== req.user?.petOwnerId) {
        return res.status(403).json({
          success: false,
          error: 'Access denied',
          message: 'You do not have permission to modify this notification'
        });
      }

      if (existingNotification.isRead) {
        return res.status(400).json({
          success: false,
          error: 'Notification already read',
          message: 'This notification has already been marked as read'
        });
      }

      const updatedNotification = await db.update<Notification>('notifications', id, {
        isRead: true,
        readAt: new Date().toISOString()
      });
      
      res.json({
        success: true,
        data: updatedNotification,
        message: 'Notification marked as read successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Server error',
        message: 'Unable to mark notification as read'
      });
    }
  }
);

// Mark all notifications as read
router.patch('/mark-all-read', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: 'Please log in to mark notifications as read'
      });
    }

    const notifications = await db.findWhere<Notification>('notifications', 
      notification => notification.userId === req.user!.petOwnerId && !notification.isRead
    );

    let updatedCount = 0;
    const readAt = new Date().toISOString();

    for (const notification of notifications) {
      const updated = await db.update<Notification>('notifications', notification.notificationId, {
        isRead: true,
        readAt: readAt
      });
      if (updated) updatedCount++;
    }
    
    res.json({
      success: true,
      data: {
        updatedCount: updatedCount
      },
      message: `${updatedCount} notifications marked as read`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error',
      message: 'Unable to mark notifications as read'
    });
  }
});

// Delete a notification
router.delete('/:id',
  validateRequest({ params: Joi.object({ id: commonSchemas.id }) }),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      // Check if notification exists and belongs to user
      const existingNotification = await db.findById<Notification>('notifications', id);
      
      if (!existingNotification) {
        return res.status(404).json({
          success: false,
          error: 'Notification not found',
          message: 'The requested notification does not exist'
        });
      }

      if (existingNotification.userId !== req.user?.petOwnerId) {
        return res.status(403).json({
          success: false,
          error: 'Access denied',
          message: 'You do not have permission to delete this notification'
        });
      }

      const deleted = await db.delete('notifications', id);
      
      if (!deleted) {
        return res.status(500).json({
          success: false,
          error: 'Delete failed',
          message: 'Unable to delete notification'
        });
      }
      
      res.json({
        success: true,
        message: 'Notification deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Server error',
        message: 'Unable to delete notification'
      });
    }
  }
);

// Create a notification (for internal use or admin)
router.post('/',
  validateRequest({
    body: Joi.object({
      userId: Joi.string().required(),
      type: Joi.string().valid(
        'task_reminder', 'task_overdue', 'appointment_confirmation', 'appointment_reminder', 
        'appointment_update', 'record_shared', 'friend_request', 'system_update'
      ).required(),
      title: Joi.string().min(1).max(200).required(),
      message: Joi.string().min(1).max(1000).required(),
      data: Joi.object().optional()
    })
  }),
  async (req: Request, res: Response) => {
    try {
      const { userId, type, title, message, data } = req.body;
      
      // In a real application, you might want to verify that the user exists
      // and that the current user has permission to create notifications for them
      
      const newNotification = await db.create<Notification>('notifications', {
        notificationId: uuidv4(),
        userId: userId,
        type: type,
        title: title,
        message: message,
        isRead: false,
        data: data,
        createdAt: new Date().toISOString()
      });
      
      res.status(201).json({
        success: true,
        data: newNotification,
        message: 'Notification created successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Server error',
        message: 'Unable to create notification'
      });
    }
  }
);

export default router;
