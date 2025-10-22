import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function testCreatePet() {
  try {
    console.log('Testing pet creation...\n');
    
    const petData = {
      ownerId: 'ee008231-76a6-45b7-bb4e-693cf89c8be5',
      name: 'Buddy',
      species: 'Dog',
      breed: 'Golden Retriever',
      dateOfBirth: new Date('2020-05-15T00:00:00Z'),
      weight: 65,
      allergies: [],
      dietaryRestrictions: []
    };
    
    console.log('Attempting to create pet with data:', petData);
    
    const newPet = await prisma.pet.create({
      data: petData
    });
    
    console.log('\n✅ SUCCESS! Pet created:');
    console.log(newPet);
    
  } catch (error) {
    console.error('\n❌ ERROR:');
    console.error('Name:', (error as any).name);
    console.error('Message:', (error as any).message);
    console.error('\nFull error:');
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

testCreatePet();

