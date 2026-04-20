import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

// Import route modules
import authRoutes from '../../../routes/auth.js';
import petsRoutes from '../../../routes/pets.js';
import appointmentsRoutes from '../../../routes/appointments.js';
import tasksRoutes from '../../../routes/tasks.js';
import medicalRecordsRoutes from '../../../routes/medicalRecords.js';
import documentsRoutes from '../../../routes/documents.js';
import searchRoutes from '../../../routes/search.js';
import notificationsRoutes from '../../../routes/notifications.js';
import uploadsRoutes from '../../../routes/uploads.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());

// CORS configuration
const corsOptions = {
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    process.env.MOBILE_URL || 'http://localhost:19006',
    'http://localhost:8081'
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
    service: 'Spoodle API',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/pets', petsRoutes);
app.use('/api/appointments', appointmentsRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/medical-records', medicalRecordsRoutes);
app.use('/api/documents', documentsRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/uploads', uploadsRoutes);

// API documentation endpoint (basic)
app.get('/api', (req: Request, res: Response) => {
  res.json({
    service: 'Spoodle API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      pets: '/api/pets',
      appointments: '/api/appointments',
      tasks: '/api/tasks',
      medicalRecords: '/api/medical-records',
      documents: '/api/documents',
      search: '/api/search',
      notifications: '/api/notifications',
      uploads: '/uploads'
    },
    documentation: 'https://github.com/your-repo/spoodle-backend'
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
      '/api/appointments',
      '/api/tasks',
      '/api/medical-records',
      '/api/documents',
      '/api/search',
      '/api/notifications',
      '/uploads'
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
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
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

  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error',
    message: 'An unexpected error occurred',
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      details: err 
    })
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Spoodle API server running on http://localhost:${PORT}`);
  console.log(` Health check: http://localhost:${PORT}/health`);
  console.log(` API docs: http://localhost:${PORT}/api`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(` Upload directory: ${process.env.UPLOAD_DIR || './uploads'}`);
  console.log(` JWT configured: ${process.env.JWT_SECRET ? 'Yes' : 'No'}`);
}); 