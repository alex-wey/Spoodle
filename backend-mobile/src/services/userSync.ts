import { prisma } from '../index.js';

export interface ClerkUserData {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
}

export async function getUserFromClerkOrCreate(clerkUserData: ClerkUserData) {
  try {
    // Check if user exists in local database
    let user = await prisma.user.findUnique({
      where: { clerkUserId: clerkUserData.userId }
    });

    if (!user) {
      console.log('👤 Creating new user from Clerk:', clerkUserData.email);
      
      // Create user in local database
      user = await prisma.user.create({
        data: {
          clerkUserId: clerkUserData.userId,
          email: clerkUserData.email,
          firstName: clerkUserData.firstName,
          lastName: clerkUserData.lastName,
        }
      });
    } else {
      // Update user data if it has changed
      if (user.email !== clerkUserData.email || 
          user.firstName !== clerkUserData.firstName || 
          user.lastName !== clerkUserData.lastName) {
        
        console.log('👤 Updating user data from Clerk:', clerkUserData.email);
        
        user = await prisma.user.update({
          where: { clerkUserId: clerkUserData.userId },
          data: {
            email: clerkUserData.email,
            firstName: clerkUserData.firstName,
            lastName: clerkUserData.lastName,
          }
        });
      }
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

    // Find the user first
    const user = await prisma.user.findUnique({
      where: { clerkUserId }
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Delete all user-related data in the correct order
    // 1. Delete bug reports
    await prisma.bugReport.deleteMany({
      where: { petOwnerId: user.id }
    });
    console.log('✅ Deleted bug reports');

    // 2. Delete medical records
    await prisma.medical_records.deleteMany({
      where: { ownerId: user.id }
    });
    console.log('✅ Deleted medical records');

    // 3. Delete appointments
    await prisma.appointments.deleteMany({
      where: { 
        pets: {
          ownerId: user.id
        }
      }
    });
    console.log('✅ Deleted appointments');

    // 4. Delete documents
    await prisma.document.deleteMany({
      where: { ownerId: user.id }
    });
    console.log('✅ Deleted documents');

    // 5. Delete tasks
    await prisma.task.deleteMany({
      where: { ownerId: user.id }
    });
    console.log('✅ Deleted tasks');

    // 6. Delete pets (this will cascade delete related data)
    await prisma.pet.deleteMany({
      where: { ownerId: user.id }
    });
    console.log('✅ Deleted pets');

    // 7. Delete pet_owners record if it exists
    await prisma.pet_owners.deleteMany({
      where: { id: user.id }
    });
    console.log('✅ Deleted pet_owners record');

    // 8. Finally, delete the user
    await prisma.user.delete({
      where: { clerkUserId }
    });
    console.log('✅ Deleted user account');

    console.log(`🎉 Complete account deletion successful for Clerk user: ${clerkUserId}`);
    
    return true;
  } catch (error) {
    console.error('❌ Delete user data error:', error);
    throw error;
  }
}
