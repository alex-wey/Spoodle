import { Router, Request, Response } from 'express';
import { prisma } from '../index.js';

const router = Router();

// Setup endpoint to create tables
router.post('/create-tables', async (req: Request, res: Response) => {
  try {
    console.log('🔄 Creating database tables...');

    // Create User table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "password" TEXT NOT NULL,
        "firstName" TEXT NOT NULL,
        "lastName" TEXT NOT NULL,
        "phone" TEXT,
        "address" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "users_pkey" PRIMARY KEY ("id")
      )
    `;
    console.log('✅ User table created');

    // Create Pet table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "pets" (
        "id" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "breed" TEXT,
        "dateOfBirth" TIMESTAMP(3),
        "gender" TEXT,
        "spayedNeutered" BOOLEAN NOT NULL DEFAULT false,
        "weight" DOUBLE PRECISION,
        "allergies" TEXT[],
        "dietaryRestrictions" TEXT[],
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        "ownerId" TEXT NOT NULL,
        CONSTRAINT "pets_pkey" PRIMARY KEY ("id")
      )
    `;
    console.log('✅ Pet table created');

    // Create Task table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "tasks" (
        "id" TEXT NOT NULL,
        "type" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "description" TEXT,
        "scheduledTime" TIMESTAMP(3) NOT NULL,
        "completionStatus" BOOLEAN NOT NULL DEFAULT false,
        "completedAt" TIMESTAMP(3),
        "completedBy" TEXT,
        "recurring" BOOLEAN NOT NULL DEFAULT false,
        "recurrencePattern" TEXT,
        "notes" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        "petId" TEXT NOT NULL,
        "ownerId" TEXT NOT NULL,
        CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
      )
    `;
    console.log('✅ Task table created');

    // Create Document table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "documents" (
        "id" TEXT NOT NULL,
        "category" TEXT NOT NULL,
        "hospitalName" TEXT NOT NULL,
        "fileName" TEXT NOT NULL,
        "originalFileName" TEXT NOT NULL,
        "filePath" TEXT NOT NULL,
        "fileSize" INTEGER NOT NULL,
        "mimeType" TEXT NOT NULL,
        "date" TIMESTAMP(3) NOT NULL,
        "notes" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        "petId" TEXT NOT NULL,
        "ownerId" TEXT NOT NULL,
        CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
      )
    `;
    console.log('✅ Document table created');

    // Create BugReport table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "bug_reports" (
        "id" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "description" TEXT NOT NULL,
        "severity" TEXT NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'open',
        "reporterId" TEXT,
        "reporterEmail" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "bug_reports_pkey" PRIMARY KEY ("id")
      )
    `;
    console.log('✅ BugReport table created');

    // Create indexes
    await prisma.$executeRaw`CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email")`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "pets_ownerId_idx" ON "pets"("ownerId")`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "tasks_petId_idx" ON "tasks"("petId")`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "tasks_ownerId_idx" ON "tasks"("ownerId")`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "documents_petId_idx" ON "documents"("petId")`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "documents_ownerId_idx" ON "documents"("ownerId")`;
    console.log('✅ Indexes created');

    // Create foreign key constraints
    await prisma.$executeRaw`
      ALTER TABLE "pets" ADD CONSTRAINT IF NOT EXISTS "pets_ownerId_fkey" 
      FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
    `;
    
    await prisma.$executeRaw`
      ALTER TABLE "tasks" ADD CONSTRAINT IF NOT EXISTS "tasks_petId_fkey" 
      FOREIGN KEY ("petId") REFERENCES "pets"("id") ON DELETE CASCADE ON UPDATE CASCADE
    `;
    
    await prisma.$executeRaw`
      ALTER TABLE "tasks" ADD CONSTRAINT IF NOT EXISTS "tasks_ownerId_fkey" 
      FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
    `;
    
    await prisma.$executeRaw`
      ALTER TABLE "documents" ADD CONSTRAINT IF NOT EXISTS "documents_petId_fkey" 
      FOREIGN KEY ("petId") REFERENCES "pets"("id") ON DELETE CASCADE ON UPDATE CASCADE
    `;
    
    await prisma.$executeRaw`
      ALTER TABLE "documents" ADD CONSTRAINT IF NOT EXISTS "documents_ownerId_fkey" 
      FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
    `;
    console.log('✅ Foreign key constraints created');

    res.json({
      success: true,
      message: 'All tables created successfully!',
      data: {
        tables: ['users', 'pets', 'tasks', 'documents', 'bug_reports'],
        indexes: 'created',
        constraints: 'created'
      }
    });

  } catch (error) {
    console.error('❌ Error creating tables:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create tables',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Check existing table structure
router.get('/check-tables', async (req: Request, res: Response) => {
  try {
    console.log('🔄 Checking existing table structures...');
    
    // Get table structures
    const usersStructure = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'users' AND table_schema = 'public'
      ORDER BY ordinal_position
    `;
    
    const petsStructure = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'pets' AND table_schema = 'public'
      ORDER BY ordinal_position
    `;
    
    const tasksStructure = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'tasks' AND table_schema = 'public'
      ORDER BY ordinal_position
    `;
    
    const documentsStructure = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'documents' AND table_schema = 'public'
      ORDER BY ordinal_position
    `;
    
    res.json({
      success: true,
      message: 'Table structures retrieved successfully!',
      data: {
        users: usersStructure,
        pets: petsStructure,
        tasks: tasksStructure,
        documents: documentsStructure
      }
    });
    
  } catch (error) {
    console.error('❌ Error checking table structures:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check table structures',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Test database connection
router.get('/test-connection', async (req: Request, res: Response) => {
  try {
    console.log('🔄 Testing database connection...');
    
    // Try to connect
    await prisma.$connect();
    console.log('✅ Database connection successful!');
    
    // Try a simple query
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Database query successful:', result);
    
    // Check if tables exist
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    console.log('📋 Existing tables:', tables);
    
    res.json({
      success: true,
      message: 'Database connection successful!',
      data: {
        connection: 'success',
        query: result,
        existingTables: tables
      }
    });
    
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    res.status(500).json({
      success: false,
      error: 'Database connection failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
