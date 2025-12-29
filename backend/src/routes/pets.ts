import { Router, Request, Response } from 'express';
import { prisma } from '../index.js';
import { validateRequest, validationSchemas, commonSchemas } from '../middleware/validation.js';
import { authenticateClerk } from '../middleware/auth.js';
import { getClinicScopedPetWhere, verifyPetClinicAccess } from '../utils/clinicAuth.js';

const router = Router();

// Apply authentication to all pet routes
router.use(authenticateClerk);

// Helper function to validate and clean image URLs
function validateImageUrl(imageUrl: string | null | undefined): string | null {
  if (!imageUrl) return null;
  
  // Reject blob URLs
  if (imageUrl.startsWith('blob:')) {
    console.warn('Rejected blob URL:', imageUrl);
    return null;
  }
  
  // Accept base64 data URLs
  if (imageUrl.startsWith('data:image/')) {
    return imageUrl;
  }
  
  // Accept regular HTTP/HTTPS URLs
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  // Reject other types
  console.warn('Rejected invalid image URL:', imageUrl);
  return null;
}

// Get all pets for the authenticated user (petOwner or staff)
router.get('/', async (req: Request, res: Response) => {
  try {
    if (!req.petOwner && !req.staff) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: 'Please log in to view pets'
      });
    }

    const pets = await prisma.pet.findMany({
      where: getClinicScopedPetWhere(req),
      include: {
        petOwner: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
                address: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Transform pets to include owner information
    const petsWithOwners = pets.map(pet => ({
      ...pet,
      owner: pet.petOwner?.user ? {
        id: pet.petOwner.user.id,
        name: `${pet.petOwner.user.firstName} ${pet.petOwner.user.lastName}`.trim(),
        email: pet.petOwner.user.email,
        phone: pet.petOwner.user.phone,
        address: pet.petOwner.user.address
      } : null
    }));
    
    return res.json({
      success: true,
      data: petsWithOwners,
      message: 'Pets retrieved successfully'
    });
  } catch (error) {
    console.error('Get pets error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error',
      message: 'Unable to retrieve pets'
    });
  }
});

// Get a specific pet by ID
router.get('/:id',
  validateRequest({ params: { id: commonSchemas.id } }),
  async (req: Request, res: Response) => {
    try {
      if (!req.petOwner && !req.staff) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
          message: 'Please log in to view pets'
        });
      }

      const { id } = req.params;
      
      // Verify pet belongs to user's clinic
      const hasAccess = await verifyPetClinicAccess(req, id as string);
      
      if (!hasAccess) {
        return res.status(404).json({
          success: false,
          error: 'Pet not found',
          message: 'The requested pet does not exist or you do not have permission to view it'
        });
      }

      const pet = await prisma.pet.findFirst({
        where: { 
          id: id as string,
          ...getClinicScopedPetWhere(req)
        },
        include: {
          petOwner: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  phone: true,
                  address: true
                }
              }
            }
          }
        }
      });
      
      if (!pet) {
        return res.status(404).json({
          success: false,
          error: 'Pet not found',
          message: 'The requested pet does not exist or you do not have permission to view it'
        });
      }

      // Transform pet to include owner information
      const petWithOwner = {
        ...pet,
        owner: pet.petOwner?.user ? {
          id: pet.petOwner.user.id,
          name: `${pet.petOwner.user.firstName} ${pet.petOwner.user.lastName}`.trim(),
          email: pet.petOwner.user.email,
          phone: pet.petOwner.user.phone,
          address: pet.petOwner.user.address
        } : null
      };
      
      return res.json({
        success: true,
        data: petWithOwner,
        message: 'Pet retrieved successfully'
      });
    } catch (error) {
      console.error('Get pet error:', error);
      return res.status(500).json({
        success: false,
        error: 'Server error',
        message: 'Unable to retrieve pet'
      });
    }
  }
);

// Create a new pet
router.post('/',
  // validateRequest({ body: validationSchemas.createPet }), // TEMPORARILY DISABLED FOR DEBUGGING
  async (req: Request, res: Response) => {
    try {
      if (!req.petOwner) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
          message: 'Please log in to create pets. Only pet owners can create pets.'
        });
      }

      const petData = req.body;
      
      // Validate and clean image URL
      const cleanImageUrl = validateImageUrl(petData.imageUrl);

      // DEBUG: Log what we're trying to create
      console.log('🐕 Attempting to create pet:');
      console.log('   PetOwner ID:', req.petOwner.id);
      console.log('   Clinic ID:', req.petOwner.clinicId);
      console.log('   Pet Name:', petData.name);
      console.log('   Species:', petData.species);
      console.log('   Image URL:', cleanImageUrl ? 'Valid image URL provided' : 'No valid image URL');
      
      // Create pet using Prisma
      const newPet = await prisma.pet.create({
        data: {
          name: petData.name,
          species: petData.species || 'Dog',
          breed: petData.breed || null,
          dateOfBirth: petData.dateOfBirth || null,
          biologicalSex: petData.biologicalSex || null,
          spayedNeutered: petData.spayedNeutered || false,
          weight: petData.weight || null,
          allergies: petData.allergies || [],
          dietaryRestrictions: petData.dietaryRestrictions || [],
          imageUrl: cleanImageUrl,
          ownerId: req.petOwner.id
        }
      });
      
      console.log('✅ Pet created successfully:', newPet.id);
      
      return res.status(201).json({
        success: true,
        data: newPet,
        message: 'Pet created successfully'
      });
    } catch (error) {
      console.error('❌ CREATE PET ERROR:');
      console.error('Error name:', (error as any).name);
      console.error('Error message:', (error as any).message);
      console.error('Full error:', error);
      return res.status(500).json({
        success: false,
        error: 'Server error',
        message: 'Unable to create pet'
      });
    }
  }
);

