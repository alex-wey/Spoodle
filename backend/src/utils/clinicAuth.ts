import { Request } from 'express';

/**
 * Get the clinic ID from the authenticated user (petOwner or staff)
 */
export function getClinicId(req: Request): string | null {
  return req.petOwner?.clinicId || req.staff?.clinicId || null;
}

/**
 * Check if user has access to a clinic (either as petOwner or staff)
 */
export function hasClinicAccess(req: Request, clinicId: string): boolean {
  const userClinicId = getClinicId(req);
  return userClinicId === clinicId;
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
    // Staff without clinic can't see any pets - return impossible condition
    return { id: { in: [] } };
  }

  // If user is staff, show all pets in their clinic
  if (req.staff && !req.petOwner) {
    return {
      petOwner: {
        clinicId: clinicId
      }
    };
  }

  // If user is petOwner (or both), show their own pets that belong to their clinic
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

  // If user is staff, show all documents for pets in their clinic
  if (req.staff && !req.petOwner) {
    return {
      pet: {
        petOwner: {
          clinicId: clinicId
        }
      }
    };
  }

  // If user is petOwner (or both), show documents for their pets in their clinic
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

  // If user is staff, show all tasks for pets in their clinic
  if (req.staff && !req.petOwner) {
    return {
      pet: {
        petOwner: {
          clinicId: clinicId
        }
      }
    };
  }

  // If user is petOwner (or both), show tasks for their pets in their clinic
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
 * Verify that a pet belongs to the user's clinic
 */
export async function verifyPetClinicAccess(req: Request, petId: string): Promise<boolean> {
  const clinicId = getClinicId(req);
  if (!clinicId) {
    return false;
  }

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

  return pet !== null;
}

