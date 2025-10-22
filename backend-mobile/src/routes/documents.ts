import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';
import * as path from 'path';
import * as fs from 'fs/promises';
import { z } from 'zod';
import { prisma } from '../index.js';
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
      cb(error, '');
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

    const documents = await prisma.document.findMany({
      where: { ownerId: req.user.id },
      include: {
        pet: {
          select: {
            id: true,
            name: true,
            breed: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json({
      success: true,
      data: documents,
      message: 'Documents retrieved successfully'
    });
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error',
      message: 'Unable to retrieve documents'
    });
  }
});

// Get documents by category
router.get('/category/:category',
  validateRequest({ 
    params: { 
      category: z.enum(['past_appointments', 'x_ray_documents', 'diagnostic_reports', 'blood_test_reports', 'vaccination_history'])
    }
  }),
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
      
      const documents = await prisma.document.findMany({
        where: { 
          ownerId: req.user.id,
          category
        },
        include: {
          pet: {
            select: {
              id: true,
              name: true,
              breed: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
      
      res.json({
        success: true,
        data: documents,
        message: 'Documents retrieved successfully'
      });
    } catch (error) {
      console.error('Get documents by category error:', error);
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
  validateRequest({ params: { petId: commonSchemas.id } }),
  async (req: Request, res: Response) => {
    try {
      const { petId } = req.params;
      
      // Verify pet belongs to the authenticated user
      const pet = await prisma.pet.findFirst({
        where: { 
          id: petId,
          ownerId: req.user!.id
        }
      });
      
      if (!pet) {
        return res.status(404).json({
          success: false,
          error: 'Pet not found',
          message: 'The requested pet does not exist or you do not have permission to view its documents'
        });
      }

      const documents = await prisma.document.findMany({
        where: { 
          petId,
          ownerId: req.user!.id
        },
        orderBy: { createdAt: 'desc' }
      });
      
      res.json({
        success: true,
        data: documents,
        message: 'Documents retrieved successfully'
      });
    } catch (error) {
      console.error('Get pet documents error:', error);
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
  validateRequest({ params: commonSchemas.id }),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      const document = await prisma.document.findFirst({
        where: { 
          id,
          ownerId: req.user!.id
        },
        include: {
          pet: {
            select: {
              id: true,
              name: true,
              breed: true
            }
          }
        }
      });
      
      if (!document) {
        return res.status(404).json({
          success: false,
          error: 'Document not found',
          message: 'The requested document does not exist or you do not have permission to view it'
        });
      }
      
      res.json({
        success: true,
        data: document,
        message: 'Document retrieved successfully'
      });
    } catch (error) {
      console.error('Get document error:', error);
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
    body: validationSchemas.createDocument
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
        const pet = await prisma.pet.findFirst({
          where: { 
            id: petId,
            ownerId: req.user.id
          }
        });
        
        if (!pet) {
          return res.status(400).json({
            success: false,
            error: 'Invalid pet',
            message: 'Pet not found or does not belong to you'
          });
        }
      } else {
        // If no petId provided, get the user's first pet
        const userPets = await prisma.pet.findMany({
          where: { ownerId: req.user.id },
          take: 1
        });
        
        if (userPets.length > 0) {
          selectedPetId = userPets[0].id;
        } else {
          return res.status(400).json({
            success: false,
            error: 'No pets found',
            message: 'Please add a pet first before uploading documents'
          });
        }
      }
      
      const newDocument = await prisma.document.create({
        data: {
          id: uuidv4(),
          petId: selectedPetId,
          ownerId: req.user.id,
          category,
          hospitalName,
          fileName,
          originalFileName: req.file.originalname,
          filePath: req.file.path,
          fileSize: req.file.size,
          mimeType: req.file.mimetype,
          date: date ? new Date(date) : new Date(),
          notes: notes || ''
        },
        include: {
          pet: {
            select: {
              id: true,
              name: true,
              breed: true
            }
          }
        }
      });
      
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
      
      console.error('Upload document error:', error);
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
    params: commonSchemas.id,
    body: {
      category: z.enum(['past_appointments', 'x_ray_documents', 'diagnostic_reports', 'blood_test_reports', 'vaccination_history']).optional(),
      hospitalName: z.string().min(1).optional(),
      fileName: z.string().min(1).optional(),
      date: z.string().datetime().optional(),
      notes: z.string().max(1000).optional()
    }
  }),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      // Check if document exists and belongs to user
      const existingDocument = await prisma.document.findFirst({
        where: { 
          id,
          ownerId: req.user!.id
        }
      });
      
      if (!existingDocument) {
        return res.status(404).json({
          success: false,
          error: 'Document not found',
          message: 'The requested document does not exist or you do not have permission to update it'
        });
      }

      const updateData = { ...req.body };
      if (updateData.date) {
        updateData.date = new Date(updateData.date);
      }

      const updatedDocument = await prisma.document.update({
        where: { id },
        data: updateData,
        include: {
          pet: {
            select: {
              id: true,
              name: true,
              breed: true
            }
          }
        }
      });
      
      res.json({
        success: true,
        data: updatedDocument,
        message: 'Document updated successfully'
      });
    } catch (error) {
      console.error('Update document error:', error);
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
  validateRequest({ params: commonSchemas.id }),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      // Check if document exists and belongs to user
      const existingDocument = await prisma.document.findFirst({
        where: { 
          id,
          ownerId: req.user!.id
        }
      });
      
      if (!existingDocument) {
        return res.status(404).json({
          success: false,
          error: 'Document not found',
          message: 'The requested document does not exist or you do not have permission to delete it'
        });
      }

      // Delete the file from filesystem
      try {
        await fs.unlink(existingDocument.filePath);
      } catch (fileError) {
        console.error('Error deleting file:', fileError);
        // Continue with database deletion even if file deletion fails
      }

      await prisma.document.delete({
        where: { id }
      });
      
      res.json({
        success: true,
        message: 'Document deleted successfully'
      });
    } catch (error) {
      console.error('Delete document error:', error);
      res.status(500).json({
        success: false,
        error: 'Server error',
        message: 'Unable to delete document'
      });
    }
  }
);

export default router;
