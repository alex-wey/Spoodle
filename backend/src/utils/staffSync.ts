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
  // Use a transaction to ensure atomicity and handle race conditions
  return await prisma.$transaction(async (tx) => {
    // Try to find existing user by clerkUserId (primary lookup)
    let user = await tx.user.findUnique({
      where: { clerkUserId: clerkUserData.clerkUserId },
      include: { staff: true }
    });

    // If user exists and has Staff, return it
    if (user?.staff) {
      return user.staff;
    }

    // If user exists but no Staff, create Staff
    if (user) {
      const staff = await tx.staff.create({
        data: { clerkUserId: clerkUserData.clerkUserId }
      });
      return staff;
    }

    // User doesn't exist, try to create both User and Staff
    try {
      await tx.user.create({ data: clerkUserData });
      const staff = await tx.staff.create({
        data: { clerkUserId: clerkUserData.clerkUserId }
      });
      return staff;
    } catch (error: any) {
      // If creation fails due to unique constraint (race condition),
      // find the existing user that was created by another request
      if (error.code === 'P2002') {
        // Try finding by clerkUserId first
        const existingUser = await tx.user.findUnique({
          where: { clerkUserId: clerkUserData.clerkUserId },
          include: { staff: true }
        });

        if (existingUser?.staff) {
          return existingUser.staff;
        }

        if (existingUser && !existingUser.staff) {
          // User exists but no Staff - create it
          const staff = await tx.staff.create({
            data: { clerkUserId: clerkUserData.clerkUserId }
          });
          return staff;
        }

        // If not found by clerkUserId, try by email (in case email was the conflict)
        const userByEmail = await tx.user.findUnique({
          where: { email: clerkUserData.email },
          include: { staff: true }
        });

        if (userByEmail?.staff) {
          return userByEmail.staff;
        }

        if (userByEmail && !userByEmail.staff) {
          // User exists by email but no Staff - create it
          const staff = await tx.staff.create({
            data: { clerkUserId: userByEmail.clerkUserId }
          });
          return staff;
        }

        // If we get here, something unexpected happened
        throw new Error(`Failed to create or find staff: ${error.message}`);
      }

      // Re-throw non-constraint errors
      throw error;
    }
  });
}

/**
 * Assign a clinic to a staff member
 * Used when staff joins a clinic organization
 */
export async function assignClinicToStaff(staffId: string, clinicId: string) {
  try {
    const staff = await prisma.staff.update({
      where: { id: staffId },
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

    console.log(`✅ Assigned clinic ${clinicId} to staff ${staffId}`);
    return staff;
  } catch (error) {
    console.error('Error assigning clinic to staff:', error);
    throw error;
  }
}

/**
 * Get staff by Clerk user ID
 */
export async function getStaffByClerkUserId(clerkUserId: string) {
  return await prisma.staff.findUnique({
    where: { clerkUserId },
    include: {
      clinic: true,
      user: true
    }
  });
}

