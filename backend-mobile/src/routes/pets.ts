import { Router, Request, Response } from 'express';
import { prisma } from '../index.js';
import { validateRequest, validationSchemas, commonSchemas } from '../middleware/validation.js';
import { authenticateClerk } from '../middleware/auth.js';

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

// Get all pets for the authenticated user
router.get('/', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: 'Please log in to view pets'
      });
    }

    // Get the PetOwner ID for this user
    const petOwner = await prisma.petOwner.findUnique({
      where: { clerkUserId: req.user.clerkUserId }
    });
    
    if (!petOwner) {
      return res.status(500).json({
        success: false,
        error: 'Pet owner not found',
        message: 'Unable to find pet owner record. Please contact support.'
      });
    }

    const pets = await prisma.pet.findMany({
      where: { ownerId: petOwner.id },
      orderBy: { createdAt: 'desc' }
    });
    
    return res.json({
      success: true,
      data: pets,
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
      const { id } = req.params;
      
      // Get the PetOwner ID for this user
      const petOwner = await prisma.petOwner.findUnique({
        where: { clerkUserId: req.user!.clerkUserId }
      });
      
      if (!petOwner) {
        return res.status(500).json({
          success: false,
          error: 'Pet owner not found',
          message: 'Unable to find pet owner record. Please contact support.'
        });
      }

      const pet = await prisma.pet.findFirst({
        where: { 
          id: id as string,
          ownerId: petOwner.id
        }
      });
      
      if (!pet) {
        return res.status(404).json({
          success: false,
          error: 'Pet not found',
          message: 'The requested pet does not exist or you do not have permission to view it'
        });
      }
      
      return res.json({
        success: true,
        data: pet,
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
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
          message: 'Please log in to create pets'
        });
      }

      const petData = req.body;
      
      // Validate and clean image URL
      const cleanImageUrl = validateImageUrl(petData.imageUrl);
      
      // Get the PetOwner ID for this user
      const petOwner = await prisma.petOwner.findUnique({
        where: { clerkUserId: req.user.clerkUserId }
      });
      
      if (!petOwner) {
        return res.status(500).json({
          success: false,
          error: 'Pet owner not found',
          message: 'Unable to find pet owner record. Please contact support.'
        });
      }

      // DEBUG: Log what we're trying to create
      console.log('🐕 Attempting to create pet:');
      console.log('   User ID:', req.user.id);
      console.log('   PetOwner ID:', petOwner.id);
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
          ownerId: petOwner.id
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
      const { id } = req.params;
      
      // Get the PetOwner ID for this user
      const petOwner = await prisma.petOwner.findUnique({
        where: { clerkUserId: req.user!.clerkUserId }
      });
      
      if (!petOwner) {
        return res.status(500).json({
          success: false,
          error: 'Pet owner not found',
          message: 'Unable to find pet owner record. Please contact support.'
        });
      }

      // Check if pet exists and belongs to user
      const existingPet = await prisma.pet.findFirst({
        where: { 
          id: id as string,
          ownerId: petOwner.id
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
      const { id } = req.params;
      
      // Get the PetOwner ID for this user
      const petOwner = await prisma.petOwner.findUnique({
        where: { clerkUserId: req.user!.clerkUserId }
      });
      
      if (!petOwner) {
        return res.status(500).json({
          success: false,
          error: 'Pet owner not found',
          message: 'Unable to find pet owner record. Please contact support.'
        });
      }

      // Check if pet exists and belongs to user
      const existingPet = await prisma.pet.findFirst({
        where: { 
          id: id as string,
          ownerId: petOwner.id
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

export default router;
