import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function debugUser() {
  try {
    console.log('🔍 Checking database connection...');
    await prisma.$connect();
    console.log('✅ Connected to database\n');

    // Check if users table exists and has data
    console.log('📊 Checking users in database...');
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        createdAt: true
      }
    });
    
    console.log(`Found ${users.length} users:`);
    users.forEach(user => {
      console.log(`  - ${user.email} (ID: ${user.id})`);
    });
    console.log('');

    // Check the specific user from JWT
    const targetUserId = '4ecd7e95-59b2-47fa-9906-f9dde751aa9e';
    console.log(`🔎 Looking for user with ID: ${targetUserId}`);
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId }
    });
    
    if (targetUser) {
      console.log('✅ User EXISTS in database:');
      console.log(`   Email: ${targetUser.email}`);
      console.log(`   Name: ${targetUser.firstName} ${targetUser.lastName}`);
    } else {
      console.log('❌ User DOES NOT EXIST in database');
      console.log('   This is why pet creation is failing!');
    }
    console.log('');

    // Check pets table
    console.log('📊 Checking pets in database...');
    const pets = await prisma.pet.findMany({
      select: {
        id: true,
        name: true,
        ownerId: true,
        species: true
      }
    });
    console.log(`Found ${pets.length} pets`);
    pets.forEach(pet => {
      console.log(`  - ${pet.name} (${pet.species}) - Owner ID: ${pet.ownerId}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugUser();

