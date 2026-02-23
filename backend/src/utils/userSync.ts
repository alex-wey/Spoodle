import { prisma } from '../index.js';
import * as fs from 'fs/promises';

export interface ClerkUserData {
  clerkUserId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  imageUrl?: string | null;
}

/**
 * Find a placeholder User (created by staff via PetOwner flow) that matches the new user's email.
 * Returns the matching User with their PetOwner if found, null otherwise.
 */
async function findPlaceholderUser(tx: any, email: string, phone: string | null) {
  // Match by email (most reliable) - find User without clerkUserId
  if (email) {
    const byEmail = await tx.user.findFirst({
      where: {
        clerkUserId: null, // Only match placeholder users (not yet linked to Clerk)
        email: email
      },
      include: { petOwner: true }
    });
    if (byEmail) {
      console.log(`🔗 Found placeholder user by email: ${email}`);
      return byEmail;
    }
  }

  // Fallback: match by phone
  if (phone) {
    const byPhone = await tx.user.findFirst({
      where: {
        clerkUserId: null,
        phone: phone
      },
      include: { petOwner: true }
    });
    if (byPhone) {
      console.log(`🔗 Found placeholder user by phone: ${phone}`);
      return byPhone;
    }
  }

  return null;
}

/**
 * Get or create a user and their PetOwner record.
 * This function is idempotent and works consistently across all environments.
 * It handles race conditions and ensures both User and PetOwner exist.
 * 
 * IMPORTANT: If a placeholder User exists (created by staff) that matches
 * the user's email or phone, we link that existing User to Clerk instead of creating new.
 */
export async function getOrCreateUser(clerkUserData: ClerkUserData) {
  return await prisma.$transaction(async (tx) => {
    // 1. Check if user already exists by clerkUserId
    let user = await tx.user.findUnique({
      where: { clerkUserId: clerkUserData.clerkUserId },
      include: { petOwner: true }
    });

    if (user?.petOwner) {
      // Update imageUrl if it changed
      if (clerkUserData.imageUrl && user.imageUrl !== clerkUserData.imageUrl) {
        await tx.user.update({
          where: { id: user.id },
          data: { imageUrl: clerkUserData.imageUrl }
        });
      }
      return user.petOwner;
    }

    // 2. Check for a placeholder User that matches this user's email/phone
    const placeholderUser = await findPlaceholderUser(tx, clerkUserData.email, clerkUserData.phone);

    if (placeholderUser) {
      // Link the placeholder user to Clerk by setting clerkUserId and updating profile
      await tx.user.update({
        where: { id: placeholderUser.id },
        data: {
          clerkUserId: clerkUserData.clerkUserId,
          firstName: clerkUserData.firstName,
          lastName: clerkUserData.lastName,
          imageUrl: clerkUserData.imageUrl ?? null,
          phone: clerkUserData.phone || placeholderUser.phone
        }
      });

      console.log(`🔗 Linked placeholder user ${placeholderUser.id} to Clerk user ${clerkUserData.clerkUserId}`);
      console.log(`   User ${placeholderUser.email} is now linked to Clerk`);

      // If they already have a PetOwner, return it
      if (placeholderUser.petOwner) {
        return placeholderUser.petOwner;
      }

      // Otherwise create a PetOwner for them
      const petOwner = await tx.petOwner.create({
        data: { userId: placeholderUser.id }
      });
      console.log(`✅ Created PetOwner for linked user ${placeholderUser.email}`);
      return petOwner;
    }

    // 3. No placeholder found - create new User and PetOwner
    if (user) {
      // User exists (by clerkUserId) but no PetOwner
      const petOwner = await tx.petOwner.create({
        data: { userId: user.id }
      });
      return petOwner;
    }

    // Create both User and PetOwner
    try {
      const newUser = await tx.user.create({ data: clerkUserData });
      const petOwner = await tx.petOwner.create({
        data: { userId: newUser.id }
      });
      console.log(`✅ Created new User and PetOwner for ${clerkUserData.email}`);
      return petOwner;
    } catch (error: any) {
      // Handle race condition - another request may have created the user
      if (error.code === 'P2002') {
        const existingUser = await tx.user.findUnique({
          where: { clerkUserId: clerkUserData.clerkUserId },
          include: { petOwner: true }
        });

        if (existingUser?.petOwner) {
          return existingUser.petOwner;
        }

        if (existingUser && !existingUser.petOwner) {
          const petOwner = await tx.petOwner.create({
            data: { userId: existingUser.id }
          });
          return petOwner;
        }

        // Try by email
        const userByEmail = await tx.user.findUnique({
          where: { email: clerkUserData.email },
          include: { petOwner: true }
        });

        if (userByEmail?.petOwner) {
          return userByEmail.petOwner;
        }

        if (userByEmail && !userByEmail.petOwner) {
          const petOwner = await tx.petOwner.create({
            data: { userId: userByEmail.id }
          });
          return petOwner;
        }

        throw new Error(`Failed to create or find user: ${error.message}`);
      }

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
