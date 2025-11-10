import { prisma } from '../index.js';
import { createClerkClient } from '@clerk/backend';

const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY! });

/**
 * Sync Clerk organizations to database as clinics
 * This should be called on server startup to ensure DB is in sync
 */
export async function syncClinicsFromClerk() {
  try {
    console.log('🔄 Syncing clinics from Clerk organizations...');

    // Fetch all organizations from Clerk
    const { data: organizations } = await clerk.organizations.getOrganizationList({
      limit: 100
    });

    if (organizations.length === 0) {
      console.log('⚠️  No organizations found in Clerk');
      return { created: 0, updated: 0 };
    }

    let created = 0;
    let updated = 0;

    for (const org of organizations) {
      try {
        // Check if clinic already exists
        const existingClinic = await prisma.clinic.findUnique({
          where: { clerkOrgId: org.id }
        });

        const clinicData: any = {
          clerkOrgId: org.id,
          name: org.name,
          slug: org.slug,
          isActive: true,
          ...(org.imageUrl && { imageUrl: org.imageUrl }),
          ...(org.publicMetadata && Object.keys(org.publicMetadata).length > 0 && { 
            metadata: org.publicMetadata 
          })
        };

        if (existingClinic) {
          // Update existing clinic
          await prisma.clinic.update({
            where: { id: existingClinic.id },
            data: clinicData
          });
          updated++;
        } else {
          // Create new clinic
          await prisma.clinic.create({
            data: clinicData
          });
          created++;
        }
      } catch (error: any) {
        console.error(`❌ Error syncing clinic ${org.name}:`, error.message);
      }
    }

    console.log(`✅ Clinic sync complete: ${created} created, ${updated} updated`);
    return { created, updated };

  } catch (error) {
    console.error('❌ Error syncing clinics from Clerk:', error);
    // Don't throw - we don't want to prevent server startup if sync fails
    return { created: 0, updated: 0 };
  }
}

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

