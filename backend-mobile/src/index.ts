import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Import route modules
import authRoutes from './routes/auth.js';
import petsRoutes from './routes/pets.js';
import documentsRoutes from './routes/documents.js';
import setupRoutes from './routes/setup.js';
import bugReportRoutes from './routes/bug-report.js';
import chatbotRoutes from './routes/chatbot.js';
import settingsRoutes from './routes/settings.js';
import clinicsRoutes from './routes/clinics.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT!;
const NODE_ENV = process.env.NODE_ENV!;
const IS_PRODUCTION = NODE_ENV === 'production';

// Initialize Prisma client
export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL!
    }
  },
  log: ['query', 'info', 'warn', 'error']
});

// Security middleware
app.use(helmet());

// CORS configuration for mobile app
// Native iOS/Android apps don't have CORS restrictions
// Allow all origins since mobile apps may send requests with various origins
const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow all origins for mobile apps
    // Mobile apps often send requests with null, file://, or custom scheme origins
    callback(null, true);
  },
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
app.use('/api/documents', documentsRoutes);
app.use('/api/setup', setupRoutes);
app.use('/api/bug-report', bugReportRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/clinics', clinicsRoutes);

// API documentation endpoint
app.get('/api', (req: Request, res: Response) => {
  res.json({
    service: 'Spoodle Mobile API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      pets: '/api/pets',
      documents: '/api/documents',
      bugReport: '/api/bug-report',
      chatbot: '/api/chatbot',
      settings: '/api/settings',
      clinics: '/api/clinics'
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
      '/api/documents',
      '/api/dashboard',
      '/api/bug-report',
      '/api/chatbot'
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

// Start server
const server = app.listen(PORT, async () => {
  console.log('🔑 Mobile Backend Environment variables loaded:');
  console.log(`  - NODE_ENV: ${NODE_ENV}`);
  console.log(`  - PORT: ${PORT}`);
  console.log(`  - DATABASE_URL: ${process.env.DATABASE_URL ? '✅ Set' : '❌ Not set'}`);
  console.log(`  - CLERK_SECRET_KEY: ${process.env.CLERK_SECRET_KEY ? '✅ Set' : '❌ Not set'}`);
  
  if (IS_PRODUCTION) {
    const domain = process.env.RAILWAY_PUBLIC_DOMAIN;
    console.log(`🚀 Spoodle MOBILE Backend API running in PRODUCTION`);
    console.log(`📱 Mobile app should connect to: https://${domain}`);
    console.log(`🔍 API Health Check: https://${domain}/health`);
  } else {
    console.log(`🚀 Spoodle MOBILE Backend API running on http://localhost:${PORT}`);
    console.log(`📱 Mobile app should connect to: http://localhost:${PORT}`);
    console.log(`🔍 Mobile API endpoints available at:`);
    console.log(`  - Health: http://localhost:${PORT}/health`);
    console.log(`  - Auth: http://localhost:${PORT}/api/auth/*`);
    console.log(`  - Dashboard: http://localhost:${PORT}/api/dashboard/*`);
    console.log(`  - Pets: http://localhost:${PORT}/api/pets/*`);
    console.log(`  - Documents: http://localhost:${PORT}/api/documents/*`);
    console.log(`  - Bug Reports: http://localhost:${PORT}/api/bug-report/*`);
    console.log(`  - Chatbot: http://localhost:${PORT}/api/chatbot/*`);
  }

  // Sync clinics from Clerk on startup
  const { syncClinicsFromClerk } = await import('./utils/clinicSync.js');
  await syncClinicsFromClerk();
});

// Graceful shutdown
const shutdown = async () => {
  console.log('Shutdown signal received, closing server gracefully...');
  server.close(async () => {
    console.log('HTTP server closed');
    await prisma.$disconnect();
    console.log('Database connection closed');
    process.exit(0);
  });
  
  // Force shutdown after 10 seconds
  setTimeout(() => {
    console.error('Forcing shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
