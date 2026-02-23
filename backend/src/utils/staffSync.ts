import { prisma } from '../index.js';

export interface ClerkUserData {
  clerkUserId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
}

/**
 * Get or create a User and their Staff record.
 * This function is idempotent and works consistently across all environments.
 * It handles race conditions and ensures both User and Staff exist.
 */
export async function getOrCreateStaff(clerkUserData: ClerkUserData) {
  // First, try to find existing user (outside transaction for read)
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { clerkUserId: clerkUserData.clerkUserId },
        { email: clerkUserData.email }
      ]
    },
    include: { staff: true }
  });

  // If user exists with staff, return it
  if (existingUser?.staff) {
    // If found by email but clerkUserId doesn't match, update it
    if (existingUser.clerkUserId !== clerkUserData.clerkUserId) {
      await prisma.user.update({
        where: { id: existingUser.id },
        data: { clerkUserId: clerkUserData.clerkUserId }
      });
    }
    return existingUser.staff;
  }

  // If user exists but no staff, create staff
  if (existingUser && !existingUser.staff) {
    // Update clerkUserId if needed
    if (existingUser.clerkUserId !== clerkUserData.clerkUserId) {
      await prisma.user.update({
        where: { id: existingUser.id },
        data: { clerkUserId: clerkUserData.clerkUserId }
      });
    }
    const staff = await prisma.staff.create({
      data: { userId: existingUser.id }
    });
    return staff;
  }

  // User doesn't exist, try to create both User and Staff
  try {
    return await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({ data: clerkUserData });
      const staff = await tx.staff.create({
        data: { userId: newUser.id }
      });
      return staff;
    });
  } catch (error: any) {
    // If creation fails due to unique constraint (race condition),
    // retry the lookup - another request created the user
    if (error.code === 'P2002') {
      const user = await prisma.user.findFirst({
        where: {
          OR: [
            { clerkUserId: clerkUserData.clerkUserId },
            { email: clerkUserData.email }
          ]
        },
        include: { staff: true }
      });

      if (user?.staff) {
        return user.staff;
      }

      if (user && !user.staff) {
        const staff = await prisma.staff.create({
          data: { userId: user.id }
        });
        return staff;
      }

      throw new Error(`Failed to create or find staff after constraint violation: ${error.message}`);
    }

    throw error;
  }
}

/**
 * Get staff by User ID
 */
export async function getStaffByUserId(userId: string) {
  return await prisma.staff.findUnique({
    where: { userId },
    include: {
      user: true
    }
  });
}
