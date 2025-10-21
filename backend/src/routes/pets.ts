import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import Joi from 'joi';
import db from '../database/crud/index.js';
import { Pet, CreatePetRequest } from '../database/entities/index.js';
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

    const pets = await db.getPetsByOwner(req.user.petOwnerId);
    
    res.json({
      success: true,
      data: pets,
      message: 'Pets retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error',
      message: 'Unable to retrieve pets'
    });
  }
});

// Get a specific pet by ID
router.get('/:id',
  validateRequest({ params: Joi.object({ id: commonSchemas.id }) }),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      const pet = await db.findById<Pet>('pets', id);
      
      if (!pet) {
        return res.status(404).json({
          success: false,
          error: 'Pet not found',
          message: 'The requested pet does not exist'
        });
      }

      // Verify pet belongs to the authenticated user
      if (pet.ownerId !== req.user?.petOwnerId) {
        return res.status(403).json({
          success: false,
          error: 'Access denied',
          message: 'You do not have permission to view this pet'
        });
      }
      
      res.json({
        success: true,
        data: pet,
        message: 'Pet retrieved successfully'
      });
    } catch (error) {
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

      const petData: CreatePetRequest = req.body;
      
      const newPet = await db.createPet({
        petId: uuidv4(),
        ownerId: req.user.petOwnerId,
        name: petData.name,
        breed: petData.breed,
        dateOfBirth: petData.dateOfBirth,
        gender: petData.gender,
        spayedNeutered: petData.spayedNeutered,
        weight: petData.weight,
        allergies: petData.allergies || [],
        dietaryRestrictions: petData.dietaryRestrictions || []
      });
      
      res.status(201).json({
        success: true,
        data: newPet,
        message: 'Pet created successfully'
      });
    } catch (error) {
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
    params: Joi.object({ id: commonSchemas.id }),
    body: validationSchemas.updatePet 
  }),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      // Check if pet exists and belongs to user
      const existingPet = await db.findById<Pet>('pets', id);
      
      if (!existingPet) {
        return res.status(404).json({
          success: false,
          error: 'Pet not found',
          message: 'The requested pet does not exist'
        });
      }

      if (existingPet.ownerId !== req.user?.petOwnerId) {
        return res.status(403).json({
          success: false,
          error: 'Access denied',
          message: 'You do not have permission to update this pet'
        });
      }

      const updatedPet = await db.update<Pet>('pets', id, req.body);
      
      if (!updatedPet) {
        return res.status(500).json({
          success: false,
          error: 'Update failed',
          message: 'Unable to update pet'
        });
      }
      
      res.json({
        success: true,
        data: updatedPet,
        message: 'Pet updated successfully'
      });
    } catch (error) {
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
  validateRequest({ params: Joi.object({ id: commonSchemas.id }) }),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      // Check if pet exists and belongs to user
      const existingPet = await db.findById<Pet>('pets', id);
      
      if (!existingPet) {
        return res.status(404).json({
          success: false,
          error: 'Pet not found',
          message: 'The requested pet does not exist'
        });
      }

      if (existingPet.ownerId !== req.user?.petOwnerId) {
        return res.status(403).json({
          success: false,
          error: 'Access denied',
          message: 'You do not have permission to delete this pet'
        });
      }

      const deleted = await db.delete('pets', id);
      
      if (!deleted) {
        return res.status(500).json({
          success: false,
          error: 'Delete failed',
          message: 'Unable to delete pet'
        });
      }
      
      res.json({
        success: true,
        message: 'Pet deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Server error',
        message: 'Unable to delete pet'
      });
    }
  }
);

// Get pet's medical records
router.get('/:id/records',
  validateRequest({ params: Joi.object({ id: commonSchemas.id }) }),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      // Check if pet exists and belongs to user
      const existingPet = await db.findById<Pet>('pets', id);
      
      if (!existingPet) {
        return res.status(404).json({
          success: false,
          error: 'Pet not found',
          message: 'The requested pet does not exist'
        });
      }

      if (existingPet.ownerId !== req.user?.petOwnerId) {
        return res.status(403).json({
          success: false,
          error: 'Access denied',
          message: 'You do not have permission to view this pet\'s records'
        });
      }

      const records = await db.getMedicalRecordsByPet(id);
      
      res.json({
        success: true,
        data: records,
        message: 'Medical records retrieved successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Server error',
        message: 'Unable to retrieve medical records'
      });
    }
  }
);

// Get pet's tasks
router.get('/:id/tasks',
  validateRequest({ params: Joi.object({ id: commonSchemas.id }) }),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      // Check if pet exists and belongs to user
      const existingPet = await db.findById<Pet>('pets', id);
      
      if (!existingPet) {
        return res.status(404).json({
          success: false,
          error: 'Pet not found',
          message: 'The requested pet does not exist'
        });
      }

      if (existingPet.ownerId !== req.user?.petOwnerId) {
        return res.status(403).json({
          success: false,
          error: 'Access denied',
          message: 'You do not have permission to view this pet\'s tasks'
        });
      }

      const tasks = await db.getTasksByPet(id);
      
      res.json({
        success: true,
        data: tasks,
        message: 'Tasks retrieved successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Server error',
        message: 'Unable to retrieve tasks'
      });
    }
  }
);

export default router;
