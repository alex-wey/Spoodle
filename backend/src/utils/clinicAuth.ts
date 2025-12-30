import { Request, Response, NextFunction } from 'express';
import { prisma } from '../index.js';
import { createClerkClient } from '@clerk/backend';

/**
 * Get the clinic ID from the authenticated user (petOwner or staff)
 * Priority:
 * 1. clinicId from query params or body (for staff to specify which clinic)
 * 2. petOwner.clinicId (for pet owners)
 */
export function getClinicId(req: Request): string | null {
  // Check if clinicId is explicitly passed (query param or body)
  const passedClinicId = (req.query?.clinicId as string) || (req.body?.clinicId as string);
  if (passedClinicId) {
    return passedClinicId;
  }
  
  // For pet owners, use the stored clinicId
  if (req.petOwner?.clinicId) {
    return req.petOwner.clinicId;
  }
  
  return null;
}

/**
 * Verify that a staff member has access to a clinic (via organization membership)
 * Returns the clinic if access is granted, null otherwise
 */
export async function verifyStaffClinicAccess(req: Request, clinicId: string) {
  if (!req.staff || !req.auth) {
    return null;
  }

  // Get clinic to find its organization
  const clinic = await prisma.clinic.findUnique({
    where: { id: clinicId },
    select: {
      id: true,
      clerkOrgId: true,
      name: true,
      slug: true,
      address: true,
      phoneNumber: true,
      email: true,
      imageUrl: true,
      isActive: true
    }
  });

  if (!clinic || !clinic.isActive) {
    return null;
  }

  // Verify staff is a member of the clinic's organization
  try {
    const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY! });
    const { data: memberships } = await clerk.organizations.getOrganizationMembershipList({
      organizationId: clinic.clerkOrgId,
      userId: [req.auth.userId],
      limit: 1
    });

    if (!memberships || memberships.length === 0) {
      return null;
    }

    return clinic;
  } catch (error) {
    console.error('Error verifying staff clinic access:', error);
    return null;
  }
}


/**
 * Get clinic-scoped where clause for Pet queries
 * Ensures pets belong to the user's clinic
 */
export function getClinicScopedPetWhere(req: Request) {
  const clinicId = getClinicId(req);
  
  if (!clinicId) {
    // If no clinic, only show pets owned by the user (petOwner only)
    if (req.petOwner) {
      return { ownerId: req.petOwner.id };
    }
<<<<<<< Updated upstream
    // Staff without clinic can't see any pets - return impossible condition
    return { id: { in: [] } };
  }

  // If user is staff, show all pets in their clinic
  if (req.staff && !req.petOwner) {
=======
    // Staff without clinic can't see any pets
    return { id: { in: [] } };
  }

  // If user is staff, show all pets in the specified clinic
  if (req.staff) {
>>>>>>> Stashed changes
    return {
      petOwner: {
        clinicId: clinicId
      }
    };
  }

<<<<<<< Updated upstream
  // If user is petOwner (or both), show their own pets that belong to their clinic
=======
  // If user is petOwner, show their own pets that belong to their clinic
>>>>>>> Stashed changes
  if (req.petOwner) {
    return {
      ownerId: req.petOwner.id,
      petOwner: {
        clinicId: clinicId
      }
    };
  }

  return { id: { in: [] } };
}

/**
 * Get clinic-scoped where clause for Document queries
 * Ensures documents belong to pets in the user's clinic
 */
