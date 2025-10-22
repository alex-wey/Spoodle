import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function checkSchema() {
  try {
    console.log('🔍 Checking pets table schema...\n');
    
    // Check the pets table structure
    const petsColumns = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'pets'
      ORDER BY ordinal_position;
    `;
    
    console.log('Pets table columns:');
    console.log(petsColumns);
    console.log('\n');
    
    // Check foreign key constraints on pets table
    const foreignKeys = await prisma.$queryRaw`
      SELECT
        tc.constraint_name,
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_name = 'pets';
    `;
    
    console.log('Foreign key constraints on pets table:');
    console.log(foreignKeys);
    console.log('\n');
    
    // Try to insert a test record to see the exact error
    console.log('Attempting to create a pet with our user ID...');
    console.log('User ID: eeca4a17-5aee-4f1e-8fbc-b5cc5d469de8\n');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkSchema();