// Update a pet
router.put('/:id',
  validateRequest({ 
    params: { id: commonSchemas.id },
    body: validationSchemas.updatePet 
  }),
  async (req: Request, res: Response) => {
    try {
      if (!req.petOwner && !req.staff) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
          message: 'Please log in to update pets'
        });
      }

      const { id } = req.params;
      
      // Verify pet belongs to user's clinic
      const hasAccess = await verifyPetClinicAccess(req, id as string);
      
      if (!hasAccess) {
        return res.status(404).json({
          success: false,
          error: 'Pet not found',
          message: 'The requested pet does not exist or you do not have permission to update it'
        });
      }

      // Check if pet exists in clinic
      const existingPet = await prisma.pet.findFirst({
        where: { 
          id: id as string,
          ...getClinicScopedPetWhere(req)
        }
      });
      
      if (!existingPet) {
        return res.status(404).json({
          success: false,
          error: 'Pet not found',
          message: 'The requested pet does not exist or you do not have permission to update it'
        });
      }

      const updateData = { ...req.body };
      
      // Validate and clean image URL if provided
      if (updateData.imageUrl !== undefined) {
        updateData.imageUrl = validateImageUrl(updateData.imageUrl);
      }
      
      if (updateData.dateOfBirth) {
        updateData.dateOfBirth = new Date(updateData.dateOfBirth);
      }

      const updatedPet = await prisma.pet.update({
        where: { id: id as string },
        data: updateData
      });
      
      return res.json({
        success: true,
        data: updatedPet,
        message: 'Pet updated successfully'
      });
    } catch (error) {
      console.error('Update pet error:', error);
      return res.status(500).json({
        success: false,
        error: 'Server error',
        message: 'Unable to update pet'
      });
    }
  }
);

// Delete a pet
router.delete('/:id',
  validateRequest({ params: { id: commonSchemas.id } }),
  async (req: Request, res: Response) => {
    try {
      if (!req.petOwner) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
          message: 'Only pet owners can delete pets'
        });
      }

      const { id } = req.params;
      
      // Verify pet belongs to user's clinic
      const hasAccess = await verifyPetClinicAccess(req, id as string);
      
      if (!hasAccess) {
        return res.status(404).json({
          success: false,
          error: 'Pet not found',
          message: 'The requested pet does not exist or you do not have permission to delete it'
        });
      }

      // Check if pet exists in clinic
      const existingPet = await prisma.pet.findFirst({
        where: { 
          id: id as string,
          ...getClinicScopedPetWhere(req)
        }
      });
      
      if (!existingPet) {
        return res.status(404).json({
          success: false,
          error: 'Pet not found',
          message: 'The requested pet does not exist or you do not have permission to delete it'
        });
      }

      await prisma.pet.delete({
        where: { id: id as string }
      });
      
      return res.json({
        success: true,
        message: 'Pet deleted successfully'
      });
    } catch (error) {
      console.error('Delete pet error:', error);
      return res.status(500).json({
        success: false,
        error: 'Server error',
        message: 'Unable to delete pet'
      });
    }
  }
);

// Get all pets for a clinic (clinic staff view)
// This endpoint is for clinic staff to view all pets belonging to their clinic's pet owners
// Note: This is now redundant with the main GET / endpoint which handles both petOwner and staff
// Keeping for backward compatibility
router.get('/clinic', authenticateClerk, async (req: Request, res: Response) => {
  try {
    if (!req.staff && !req.petOwner) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: 'Please log in to view clinic pets'
      });
    }

    if (!req.clinic) {
      return res.status(403).json({
        success: false,
        error: 'No clinic access',
        message: 'You must be assigned to a clinic to view clinic pets'
      });
    }

    // Get all pets in the clinic (already filtered by getClinicScopedPetWhere)
    const pets = await prisma.pet.findMany({
      where: getClinicScopedPetWhere(req),
      include: {
        petOwner: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
                address: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Transform pets to include owner information
    const petsWithOwners = pets.map(pet => ({
      ...pet,
      owner: pet.petOwner.user ? {
        id: pet.petOwner.user.id,
        name: `${pet.petOwner.user.firstName} ${pet.petOwner.user.lastName}`.trim(),
        email: pet.petOwner.user.email,
        phone: pet.petOwner.user.phone,
        address: pet.petOwner.user.address
      } : null
    }));

    return res.json({
      success: true,
      data: petsWithOwners,
      count: petsWithOwners.length,
      message: 'Clinic pets retrieved successfully'
    });
  } catch (error) {
    console.error('Get clinic pets error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error',
      message: 'Unable to retrieve clinic pets'
    });
  }
});

export default router;
