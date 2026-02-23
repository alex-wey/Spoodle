import { Router, Request, Response } from 'express';
import { prisma } from '../index.js';
import { authenticateClerk } from '../middleware/auth.js';
import { getClinicId, verifyStaffClinicAccess } from '../utils/clinicAuth.js';

const router = Router();

// Apply authentication to all pet-owner routes
router.use(authenticateClerk);

// Get all pet owners for the clinic (staff only)
router.get('/', async (req: Request, res: Response) => {
  try {
    if (!req.staff) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        message: 'Only staff members can view pet owners'
      });
    }

    const clinicId = getClinicId(req);
    if (!clinicId) {
      return res.status(400).json({
        success: false,
        error: 'Clinic ID required',
        message: 'Please provide a clinicId as a query parameter'
      });
    }

    // Verify staff has access to this clinic
    const clinic = await verifyStaffClinicAccess(req, clinicId);
    if (!clinic) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        message: 'You do not have access to this clinic'
      });
    }

    const petOwners = await prisma.petOwner.findMany({
      where: {
        clinicId: clinicId
      },
      include: {
        user: {
          select: {
            id: true,
            clerkUserId: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            address: true,
            imageUrl: true
          }
        },
        _count: {
          select: {
            pets: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Transform to a consistent format
    const transformedOwners = petOwners.map(owner => ({
      id: owner.id,
      userId: owner.userId,
      clinicId: owner.clinicId,
      createdAt: owner.createdAt,
      updatedAt: owner.updatedAt,
      firstName: owner.user.firstName,
      lastName: owner.user.lastName,
      email: owner.user.email,
      phone: owner.user.phone,
      address: owner.user.address,
      imageUrl: owner.user.imageUrl,
      name: `${owner.user.firstName} ${owner.user.lastName}`.trim(),
      petCount: owner._count.pets,
      hasClerkAccount: !!owner.user.clerkUserId
    }));

    return res.json({
      success: true,
      data: transformedOwners,
      message: 'Pet owners retrieved successfully'
    });
  } catch (error) {
    console.error('Get pet owners error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error',
      message: 'Unable to retrieve pet owners'
    });
  }
});

// Create a new pet owner (staff only)
// Creates a User first, then a PetOwner linked to that User
router.post('/', async (req: Request, res: Response) => {
  try {
    if (!req.staff) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        message: 'Only staff members can create pet owners'
      });
    }

    const clinicId = getClinicId(req);
    if (!clinicId) {
      return res.status(400).json({
        success: false,
        error: 'Clinic ID required',
        message: 'Please provide a clinicId'
      });
    }

    // Verify staff has access to this clinic
    const clinic = await verifyStaffClinicAccess(req, clinicId);
    if (!clinic) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        message: 'You do not have access to this clinic'
      });
    }

    const { firstName, lastName, email, phone, address } = req.body;

    // Validate required fields
    if (!firstName || !lastName) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        message: 'First name and last name are required'
      });
    }

    // Check if a user with this email already exists
    if (email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: email },
        include: { petOwner: true }
      });

      if (existingUser) {
        // If user exists and already has a petOwner in this clinic, error
        if (existingUser.petOwner?.clinicId === clinicId) {
          return res.status(409).json({
            success: false,
            error: 'Owner already exists',
            message: 'A pet owner with this email already exists in your clinic'
          });
        }
        // If user exists but no petOwner, we can create one for them
        if (!existingUser.petOwner) {
          const newOwner = await prisma.petOwner.create({
            data: {
              userId: existingUser.id,
              clinicId: clinicId
            },
            include: {
              user: {
                select: {
                  id: true,
                  clerkUserId: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  phone: true,
                  address: true,
                  imageUrl: true
                }
              }
            }
          });

          console.log('✅ Pet owner created for existing user:', newOwner.id);

          const transformedOwner = {
            id: newOwner.id,
            userId: newOwner.userId,
            clinicId: newOwner.clinicId,
            createdAt: newOwner.createdAt,
            updatedAt: newOwner.updatedAt,
            firstName: newOwner.user.firstName,
            lastName: newOwner.user.lastName,
            email: newOwner.user.email,
            phone: newOwner.user.phone,
            address: newOwner.user.address,
            imageUrl: newOwner.user.imageUrl,
            name: `${newOwner.user.firstName} ${newOwner.user.lastName}`.trim(),
            petCount: 0,
            hasClerkAccount: !!newOwner.user.clerkUserId
          };

          return res.status(201).json({
            success: true,
            data: transformedOwner,
            message: 'Pet owner created successfully'
          });
        }
      }
    }

    // Create User and PetOwner in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the User first
      const newUser = await tx.user.create({
        data: {
          firstName: firstName,
          lastName: lastName,
          email: email || null,
          phone: phone || null,
          address: address || null
          // clerkUserId is null - will be set when owner signs up via Clerk
        }
      });

      // Create the PetOwner linked to the User
      const newOwner = await tx.petOwner.create({
        data: {
          userId: newUser.id,
          clinicId: clinicId
        },
        include: {
          user: {
            select: {
              id: true,
              clerkUserId: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              address: true,
              imageUrl: true
            }
          }
        }
      });

      return newOwner;
    });

    console.log('✅ User and Pet owner created successfully:', result.id);

    const transformedOwner = {
      id: result.id,
      userId: result.userId,
      clinicId: result.clinicId,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
      firstName: result.user.firstName,
      lastName: result.user.lastName,
      email: result.user.email,
      phone: result.user.phone,
      address: result.user.address,
      imageUrl: result.user.imageUrl,
      name: `${result.user.firstName} ${result.user.lastName}`.trim(),
      petCount: 0,
      hasClerkAccount: false
    };

    return res.status(201).json({
      success: true,
      data: transformedOwner,
      message: 'Pet owner created successfully'
    });
  } catch (error) {
    console.error('❌ CREATE PET OWNER ERROR:');
    console.error('Error name:', (error as any).name);
    console.error('Error message:', (error as any).message);
    console.error('Full error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error',
      message: 'Unable to create pet owner'
    });
  }
});

