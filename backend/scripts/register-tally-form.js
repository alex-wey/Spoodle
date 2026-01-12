/**
 * Script to register a Tally form in the database
 * 
 * Usage:
 *   node scripts/register-tally-form.js <tallyFormId> <title> [description]
 * 
 * Example:
 *   node scripts/register-tally-form.js Y50xYz "Morning of Surgery Questionnaire" "Pre-surgery form"
 * 
 * Note: This script requires CLERK_SECRET_KEY and DATABASE_URL in .env
 */

import { createClerkClient } from '@clerk/backend';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
const prisma = new PrismaClient();

async function registerForm(tallyFormId, title, description) {
  try {
    console.log('📝 Registering Tally form...');
    console.log(`   Form ID: ${tallyFormId}`);
    console.log(`   Title: ${title}`);
    console.log(`   Description: ${description || '(none)'}`);

    // Check if form already exists
    const existing = await prisma.form.findUnique({
      where: { tallyFormId }
    });

    if (existing) {
      console.log('⚠️  Form already exists!');
      console.log(`   Database ID: ${existing.id}`);
      console.log(`   Created: ${existing.createdAt}`);
      return existing;
    }

    // Create the form
    const form = await prisma.form.create({
      data: {
        tallyFormId,
        title,
        description: description || null,
        isActive: true
      }
    });

    console.log('✅ Form registered successfully!');
    console.log(`   Database ID: ${form.id}`);
    console.log(`   Tally Form ID: ${form.tallyFormId}`);
    console.log(`   Title: ${form.title}`);
    console.log(`   Active: ${form.isActive}`);

    return form;
  } catch (error) {
    console.error('❌ Error registering form:', error);
    throw error;
  }
}

// Get command line arguments
const args = process.argv.slice(2);

if (args.length < 2) {
  console.error('Usage: node scripts/register-tally-form.js <tallyFormId> <title> [description]');
  console.error('');
  console.error('Example:');
  console.error('  node scripts/register-tally-form.js Y50xYz "Morning of Surgery Questionnaire" "Pre-surgery form"');
  process.exit(1);
}

const [tallyFormId, title, description] = args;

// Run the script
registerForm(tallyFormId, title, description)
  .then(() => {
    console.log('\n✅ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Failed:', error.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


