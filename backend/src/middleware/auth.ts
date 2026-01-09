import { Request, Response, NextFunction } from 'express';
import { createClerkClient, verifyToken } from '@clerk/backend';
import { getOrCreateUser, assignClinicToPetOwner } from '../utils/userSync.js';
import { getOrCreateStaff } from '../utils/staffSync.js';
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

    // Verify Clerk session token and get active organization
    const tokenPayload = await verifyToken(sessionToken, {
      secretKey: process.env.CLERK_SECRET_KEY!
    });
 
    const userId = tokenPayload.sub;
    // Get active organization from token (set by Clerk's OrganizationSwitcher)
    const activeOrgId = (tokenPayload as any).org_id || null;

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

      // Determine user type by checking existing database records first
      // Users are mutually exclusive: either staff OR petOwner, not both
      let petOwner: Awaited<ReturnType<typeof getOrCreateUser>> | undefined = undefined;
      let staff: Awaited<ReturnType<typeof getOrCreateStaff>> | undefined = undefined;
      let clinic = null;
      let userType: 'petOwner' | 'staff' = 'petOwner';

      // Check if user already has a Staff or PetOwner record in the database
      const existingUser = await prisma.user.findUnique({
        where: { clerkUserId: id },
        include: {
          staff: true,
          petOwner: true
        }
      });

      // If user already exists, use their existing record type
      if (existingUser) {
        if (existingUser.staff) {
          staff = existingUser.staff;
          userType = 'staff';
        } else if (existingUser.petOwner) {
          petOwner = existingUser.petOwner;
          userType = 'petOwner';
        }
      }

      // If no existing record, determine user type from request source
      // Web requests = staff, Mobile requests = petOwner
      if (!existingUser || (!staff && !petOwner)) {
        const clientType = req.headers['x-client-type'] as string;
        const detectedUserType = clientType === 'mobile' ? 'petOwner' : 'staff';

        if (detectedUserType === 'staff') {
          // Web signup - create staff record
          staff = await getOrCreateStaff(clerkUserData);
          userType = 'staff';
        } else {
          // Mobile signup - create petOwner record
          petOwner = await getOrCreateUser(clerkUserData);
          userType = 'petOwner';
          
          // If user is in an organization, sync clinic to petOwner
          if (activeOrgId && petOwner && !petOwner.clinicId) {
            const clinicFromOrg = await prisma.clinic.findUnique({
              where: { clerkOrgId: activeOrgId }
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
        }
      } else {
        // User already exists - sync clinic based on user type
        if (petOwner && activeOrgId && !petOwner.clinicId) {
          const clinicFromOrg = await prisma.clinic.findUnique({
            where: { clerkOrgId: activeOrgId }
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
      }

      // For staff users, fetch clinic from active organization if not already set
      if (staff && !clinic && activeOrgId) {
        clinic = await prisma.clinic.findUnique({
          where: { clerkOrgId: activeOrgId },
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
        
        // If clinic not found by activeOrgId, try to find clinic via organization membership
        if (!clinic && activeOrgId) {
          try {
            const { data: memberships } = await clerk.organizations.getOrganizationMembershipList({
              organizationId: activeOrgId,
              userId: [userId],
              limit: 1
            });
            
            if (memberships && memberships.length > 0) {
              // User is a member of this organization, try to find clinic
              clinic = await prisma.clinic.findUnique({
                where: { clerkOrgId: activeOrgId },
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
          } catch (orgError) {
            console.error('Error checking organization membership:', orgError);
          }
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
    } catch (syncError) {
      console.error('User sync error:', syncError);
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
