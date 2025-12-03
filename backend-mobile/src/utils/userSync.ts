import { prisma } from '../index.js';
import * as fs from 'fs/promises';

export interface ClerkUserData {
  clerkUserId: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string;
}

/**
 * Get or create a user and their PetOwner record.
 * This function is idempotent and works consistently across all environments.
 * It handles race conditions and ensures both User and PetOwner exist.
 */
export async function getOrCreateUser(clerkUserData: ClerkUserData) {
  // Use a transaction to ensure atomicity and handle race conditions
  return await prisma.$transaction(async (tx) => {
    // Try to find existing user by clerkUserId (primary lookup)
    let user = await tx.user.findUnique({
      where: { clerkUserId: clerkUserData.clerkUserId },
      include: { petOwner: true }
    });

    // If user exists and has PetOwner, return it
    if (user?.petOwner) {
      return user.petOwner;
    }

    // If user exists but no PetOwner, create PetOwner
    if (user) {
      const petOwner = await tx.petOwner.create({
        data: { clerkUserId: clerkUserData.clerkUserId }
      });
      return petOwner;
    }

    // User doesn't exist, try to create both User and PetOwner
    try {
      await tx.user.create({ data: clerkUserData });
      const petOwner = await tx.petOwner.create({
        data: { clerkUserId: clerkUserData.clerkUserId }
      });
      return petOwner;
    } catch (error: any) {
      // If creation fails due to unique constraint (race condition),
      // find the existing user that was created by another request
      if (error.code === 'P2002') {
        // Try finding by clerkUserId first
        const existingUser = await tx.user.findUnique({
          where: { clerkUserId: clerkUserData.clerkUserId },
          include: { petOwner: true }
        });

        if (existingUser?.petOwner) {
          return existingUser.petOwner;
        }

        if (existingUser && !existingUser.petOwner) {
          // User exists but no PetOwner - create it
          const petOwner = await tx.petOwner.create({
            data: { clerkUserId: clerkUserData.clerkUserId }
          });
          return petOwner;
        }

        // If not found by clerkUserId, try by email (in case email was the conflict)
        // Only try email lookup if email is provided
        if (clerkUserData.email) {
          const userByEmail = await tx.user.findUnique({
            where: { email: clerkUserData.email },
            include: { petOwner: true }
          });

          if (userByEmail?.petOwner) {
            return userByEmail.petOwner;
          }

          if (userByEmail && !userByEmail.petOwner) {
            // User exists by email but no PetOwner - create it
            const petOwner = await tx.petOwner.create({
              data: { clerkUserId: userByEmail.clerkUserId }
            });
            return petOwner;
          }
        }

        // If we get here, something unexpected happened
        throw new Error(`Failed to create or find user: ${error.message}`);
      }

      // Re-throw non-constraint errors
      throw error;
    }
  });
}

/**
 * Assign a clinic to a pet owner
 * Used during signup clinic selection
 */
export async function assignClinicToPetOwner(petOwnerId: string, clinicId: string) {
  try {
    const petOwner = await prisma.petOwner.update({
      where: { id: petOwnerId },
      data: { clinicId },
      include: {
        clinic: true,
        user: {
          select: {
            id: true,
            clerkUserId: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    console.log(`✅ Assigned clinic ${clinicId} to pet owner ${petOwnerId}`);
    return petOwner;
  } catch (error) {
    console.error('Error assigning clinic to pet owner:', error);
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
