import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../index.js';
import { validateRequest, validationSchemas, commonSchemas } from '../middleware/validation.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// Apply authentication to all pet routes
router.use(authenticateToken);

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

    const pets = await prisma.pet.findMany({
      where: { ownerId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json({
      success: true,
      data: pets,
      message: 'Pets retrieved successfully'
    });
  } catch (error) {
    console.error('Get pets error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error',
      message: 'Unable to retrieve pets'
    });
  }
});

// Get a specific pet by ID
router.get('/:id',
  validateRequest({ params: commonSchemas.id }),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      const pet = await prisma.pet.findFirst({
        where: { 
          id,
          ownerId: req.user!.id
        }
      });
      
      if (!pet) {
        return res.status(404).json({
          success: false,
          error: 'Pet not found',
          message: 'The requested pet does not exist or you do not have permission to view it'
        });
      }
      
      res.json({
        success: true,
        data: pet,
        message: 'Pet retrieved successfully'
      });
    } catch (error) {
      console.error('Get pet error:', error);
      res.status(500).json({
        success: false,
        error: 'Server error',
        message: 'Unable to retrieve pet'
      });
    }
  }
);

// Create a new pet
router.post('/',
  validateRequest({ body: validationSchemas.createPet }),
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
      
      // DEBUG: Log what we're trying to create
      console.log('🐕 Attempting to create pet:');
      console.log('   Owner ID:', req.user.id);
      console.log('   Pet Name:', petData.name);
      console.log('   Species:', petData.species);
      
      // DEBUG: Check if user exists in database
      const userExists = await prisma.user.findUnique({
        where: { id: req.user.id }
      });
      console.log('   User exists in DB?', userExists ? 'YES' : 'NO');
      if (!userExists) {
        console.error('❌ USER DOES NOT EXIST IN DATABASE!');
        return res.status(400).json({
          success: false,
          error: 'User not found',
          message: 'Your user account does not exist in the database. Please register again.'
        });
      }
      
      const newPet = await prisma.pet.create({
        data: {
          id: uuidv4(),
          ownerId: req.user.id,
          name: petData.name,
          species: petData.species,
          breed: petData.breed,
          dateOfBirth: petData.dateOfBirth ? new Date(petData.dateOfBirth) : null,
          gender: petData.gender,
          spayedNeutered: petData.spayedNeutered || false,
          weight: petData.weight,
          microchipId: petData.microchipId,
          allergies: petData.allergies || [],
          dietaryRestrictions: petData.dietaryRestrictions || []
        }
      });
      
      res.status(201).json({
        success: true,
        data: newPet,
        message: 'Pet created successfully'
      });
    } catch (error) {
      console.error('Create pet error:', error);
      res.status(500).json({
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
    params: commonSchemas.id,
    body: validationSchemas.updatePet 
  }),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      // Check if pet exists and belongs to user
      const existingPet = await prisma.pet.findFirst({
        where: { 
          id,
          ownerId: req.user!.id
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
      if (updateData.dateOfBirth) {
        updateData.dateOfBirth = new Date(updateData.dateOfBirth);
      }

      const updatedPet = await prisma.pet.update({
        where: { id },
        data: updateData
      });
      
      res.json({
        success: true,
        data: updatedPet,
        message: 'Pet updated successfully'
      });
    } catch (error) {
      console.error('Update pet error:', error);
      res.status(500).json({
        success: false,
        error: 'Server error',
        message: 'Unable to update pet'
      });
    }
  }
);

// Delete a pet
router.delete('/:id',
  validateRequest({ params: commonSchemas.id }),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      // Check if pet exists and belongs to user
      const existingPet = await prisma.pet.findFirst({
        where: { 
          id,
          ownerId: req.user!.id
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
        where: { id }
      });
      
      res.json({
        success: true,
        message: 'Pet deleted successfully'
      });
    } catch (error) {
      console.error('Delete pet error:', error);
      res.status(500).json({
        success: false,
        error: 'Server error',
        message: 'Unable to delete pet'
      });
    }
  }
);

export default router;
