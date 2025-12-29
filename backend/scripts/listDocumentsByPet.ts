import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  const petId = process.env.PET_ID || process.argv[2];
  if (!petId) {
    throw new Error('Provide PET_ID env var or first CLI argument.');
  }

  const documents = await prisma.document.findMany({
    where: { petId },
    orderBy: { createdAt: 'desc' },
  });

  console.log(JSON.stringify(documents, null, 2));
}

main()
  .catch((error) => {
    console.error('❌ Error listing documents:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