export function getClinicScopedDocumentWhere(req: Request) {
  const clinicId = getClinicId(req);
  
  if (!clinicId) {
    // If no clinic, only show documents for pets owned by the user
    if (req.petOwner) {
      return {
        pet: {
          ownerId: req.petOwner.id
        }
      };
    }
    return { id: { in: [] } };
  }

<<<<<<< Updated upstream
  // If user is staff, show all documents for pets in their clinic
  if (req.staff && !req.petOwner) {
=======
  // If user is staff, show all documents for pets in the specified clinic
  if (req.staff) {
>>>>>>> Stashed changes
    return {
      pet: {
        petOwner: {
          clinicId: clinicId
        }
      }
    };
  }

<<<<<<< Updated upstream
  // If user is petOwner (or both), show documents for their pets in their clinic
=======
  // If user is petOwner, show documents for their pets in their clinic
>>>>>>> Stashed changes
  if (req.petOwner) {
    return {
      pet: {
        ownerId: req.petOwner.id,
        petOwner: {
          clinicId: clinicId
        }
      }
    };
  }

  return { id: { in: [] } };
}

/**
 * Get clinic-scoped where clause for Task queries
 * Ensures tasks belong to pets in the user's clinic
 */
export function getClinicScopedTaskWhere(req: Request) {
  const clinicId = getClinicId(req);
  
  if (!clinicId) {
    // If no clinic, only show tasks for pets owned by the user
    if (req.petOwner) {
      return {
        pet: {
          ownerId: req.petOwner.id
        }
      };
    }
    return { id: { in: [] } };
  }

<<<<<<< Updated upstream
  // If user is staff, show all tasks for pets in their clinic
  if (req.staff && !req.petOwner) {
=======
  // If user is staff, show all tasks for pets in the specified clinic
  if (req.staff) {
>>>>>>> Stashed changes
    return {
      pet: {
        petOwner: {
          clinicId: clinicId
        }
      }
    };
  }

<<<<<<< Updated upstream
  // If user is petOwner (or both), show tasks for their pets in their clinic
=======
  // If user is petOwner, show tasks for their pets in their clinic
>>>>>>> Stashed changes
  if (req.petOwner) {
    return {
      pet: {
        ownerId: req.petOwner.id,
        petOwner: {
          clinicId: clinicId
        }
      }
    };
  }

  return { id: { in: [] } };
}

/**
<<<<<<< Updated upstream
=======
 * Middleware to verify and set clinic for staff requests
 * Requires clinicId to be passed as query param or in body
 * Sets req.clinic if staff has access to the clinic
 */
export async function requireStaffClinic(req: Request, res: Response, next: NextFunction): Promise<void> {
  if (!req.staff) {
    res.status(401).json({
      success: false,
      error: 'Staff access required',
      message: 'This endpoint requires staff authentication'
    });
    return;
  }

  const clinicId = getClinicId(req);
  if (!clinicId) {
    res.status(400).json({
      success: false,
      error: 'Clinic ID required',
      message: 'Please provide a clinicId as a query parameter or in the request body'
    });
    return;
  }

  const clinic = await verifyStaffClinicAccess(req, clinicId);
  if (!clinic) {
    res.status(403).json({
      success: false,
      error: 'Access denied',
      message: 'You do not have access to this clinic'
    });
    return;
  }

  // Set clinic on request for use in route handlers
  req.clinic = clinic;
  next();
}

/**
>>>>>>> Stashed changes
 * Verify that a pet belongs to the user's clinic
 */
export async function verifyPetClinicAccess(req: Request, petId: string): Promise<boolean> {
  const clinicId = getClinicId(req);
  if (!clinicId) {
    return false;
  }

<<<<<<< Updated upstream
  const { prisma } = await import('../index.js');
  
  const pet = await prisma.pet.findFirst({
    where: {
      id: petId,
      petOwner: {
        clinicId: clinicId
      },
      // If user is petOwner, also verify ownership
      ...(req.petOwner ? { ownerId: req.petOwner.id } : {})
    }
  });

=======
  const where: any = {
    id: petId,
    petOwner: {
      clinicId: clinicId
    }
  };

  // If user is petOwner, also verify ownership
  if (req.petOwner) {
    where.ownerId = req.petOwner.id;
  }

  const pet = await prisma.pet.findFirst({ where });
>>>>>>> Stashed changes
  return pet !== null;
}

