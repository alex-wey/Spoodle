import { Request, Response, NextFunction } from 'express';
import { createClerkClient, verifyToken } from '@clerk/backend';
import { getOrCreateUser, assignClinicToPetOwner } from '../utils/userSync.js';
import { getOrCreateStaff, assignClinicToStaff } from '../utils/staffSync.js';
import { prisma } from '../index.js';

// Initialize Clerk client once
const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY! });

// Extend Express Request type to include Clerk auth
declare global {
  namespace Express {
    interface Request {
      auth: {
        userId: string;
        sessionToken: string;
      };
      // Backward-compat: historically used in routes for ownership checks
      user?: {
        id: string;
        clerkUserId: string;
        createdAt: Date;
        updatedAt: Date;
      } | undefined;
      // Explicit DB owner used for authorization/ownership checks (pet owners)
      petOwner?: {
        id: string;
        clerkUserId: string;
        clinicId: string | null;
        createdAt: Date;
        updatedAt: Date;
      } | undefined;
      // Staff member record (clinic staff)
      staff?: {
        id: string;
        clerkUserId: string;
        clinicId: string | null;
        createdAt: Date;
        updatedAt: Date;
      } | undefined;
      // User's clinic information (from either petOwner or staff)
      clinic?: {
        id: string;
        clerkOrgId: string;
        name: string;
        slug: string;
        address?: string | null;
        phoneNumber?: string | null;
        email?: string | null;
        imageUrl?: string | null;
      } | null;
      // User type: 'petOwner' | 'staff' (mutually exclusive)
      userType?: 'petOwner' | 'staff';
      // Minimal profile snapshot from Clerk used for email/display
      userProfile?: {
        // With exactOptionalPropertyTypes enabled, allow possibly-undefined
        email?: string | undefined;
        firstName?: string | undefined;
        lastName?: string | undefined;
        phone?: string | null | undefined;
      };
    }
  }
}

