import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function createTables() {
  try {
    console.log('🔄 Connecting to database...');
    await prisma.$connect();
    console.log('✅ Connected to database successfully!');

    console.log('🔄 Creating tables...');
    
    // Create User table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "User" (
        "id" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "password" TEXT NOT NULL,
        "firstName" TEXT NOT NULL,
        "lastName" TEXT NOT NULL,
        "phone" TEXT,
        "address" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "User_pkey" PRIMARY KEY ("id")
      )
    `;
    console.log('✅ User table created');

    // Create Pet table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Pet" (
        "id" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "species" TEXT NOT NULL,
        "breed" TEXT,
        "gender" TEXT,
        "dateOfBirth" TIMESTAMP(3),
        "weight" DOUBLE PRECISION,
        "allergies" TEXT[],
        "dietaryRestrictions" TEXT[],
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        "ownerId" TEXT NOT NULL,
        CONSTRAINT "Pet_pkey" PRIMARY KEY ("id")
      )
    `;
    console.log('✅ Pet table created');

    // Create Task table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Task" (
        "id" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "description" TEXT,
        "scheduledTime" TIMESTAMP(3) NOT NULL,
        "completionStatus" BOOLEAN NOT NULL DEFAULT false,
        "completedAt" TIMESTAMP(3),
        "completedBy" TEXT,
        "notes" TEXT,
        "type" TEXT NOT NULL,
        "recurring" BOOLEAN NOT NULL DEFAULT false,
        "recurrencePattern" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        "petId" TEXT NOT NULL,
        "ownerId" TEXT NOT NULL,
        CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
      )
    `;
    console.log('✅ Task table created');

    // Create UserFile table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "UserFile" (
        "id" TEXT NOT NULL,
        "fileName" TEXT NOT NULL,
        "fileUrl" TEXT NOT NULL,
        "category" "DocumentCategory" NOT NULL,
        "uploadDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "notes" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        "petId" TEXT,
        "ownerId" TEXT NOT NULL,
        CONSTRAINT "UserFile_pkey" PRIMARY KEY ("id")
      )
    `;
    console.log('✅ UserFile table created');

    // Create enum for DocumentCategory
    await prisma.$executeRaw`
      CREATE TYPE "DocumentCategory" AS ENUM ('past_appointments', 'x_ray_documents', 'diagnostic_reports', 'blood_test_reports', 'vaccination_history', 'other_documents')
    `;
    console.log('✅ DocumentCategory enum created');

    // Create indexes
    await prisma.$executeRaw`CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email")`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "Pet_ownerId_idx" ON "Pet"("ownerId")`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "Task_petId_idx" ON "Task"("petId")`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "Task_ownerId_idx" ON "Task"("ownerId")`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "UserFile_petId_idx" ON "UserFile"("petId")`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "UserFile_ownerId_idx" ON "UserFile"("ownerId")`;
    console.log('✅ Indexes created');

    // Create foreign key constraints
    await prisma.$executeRaw`
      ALTER TABLE "Pet" ADD CONSTRAINT IF NOT EXISTS "Pet_ownerId_fkey" 
      FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
    `;
    
    await prisma.$executeRaw`
      ALTER TABLE "Task" ADD CONSTRAINT IF NOT EXISTS "Task_petId_fkey" 
      FOREIGN KEY ("petId") REFERENCES "Pet"("id") ON DELETE RESTRICT ON UPDATE CASCADE
    `;
    
    await prisma.$executeRaw`
      ALTER TABLE "Task" ADD CONSTRAINT IF NOT EXISTS "Task_ownerId_fkey" 
      FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
    `;
    
    await prisma.$executeRaw`
      ALTER TABLE "UserFile" ADD CONSTRAINT IF NOT EXISTS "UserFile_petId_fkey" 
      FOREIGN KEY ("petId") REFERENCES "Pet"("id") ON DELETE SET NULL ON UPDATE CASCADE
    `;
    
    await prisma.$executeRaw`
      ALTER TABLE "UserFile" ADD CONSTRAINT IF NOT EXISTS "UserFile_ownerId_fkey" 
      FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
    `;
    console.log('✅ Foreign key constraints created');

    console.log('🎉 All tables created successfully!');
    
  } catch (error) {
    console.error('❌ Error creating tables:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTables();
