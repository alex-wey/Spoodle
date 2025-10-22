import { Router, Request, Response } from 'express';
import { prisma } from '../index.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// Apply authentication to all dashboard routes
router.use(authenticateToken);

// Get dashboard overview data
router.get('/', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: 'Please log in to view dashboard'
      });
    }

    const userId = req.user.id;

    // Get user's pets count
    const petsCount = await prisma.pet.count({
      where: { ownerId: userId }
    });

    // Get today's tasks
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayTasks = await prisma.task.count({
      where: {
        ownerId: userId,
        scheduledTime: {
          gte: today,
          lt: tomorrow
        }
      }
    });

    // Get completed tasks today
    const completedTodayTasks = await prisma.task.count({
      where: {
        ownerId: userId,
        scheduledTime: {
          gte: today,
          lt: tomorrow
        },
        completionStatus: true
      }
    });

    // Get pending tasks
    const pendingTasks = await prisma.task.count({
      where: {
        ownerId: userId,
        completionStatus: false,
        scheduledTime: {
          lt: tomorrow
        }
      }
    });

    // Get recent documents count (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentDocuments = await prisma.document.count({
      where: {
        ownerId: userId,
        createdAt: {
          gte: thirtyDaysAgo
        }
      }
    });

    // Get upcoming tasks (next 7 days)
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    const upcomingTasks = await prisma.task.findMany({
      where: {
        ownerId: userId,
        scheduledTime: {
          gte: tomorrow,
          lte: nextWeek
        },
        completionStatus: false
      },
      include: {
        pet: {
          select: {
            id: true,
            name: true,
            breed: true
          }
        }
      },
      orderBy: { scheduledTime: 'asc' },
      take: 5
    });

    // Get recent documents
    const recentDocs = await prisma.document.findMany({
      where: {
        ownerId: userId
      },
      include: {
        pet: {
          select: {
            id: true,
            name: true,
            breed: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    const dashboardData = {
      overview: {
        totalPets: petsCount,
        todayTasks: todayTasks,
        completedToday: completedTodayTasks,
        pendingTasks: pendingTasks,
        recentDocuments: recentDocuments
      },
      upcomingTasks,
      recentDocuments: recentDocs
    };

    res.json({
      success: true,
      data: dashboardData,
      message: 'Dashboard data retrieved successfully'
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error',
      message: 'Unable to retrieve dashboard data'
    });
  }
});

// Get user statistics
router.get('/stats', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: 'Please log in to view statistics'
      });
    }

    const userId = req.user.id;

    // Get task completion rate for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const totalTasksLast30Days = await prisma.task.count({
      where: {
        ownerId: userId,
        scheduledTime: {
          gte: thirtyDaysAgo
        }
      }
    });

    const completedTasksLast30Days = await prisma.task.count({
      where: {
        ownerId: userId,
        scheduledTime: {
          gte: thirtyDaysAgo
        },
        completionStatus: true
      }
    });

    const completionRate = totalTasksLast30Days > 0 
      ? Math.round((completedTasksLast30Days / totalTasksLast30Days) * 100) 
      : 0;

    // Get tasks by type for the last 30 days
    const tasksByType = await prisma.task.groupBy({
      by: ['type'],
      where: {
        ownerId: userId,
        scheduledTime: {
          gte: thirtyDaysAgo
        }
      },
      _count: {
        type: true
      }
    });

    // Get documents by category
    const documentsByCategory = await prisma.document.groupBy({
      by: ['category'],
      where: {
        ownerId: userId
      },
      _count: {
        category: true
      }
    });

    const stats = {
      completionRate,
      tasksByType: tasksByType.map(item => ({
        type: item.type,
        count: item._count.type
      })),
      documentsByCategory: documentsByCategory.map(item => ({
        category: item.category,
        count: item._count.category
      })),
      totalTasks: totalTasksLast30Days,
      completedTasks: completedTasksLast30Days
    };

    res.json({
      success: true,
      data: stats,
      message: 'Statistics retrieved successfully'
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error',
      message: 'Unable to retrieve statistics'
    });
  }
});

export default router;
