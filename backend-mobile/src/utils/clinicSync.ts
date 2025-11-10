import { prisma } from '../index.js';
import { createClerkClient } from '@clerk/backend';

const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY! });

/**
 * Get all active clinics available for selection during signup
 */
export async function getAllAvailableClinics() {
  const clinics = await prisma.clinic.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
    select: {
      id: true,
      clerkOrgId: true,
      name: true,
      slug: true,
      address: true,
      phoneNumber: true,
      email: true,
      imageUrl: true,
      _count: {
        select: { petOwners: true }
      }
    }
  });

  return clinics;
}

/**
 * Get clinic by ID with member count
 */
export async function getClinicById(clinicId: string) {
  const clinic = await prisma.clinic.findUnique({
    where: { id: clinicId },
    include: {
      _count: {
        select: { petOwners: true }
      }
    }
  });

  return clinic;
}

/**
 * Add user to Clerk organization after clinic selection
 */
export async function addUserToClerkOrganization(userId: string, organizationId: string) {
  try {
    await clerk.organizations.createOrganizationMembership({
      organizationId,
      userId,
      role: 'org:member'
    });

    console.log(`✅ Added user ${userId} to Clerk organization ${organizationId}`);
    return true;
  } catch (error: any) {
    // If user is already a member, that's fine
    if (error?.clerkError && error.errors?.[0]?.code === 'duplicate_record') {
      console.log(`ℹ️  User ${userId} already member of organization ${organizationId}`);
      return true;
    }

    console.error('Error adding user to Clerk organization:', error);
    throw error;
  }
}

