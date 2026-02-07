import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function deleteTasksForPet() {
  const petId = process.argv[2];
  
  if (!petId) {
    console.error('Usage: npx tsx scripts/deleteTasksForPet.ts <petId>');
    process.exit(1);
  }

  console.log(`Deleting all tasks for pet: ${petId}`);
  
  const result = await prisma.task.deleteMany({
    where: { petId },
  });

  console.log(`✅ Deleted ${result.count} task(s)`);
  await prisma.$disconnect();
}

deleteTasksForPet().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