// Get a specific pet owner by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    if (!req.staff) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        message: 'Only staff members can view pet owner details'
      });
    }

    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Missing ID',
        message: 'Pet owner ID is required'
      });
    }

    const clinicId = getClinicId(req);
    if (!clinicId) {
      return res.status(400).json({
        success: false,
        error: 'Clinic ID required',
        message: 'Please provide a clinicId as a query parameter'
      });
    }

    // Verify staff has access to this clinic
    const clinic = await verifyStaffClinicAccess(req, clinicId);
    if (!clinic) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        message: 'You do not have access to this clinic'
      });
    }

    const owner = await prisma.petOwner.findUnique({
      where: { id: id as string },
      include: {
        user: {
          select: {
            id: true,
            clerkUserId: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            address: true,
            imageUrl: true
          }
        },
        pets: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!owner) {
      return res.status(404).json({
        success: false,
        error: 'Not found',
        message: 'Pet owner not found'
      });
    }

    // Verify owner belongs to the requested clinic
    if (owner.clinicId !== clinicId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        message: 'This pet owner does not belong to your clinic'
      });
    }

    const transformedOwner = {
      id: owner.id,
      userId: owner.userId,
      clinicId: owner.clinicId,
      createdAt: owner.createdAt,
      updatedAt: owner.updatedAt,
      firstName: owner.user.firstName,
      lastName: owner.user.lastName,
      email: owner.user.email,
      phone: owner.user.phone,
      address: owner.user.address,
      imageUrl: owner.user.imageUrl,
      name: `${owner.user.firstName} ${owner.user.lastName}`.trim(),
      pets: owner.pets,
      hasClerkAccount: !!owner.user.clerkUserId
    };

    return res.json({
      success: true,
      data: transformedOwner,
      message: 'Pet owner retrieved successfully'
    });
  } catch (error) {
    console.error('Get pet owner error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error',
      message: 'Unable to retrieve pet owner'
    });
  }
});

// Update a pet owner (staff only)
// Updates the User record directly
router.put('/:id', async (req: Request, res: Response) => {
  try {
    if (!req.staff) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        message: 'Only staff members can update pet owners'
      });
    }

    const { id } = req.params;
    const { firstName, lastName, email, phone, address } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Missing ID',
        message: 'Pet owner ID is required'
      });
    }

    const clinicId = getClinicId(req);
    if (!clinicId) {
      return res.status(400).json({
        success: false,
        error: 'Clinic ID required',
        message: 'Please provide a clinicId'
      });
    }

    // Verify staff has access to this clinic
    const clinic = await verifyStaffClinicAccess(req, clinicId);
    if (!clinic) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        message: 'You do not have access to this clinic'
      });
    }

    // Find the existing owner with user data
    const existingOwner = await prisma.petOwner.findUnique({
      where: { id: id as string },
      include: {
        user: {
          select: {
            id: true,
            clerkUserId: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            address: true,
            imageUrl: true
          }
        }
      }
    });

    if (!existingOwner) {
      return res.status(404).json({
        success: false,
        error: 'Not found',
        message: 'Pet owner not found'
      });
    }

    // Verify owner belongs to the requested clinic
    if (existingOwner.clinicId !== clinicId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        message: 'This pet owner does not belong to your clinic'
      });
    }

    // If owner has a Clerk account, they must update their own profile
    if (existingOwner.user.clerkUserId) {
      return res.status(400).json({
        success: false,
        error: 'Cannot update',
        message: 'This pet owner has a registered account. They must update their own profile.'
      });
    }

    // Update the User record directly
    const updatedUser = await prisma.user.update({
      where: { id: existingOwner.userId },
      data: {
        firstName: firstName !== undefined ? firstName : existingOwner.user.firstName,
        lastName: lastName !== undefined ? lastName : existingOwner.user.lastName,
        email: email !== undefined ? email : existingOwner.user.email,
        phone: phone !== undefined ? phone : existingOwner.user.phone,
        address: address !== undefined ? address : existingOwner.user.address
      }
    });

    const transformedOwner = {
      id: existingOwner.id,
      userId: existingOwner.userId,
      clinicId: existingOwner.clinicId,
      createdAt: existingOwner.createdAt,
      updatedAt: new Date(),
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
      phone: updatedUser.phone,
      address: updatedUser.address,
      imageUrl: updatedUser.imageUrl,
      name: `${updatedUser.firstName} ${updatedUser.lastName}`.trim(),
      hasClerkAccount: false
    };

    return res.json({
      success: true,
      data: transformedOwner,
      message: 'Pet owner updated successfully'
    });
  } catch (error) {
    console.error('Update pet owner error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error',
      message: 'Unable to update pet owner'
    });
  }
});

export default router;
