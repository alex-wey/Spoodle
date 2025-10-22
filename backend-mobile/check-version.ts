import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function checkVersion() {
  try {
    const result = await prisma.$queryRaw`SELECT version()`;
    console.log('PostgreSQL Version:', result);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkVersion();