export const authenticateClerk = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers['authorization'];
    const sessionToken = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!sessionToken) {
      return res.status(401).json({
        success: false,
        error: 'Session token required',
        message: 'Please provide a Clerk session token'
      });
    }

    // Verify Clerk session token
    const { sub: userId } = await verifyToken(sessionToken, {
      secretKey: process.env.CLERK_SECRET_KEY!
    });
 
    // Get the user ID from the token
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token',
        message: 'User ID not found in token'
      });
    }

    req.auth = {
      userId: userId,
      sessionToken: sessionToken
    };

    // Fetch full user data from Clerk
    const { id, firstName, lastName, primaryEmailAddress, primaryPhoneNumber } = await clerk.users.getUser(userId);

    // Get user's organization memberships to determine if they're staff or pet owner
    let organizationId: string | null = null;
    let isStaff = false;
    let userRole: string | null = null;

    try {
      // Get all organizations
      const { data: organizations } = await clerk.organizations.getOrganizationList({
        limit: 100
      });

      // Check user's membership in each organization
      for (const org of organizations) {
        try {
          const { data: memberships } = await clerk.organizations.getOrganizationMembershipList({
            organizationId: org.id,
            userId: [userId],
            limit: 1
          });
          
          if (memberships && memberships.length > 0 && memberships[0]) {
            organizationId = org.id;
            userRole = memberships[0].role || null;
            // Check if user has staff role (org:admin, org:member with staff metadata, etc.)
            // For now, we'll consider any org member as potential staff
            // You can refine this based on your Clerk role setup
            isStaff = userRole?.includes('admin') || userRole?.includes('staff') || false;
            break;
          }
        } catch (error) {
          // Continue to next organization
          continue;
        }
      }
    } catch (orgError) {
      console.warn('Could not fetch organization memberships:', orgError);
      // Continue - user might not be in any org yet
    }

    // Sync user to database
    try {
      // Validate required fields before creating user
      const email = primaryEmailAddress?.emailAddress;
      if (!email) {
        console.error('❌ User sync failed: Email is required but not found in Clerk profile', { userId: id });
        throw new Error('User email is required but not found in Clerk profile');
      }

      // Provide defaults for firstName/lastName if not set (some sign-up flows may not require them initially)
      const firstNameValue = firstName || 'User';
      const lastNameValue = lastName || '';

      const clerkUserData = {
        clerkUserId: id,
        email: email,
        firstName: firstNameValue,
        lastName: lastNameValue,
        phone: primaryPhoneNumber?.phoneNumber ?? null,
      };

      // Determine user type and create/get appropriate records
      // Users are mutually exclusive: either staff OR petOwner, not both
      let petOwner: Awaited<ReturnType<typeof getOrCreateUser>> | undefined = undefined;
      let staff: Awaited<ReturnType<typeof getOrCreateStaff>> | undefined = undefined;
      let clinic = null;
      let userType: 'petOwner' | 'staff' = 'petOwner';

      console.log(`🔄 Syncing user ${id} to database:`, {
        email: clerkUserData.email,
        firstName: clerkUserData.firstName,
        lastName: clerkUserData.lastName,
        organizationId,
        isStaff,
        userRole
      });

      // If user is in an organization and is staff, create staff record
      if (organizationId && isStaff) {
        console.log(`👨‍⚕️ User ${id} is staff member in organization ${organizationId}`);
        // Get or create Staff record
        staff = await getOrCreateStaff(clerkUserData);
        console.log(`✅ Staff record created/found: ${staff.id}`);
        
        // Sync clinic from organization
        const clinicFromOrg = await prisma.clinic.findUnique({
          where: { clerkOrgId: organizationId }
        });

        if (clinicFromOrg && !staff.clinicId) {
          // Assign clinic to staff if not already assigned
          staff = await assignClinicToStaff(staff.id, clinicFromOrg.id);
        }

        if (staff.clinicId) {
          clinic = await prisma.clinic.findUnique({
            where: { id: staff.clinicId },
            select: {
              id: true,
              clerkOrgId: true,
              name: true,
              slug: true,
              address: true,
              phoneNumber: true,
              email: true,
              imageUrl: true
            }
          });
        }

        userType = 'staff';
      } else {
        // User is NOT staff, so they're a pet owner
        // Only create PetOwner if user is not staff
        console.log(`🐾 User ${id} is a pet owner (not staff)`);
        try {
          petOwner = await getOrCreateUser(clerkUserData);
          console.log(`✅ PetOwner record created/found: ${petOwner.id}`);
          
          // If user is in an organization but not staff, sync clinic to petOwner
          if (organizationId && !isStaff && petOwner && !petOwner.clinicId) {
            const clinicFromOrg = await prisma.clinic.findUnique({
              where: { clerkOrgId: organizationId }
            });

            if (clinicFromOrg) {
              petOwner = await assignClinicToPetOwner(petOwner.id, clinicFromOrg.id);
            }
          }

          // Fetch clinic information if petOwner has one
          if (petOwner?.clinicId && !clinic) {
            clinic = await prisma.clinic.findUnique({
              where: { id: petOwner.clinicId },
              select: {
                id: true,
                clerkOrgId: true,
                name: true,
                slug: true,
                address: true,
                phoneNumber: true,
                email: true,
                imageUrl: true
              }
            });
          }

          userType = 'petOwner';
        } catch (petOwnerError) {
          console.error('❌ Could not create/get PetOwner:', petOwnerError);
          console.error('PetOwner error details:', JSON.stringify(petOwnerError, null, 2));
          // Re-throw to surface the error instead of silently continuing
          throw petOwnerError;
        }
      }

      // Attach objects to request
      // Backward-compat: keep req.user pointing to petOwner if exists, otherwise staff
      req.user = petOwner || staff;
      req.petOwner = petOwner;
      req.staff = staff;
      req.clinic = clinic;
      req.userType = userType;

      // Build userProfile without forcing undefined values
      const userProfile: {
        email?: string | undefined;
        firstName?: string | undefined;
        lastName?: string | undefined;
        phone?: string | null | undefined;
      } = {};

      if (primaryEmailAddress?.emailAddress) {
        userProfile.email = primaryEmailAddress.emailAddress;
      }
      if (typeof firstName === 'string' && firstName.length > 0) {
        userProfile.firstName = firstName;
      }
      if (typeof lastName === 'string' && lastName.length > 0) {
        userProfile.lastName = lastName;
      }
      if (primaryPhoneNumber?.phoneNumber !== undefined) {
        userProfile.phone = primaryPhoneNumber.phoneNumber ?? null;
      }

      req.userProfile = userProfile;
      
      console.log(`✅ User sync completed for ${id}:`, {
        userType,
        hasPetOwner: !!petOwner,
        hasStaff: !!staff,
        hasClinic: !!clinic
      });
    } catch (syncError) {
      console.error('❌ User sync error:', syncError);
      console.error('User sync error details:', JSON.stringify(syncError, null, 2));
      console.error('User sync error stack:', syncError instanceof Error ? syncError.stack : 'No stack trace');
      // If sync fails, we still have valid auth but no petOwner/staff
      // This will cause routes that require petOwner/staff to fail with 401
      // This is intentional - user needs to complete setup first or fix their Clerk profile
    }

    return next();
  } catch (error) {
    console.error('Clerk authentication error:', error);
    return res.status(401).json({
      success: false,
      error: 'Invalid session token',
      message: 'Clerk session token is invalid or expired'
    });
  }
};
