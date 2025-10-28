import { prisma } from '../index.js';
import * as fs from 'fs/promises';

export interface ClerkUserData {
  clerkUserId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
}

export async function getOrCreateUser(clerkUserData: ClerkUserData) {
  try {
    // Check if user exists in local database
    const user = await prisma.user.findUnique({ where: { clerkUserId: clerkUserData.clerkUserId }});

    if (!user) {
      console.log('👤 Creating new user from Clerk:', clerkUserData.email);
      
      // Create user and petOwner in a transaction
      const result = await prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({ data: clerkUserData });
        await tx.petOwner.create({ data: { clerkUserId: clerkUserData.clerkUserId } });

        console.log('✅ Created User and PetOwner for:', clerkUserData.email);
        
        return newUser;
      });

      return result;
    }

    return user;
  } catch (error) {
    console.error('Error syncing user with Clerk:', error);
    throw error;
  }
}

export async function updateUserProfile(clerkUserId: string, updateData: {
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
}) {
  try {
    const updatedUser = await prisma.user.update({
      where: { clerkUserId },
      data: updateData,
      select: {
        id: true,
        clerkUserId: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        address: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return updatedUser;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
}

export async function deleteUserData(clerkUserId: string) {
  try {
    console.log(`🗑️ Starting complete account deletion for Clerk user: ${clerkUserId}`);

    // Find the user and petOwner
    const user = await prisma.user.findUnique({
      where: { clerkUserId },
      include: { petOwner: true }
    });

    if (!user) {
      throw new Error('User not found');
    }

    if (!user.petOwner) {
      console.log('⚠️ No PetOwner found, only deleting User');
      await prisma.user.delete({
        where: { clerkUserId }
      });
      console.log('✅ Deleted user account');
      return true;
    }

    const petOwnerId = user.petOwner.id;

    // First, get all documents to delete physical files
    const documents = await prisma.document.findMany({
      where: { 
        pet: {
          ownerId: petOwnerId
        }
      },
      select: { filePath: true }
    });

    // Delete physical files from filesystem
    let filesDeleted = 0;
    for (const doc of documents) {
      try {
        await fs.unlink(doc.filePath);
        filesDeleted++;
      } catch (fileError) {
        console.error(`⚠️ Error deleting file ${doc.filePath}:`, fileError);
        // Continue with deletion even if file deletion fails
      }
    }
    if (documents.length > 0) {
      console.log(`✅ Deleted ${filesDeleted}/${documents.length} physical document files`);
    }

    // Delete in a transaction to ensure atomicity
    await prisma.$transaction(async (tx) => {
      // 1. Delete chat messages
      const chatCount = await tx.chatMessage.deleteMany({
        where: { petOwnerId }
      });
      console.log(`✅ Deleted ${chatCount.count} chat messages`);

      // 2. Delete settings
      const settingsCount = await tx.settings.deleteMany({
        where: { petOwnerId }
      });
      console.log(`✅ Deleted ${settingsCount.count} settings`);

      // 3. Delete bug reports
      const bugCount = await tx.bugReport.deleteMany({
        where: { petOwnerId }
      });
      console.log(`✅ Deleted ${bugCount.count} bug reports`);

      // 4. Delete documents (through pet relationship)
      const docCount = await tx.document.deleteMany({
        where: { 
          pet: {
            ownerId: petOwnerId
          }
        }
      });
      console.log(`✅ Deleted ${docCount.count} document records`);

      // 5. Delete pets (this will cascade delete any remaining related data)
      const petCount = await tx.pet.deleteMany({
        where: { ownerId: petOwnerId }
      });
      console.log(`✅ Deleted ${petCount.count} pets`);

      // 6. Delete petOwner
      await tx.petOwner.delete({
        where: { id: petOwnerId }
      });
      console.log('✅ Deleted pet owner record');

      // 7. Delete user
      await tx.user.delete({
        where: { clerkUserId }
      });
      console.log('✅ Deleted user account');
    });

    console.log(`🎉 Complete account deletion successful for Clerk user: ${clerkUserId}`);
    
    return true;
  } catch (error) {
    console.error('❌ Delete user data error:', error);
    throw error;
  }
}
