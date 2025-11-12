import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  const clerkUserId = process.env.CLERK_USER_ID || process.argv[2];

  if (!clerkUserId) {
    throw new Error('Provide the Clerk user ID via CLERK_USER_ID env var or as the first CLI argument.');
  }

  const petOwner = await prisma.petOwner.findUnique({
    where: { clerkUserId },
    include: {
      user: true,
      pets: true,
    },
  });

  if (!petOwner) {
    console.log(`❌ No pet owner found for clerkUserId=${clerkUserId}`);
    return;
  }

  const output = {
    petOwner: {
      id: petOwner.id,
      clerkUserId: petOwner.clerkUserId,
      createdAt: petOwner.createdAt,
      updatedAt: petOwner.updatedAt,
    },
    user: petOwner.user,
    pets: petOwner.pets.map((pet) => ({
      id: pet.id,
      name: pet.name,
      species: pet.species,
      breed: pet.breed,
    })),
  };

  console.log(JSON.stringify(output, null, 2));
}

main()
  .catch((error) => {
    console.error('❌ Error fetching pets by Clerk user ID:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
