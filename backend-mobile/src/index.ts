import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Import route modules
import authRoutes from './routes/auth.js';
import petsRoutes from './routes/pets.js';
import tasksRoutes from './routes/tasks.js';
import documentsRoutes from './routes/documents.js';
import dashboardRoutes from './routes/dashboard.js';
import setupRoutes from './routes/setup.js';
import bugReportRoutes from './routes/bug-report.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

// Initialize Prisma client
export const prisma = new PrismaClient();

// Security middleware
app.use(helmet());

// CORS configuration for mobile app
const corsOptions = {
  origin: [
    'http://localhost:8081',
    'http://localhost:8082', 
    'http://localhost:19006',
    'http://localhost:19000',
    'exp://localhost:19000',
    'exp://192.168.1.100:19000',
    'exp://10.0.2.2:19000'
  ],
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Logging middleware
app.use(morgan('combined'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'Spoodle Mobile API',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    port: PORT
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/pets', petsRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/documents', documentsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/setup', setupRoutes);
app.use('/api/bug-report', bugReportRoutes);

// API documentation endpoint
app.get('/api', (req: Request, res: Response) => {
  res.json({
    service: 'Spoodle Mobile API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      pets: '/api/pets',
      tasks: '/api/tasks',
      documents: '/api/documents',
      dashboard: '/api/dashboard',
      bugReport: '/api/bug-report'
    },
    documentation: 'Mobile API for Spoodle pet management app'
  });
});

// 404 handler for API routes
app.use('/api/*', (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'API endpoint not found',
    message: `Cannot ${req.method} ${req.originalUrl}`,
    availableEndpoints: [
      '/api/auth',
      '/api/pets',
      '/api/tasks',
      '/api/documents',
      '/api/dashboard',
      '/api/bug-report'
    ]
  });
});

// General 404 handler
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Global error handler
app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
  console.error('Error:', err);
  
  // Handle specific error types
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      success: false,
      error: 'Invalid JSON',
      message: 'Request body contains invalid JSON'
    });
  }
  
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      error: 'File too large',
      message: 'Uploaded file exceeds size limit'
    });
  }

  return res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error',
    message: 'An unexpected error occurred',
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      details: err 
    })
  });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Stop signal received, closing server...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Termination signal received, closing server...');
  await prisma.$disconnect();
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  console.log('🔑 Mobile Backend Environment variables loaded:');
  console.log(`  - PORT: ${PORT}`);
  console.log(`  - MOBILE_DATABASE_URL: ${process.env.MOBILE_DATABASE_URL ? '✅ Set' : '❌ Not set'}`);
  console.log(`  - JWT_SECRET: ${process.env.JWT_SECRET ? '✅ Set' : '❌ Not set'}`);
  console.log(`🚀 Spoodle MOBILE Backend API running on http://localhost:${PORT}`);
  console.log(`📱 Mobile app should connect to: http://localhost:${PORT}`);
  console.log(`🔍 Mobile API endpoints available at:`);
  console.log(`  - Health: http://localhost:${PORT}/health`);
  console.log(`  - Auth: http://localhost:${PORT}/api/auth/*`);
  console.log(`  - Dashboard: http://localhost:${PORT}/api/dashboard/*`);
  console.log(`  - Pets: http://localhost:${PORT}/api/pets/*`);
  console.log(`  - Documents: http://localhost:${PORT}/api/documents/*`);
  console.log(`  - Tasks: http://localhost:${PORT}/api/tasks/*`);
  console.log(`  - Bug Reports: http://localhost:${PORT}/api/bug-report/*`);
  console.log(`🔒 This backend is COMPLETELY SEPARATE from web backend`);
});
