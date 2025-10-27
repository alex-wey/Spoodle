import { prisma } from '../index.js';

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

    // Delete all user-related data in the correct order
    if (user.petOwner) {
      // 1. Delete bug reports
      await prisma.bugReport.deleteMany({
        where: { petOwnerId: user.petOwner.id }
      });
      console.log('✅ Deleted bug reports');
    }

    // 2. Delete documents (using user.id as ownerId)
    await prisma.document.deleteMany({
      where: { ownerId: user.id }
    });
    console.log('✅ Deleted documents');

    // 3. Delete pets (this will cascade delete related data)
    await prisma.pet.deleteMany({
      where: { ownerId: user.id }
    });
    console.log('✅ Deleted pets');

    // 4. Delete user (will cascade delete petOwner due to onDelete: Cascade)
    await prisma.user.delete({
      where: { clerkUserId }
    });
    console.log('✅ Deleted user account (and PetOwner via cascade)');

    console.log(`🎉 Complete account deletion successful for Clerk user: ${clerkUserId}`);
    
    return true;
  } catch (error) {
    console.error('❌ Delete user data error:', error);
    throw error;
  }
}
