import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function fixConstraint() {
  try {
    console.log('🔧 Dropping foreign key constraint...\n');
    
    // Drop the constraint
    await prisma.$executeRaw`
      ALTER TABLE pets DROP CONSTRAINT IF EXISTS pets_ownerId_fkey;
    `;
    
    console.log('✅ Constraint dropped successfully!\n');
    console.log('You can now create pets without the foreign key constraint.');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixConstraint();

