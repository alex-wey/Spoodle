import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import Joi from 'joi';
import multer from 'multer';
import * as path from 'path';
import * as fs from 'fs/promises';
import db from '../database/crud/index.js';
import { User, Pet, Document } from '../database/entities/index.js';
import { validateRequest, validationSchemas, commonSchemas } from '../middleware/validation.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = process.env.UPLOAD_DIR || './uploads';
    const documentsDir = path.join(uploadDir, 'documents');
    
    try {
      await fs.mkdir(documentsDir, { recursive: true });
      cb(null, documentsDir);
    } catch (error) {
      cb(error instanceof Error ? error : new Error(String(error)), '');
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `doc-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB default
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = (process.env.ALLOWED_FILE_TYPES || 'pdf,jpg,jpeg,png,doc,docx').split(',');
    const ext = path.extname(file.originalname).toLowerCase().substring(1);
    
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`File type .${ext} is not allowed. Allowed types: ${allowedTypes.join(', ')}`));
    }
  }
});

// Apply authentication to all document routes
router.use(authenticateToken);

// Get all documents for the authenticated user
router.get('/', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: 'Please log in to view documents'
      });
    }

    // Get all pets for the user first
    const userPets = await db.getPetsByOwner(req.user.petOwnerId);
    const petIds = userPets.map(pet => pet.petId);
    
    // Get all documents for these pets
    const allDocuments = [];
    for (const petId of petIds) {
      const petDocuments = await db.getDocumentsByPet(petId);
      allDocuments.push(...petDocuments);
    }
    
    // Sort by creation date (most recent first)
    allDocuments.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    res.json({
      success: true,
      data: allDocuments,
      message: 'Documents retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error',
      message: 'Unable to retrieve documents'
    });
  }
});

// Get documents by category
router.get('/category/:category',
  validateRequest({ params: Joi.object({ category: Joi.string().valid(
    'past_appointments', 'x_ray_documents', 'diagnostic_reports', 
    'blood_test_reports', 'vaccination_history'
  )})}),
  async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
          message: 'Please log in to view documents'
        });
      }

      const { category } = req.params;
      
      // Get all pets for the user first
      const userPets = await db.getPetsByOwner(req.user.petOwnerId);
      const petIds = userPets.map(pet => pet.petId);
      
      // Get all documents for these pets in the specified category
      const allDocuments = [];
      for (const petId of petIds) {
        const petDocuments = await db.getDocumentsByPet(petId, category);
        allDocuments.push(...petDocuments);
      }
      
      // Sort by creation date (most recent first)
      allDocuments.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      res.json({
        success: true,
        data: allDocuments,
        message: 'Documents retrieved successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Server error',
        message: 'Unable to retrieve documents'
      });
    }
  }
);

// Get documents for a specific pet
router.get('/pet/:petId',
  validateRequest({ params: Joi.object({ petId: commonSchemas.id }) }),
  async (req: Request, res: Response) => {
    try {
      const { petId } = req.params;
      
      // Verify pet belongs to the authenticated user
      const pet = await db.findById<Pet>('pets', petId);
      
      if (!pet) {
        return res.status(404).json({
          success: false,
          error: 'Pet not found',
          message: 'The requested pet does not exist'
        });
      }

      if (pet.ownerId !== req.user?.petOwnerId) {
        return res.status(403).json({
          success: false,
          error: 'Access denied',
          message: 'You do not have permission to view this pet\'s documents'
        });
      }

      const documents = await db.getDocumentsByPet(petId);
      
      // Sort by creation date (most recent first)
      documents.sort((a: Document, b: Document) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      res.json({
        success: true,
        data: documents,
        message: 'Documents retrieved successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Server error',
        message: 'Unable to retrieve documents'
      });
    }
  }
);

// Get a specific document by ID
router.get('/:id',
  validateRequest({ params: Joi.object({ id: commonSchemas.id }) }),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      const document = await db.findById('documents', id);
      
      if (!document) {
        return res.status(404).json({
          success: false,
          error: 'Document not found',
          message: 'The requested document does not exist'
        });
      }

      // Verify document belongs to the authenticated user through pet ownership
      const pet = await db.findById<Pet>('pets', document.petId);
      if (!pet || pet.ownerId !== req.user?.petOwnerId) {
        return res.status(403).json({
          success: false,
          error: 'Access denied',
          message: 'You do not have permission to view this document'
        });
      }
      
      res.json({
        success: true,
        data: document,
        message: 'Document retrieved successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Server error',
        message: 'Unable to retrieve document'
      });
    }
  }
);

// Upload a new document
router.post('/',
  upload.single('file'),
  validateRequest({ 
    body: Joi.object({
      category: Joi.string().valid(
        'past_appointments', 'x_ray_documents', 'diagnostic_reports', 
        'blood_test_reports', 'vaccination_history'
      ).required(),
      petId: commonSchemas.id.optional(),
      hospitalName: Joi.string().min(1).required(),
      fileName: Joi.string().min(1).required(),
      date: Joi.date().iso().optional(),
      notes: Joi.string().max(1000).optional()
    })
  }),
  async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
          message: 'Please log in to upload documents'
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No file uploaded',
          message: 'Please select a file to upload'
        });
      }

      const { category, petId, hospitalName, fileName, date, notes } = req.body;
      
      // If petId is provided, verify pet belongs to the user
      let selectedPetId = petId;
      if (petId) {
        const pet = await db.findById<Pet>('pets', petId);
        if (!pet || pet.ownerId !== req.user.petOwnerId) {
          return res.status(400).json({
            success: false,
            error: 'Invalid pet',
            message: 'Pet not found or does not belong to you'
          });
        }
      } else {
        // If no petId provided, get the user's first pet or create a general document
        const userPets = await db.getPetsByOwner(req.user.petOwnerId);
        if (userPets.length > 0) {
          selectedPetId = userPets[0].petId;
        }
      }
      
      const documentData = {
        documentId: uuidv4(),
        petId: selectedPetId,
        ownerId: req.user.petOwnerId,
        category,
        hospitalName,
        fileName,
        originalFileName: req.file.originalname,
        filePath: req.file.path,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        date: date || new Date().toISOString(),
        notes: notes || '',
        createdAt: new Date().toISOString()
      };
      
      const newDocument = await db.createDocument(documentData);
      
      res.status(201).json({
        success: true,
        data: newDocument,
        message: 'Document uploaded successfully'
      });
    } catch (error) {
      // Clean up uploaded file if document creation fails
      if (req.file) {
        try {
          await fs.unlink(req.file.path);
        } catch (unlinkError) {
          console.error('Error cleaning up uploaded file:', unlinkError);
        }
      }
      
      res.status(500).json({
        success: false,
        error: 'Server error',
        message: 'Unable to upload document'
      });
    }
  }
);

// Update a document
router.put('/:id',
  validateRequest({ 
    params: Joi.object({ id: commonSchemas.id }),
    body: Joi.object({
      category: Joi.string().valid(
        'past_appointments', 'x_ray_documents', 'diagnostic_reports', 
        'blood_test_reports', 'vaccination_history'
      ).optional(),
      hospitalName: Joi.string().min(1).optional(),
      fileName: Joi.string().min(1).optional(),
      date: Joi.date().iso().optional(),
      notes: Joi.string().max(1000).optional()
    })
  }),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      // Check if document exists and belongs to user
      const existingDocument = await db.findById('documents', id);
      
      if (!existingDocument) {
        return res.status(404).json({
          success: false,
          error: 'Document not found',
          message: 'The requested document does not exist'
        });
      }

      // Verify document belongs to the authenticated user through pet ownership
      const pet = await db.findById<Pet>('pets', existingDocument.petId);
      if (!pet || pet.ownerId !== req.user?.petOwnerId) {
        return res.status(403).json({
          success: false,
          error: 'Access denied',
          message: 'You do not have permission to update this document'
        });
      }

      const updatedDocument = await db.update('documents', id, req.body);
      
      if (!updatedDocument) {
        return res.status(500).json({
          success: false,
          error: 'Update failed',
          message: 'Unable to update document'
        });
      }
      
      res.json({
        success: true,
        data: updatedDocument,
        message: 'Document updated successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Server error',
        message: 'Unable to update document'
      });
    }
  }
);

// Delete a document
router.delete('/:id',
  validateRequest({ params: Joi.object({ id: commonSchemas.id }) }),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      // Check if document exists and belongs to user
      const existingDocument = await db.findById('documents', id);
      
      if (!existingDocument) {
        return res.status(404).json({
          success: false,
          error: 'Document not found',
          message: 'The requested document does not exist'
        });
      }

      // Verify document belongs to the authenticated user through pet ownership
      const pet = await db.findById<Pet>('pets', existingDocument.petId);
      if (!pet || pet.ownerId !== req.user?.petOwnerId) {
        return res.status(403).json({
          success: false,
          error: 'Access denied',
          message: 'You do not have permission to delete this document'
        });
      }

      // Delete the file from filesystem
      try {
        await fs.unlink(existingDocument.filePath);
      } catch (fileError) {
        console.error('Error deleting file:', fileError);
        // Continue with database deletion even if file deletion fails
      }

      const deleted = await db.delete('documents', id);
      
      if (!deleted) {
        return res.status(500).json({
          success: false,
          error: 'Delete failed',
          message: 'Unable to delete document'
        });
      }
      
      res.json({
        success: true,
        message: 'Document deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Server error',
        message: 'Unable to delete document'
      });
    }
  }
);

export default router;
