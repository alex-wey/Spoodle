import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import Joi from 'joi';
import db from '../database/crud/index.js';
import { MedicalRecord, Pet } from '../database/entities/index.js';
import { validateRequest, commonSchemas } from '../middleware/validation.js';
import { authenticateToken } from '../middleware/auth.js';
import { uploadSingle, uploadMultiple, handleUploadError, getFileUrl } from '../middleware/fileUpload.js';

const router = Router();

// Apply authentication to all medical record routes
router.use(authenticateToken);

// Get all medical records for the authenticated user
router.get('/', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: 'Please log in to view medical records'
      });
    }

    // Get all pets for the user first
    const userPets = await db.getPetsByOwner(req.user.petOwnerId);
    const petIds = userPets.map(pet => pet.petId);
    
    // Get all medical records for these pets
    const allRecords: MedicalRecord[] = [];
    for (const petId of petIds) {
      const petRecords = await db.getMedicalRecordsByPet(petId);
      allRecords.push(...petRecords);
    }
    
    // Sort by upload date (most recent first)
    allRecords.sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());
    
    res.json({
      success: true,
      data: allRecords,
      message: 'Medical records retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error',
      message: 'Unable to retrieve medical records'
    });
  }
});

// Get medical records for a specific pet
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
          message: 'You do not have permission to view this pet\'s medical records'
        });
      }

      const records = await db.getMedicalRecordsByPet(petId);
      
      // Sort by upload date (most recent first)
      records.sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());
      
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

// Get a specific medical record by ID
router.get('/:id',
  validateRequest({ params: Joi.object({ id: commonSchemas.id }) }),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      const record = await db.findById<MedicalRecord>('medicalRecords', id);
      
      if (!record) {
        return res.status(404).json({
          success: false,
          error: 'Medical record not found',
          message: 'The requested medical record does not exist'
        });
      }

      // Verify record belongs to the authenticated user through pet ownership
      const pet = await db.findById<Pet>('pets', record.petId);
      if (!pet || pet.ownerId !== req.user?.petOwnerId) {
        return res.status(403).json({
          success: false,
          error: 'Access denied',
          message: 'You do not have permission to view this medical record'
        });
      }
      
      res.json({
        success: true,
        data: record,
        message: 'Medical record retrieved successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Server error',
        message: 'Unable to retrieve medical record'
      });
    }
  }
);

// Upload a single medical record file
router.post('/upload',
  uploadSingle('file'),
  handleUploadError,
  validateRequest({
    body: Joi.object({
      petId: commonSchemas.id,
      fileType: Joi.string().valid(
        'medical_history', 'vaccination', 'medication', 'surgical', 'diagnostic', 'blood_work', 'x_ray'
      ).required(),
      description: Joi.string().max(1000).optional(),
      clinicId: Joi.string().optional(),
      vetId: Joi.string().optional()
    })
  }),
  async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No file uploaded',
          message: 'Please select a file to upload'
        });
      }

      const { petId, fileType, description, clinicId, vetId } = req.body;
      
      // Verify pet belongs to the user
      const pet = await db.findById<Pet>('pets', petId);
      if (!pet || pet.ownerId !== req.user!.petOwnerId) {
        return res.status(400).json({
          success: false,
          error: 'Invalid pet',
          message: 'Pet not found or does not belong to you'
        });
      }

      // Create medical record entry
      const newRecord = await db.create<MedicalRecord>('medicalRecords', {
        recordId: uuidv4(),
        petId: petId,
        ownerId: req.user!.petOwnerId,
        fileType: fileType,
        fileName: req.file.filename,
        fileUrl: getFileUrl(req.file.filename),
        uploadDate: new Date().toISOString(),
        description: description,
        clinicId: clinicId,
        vetId: vetId
      });
      
      res.status(201).json({
        success: true,
        data: newRecord,
        message: 'Medical record uploaded successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Server error',
        message: 'Unable to upload medical record'
      });
    }
  }
);

// Upload multiple medical record files
router.post('/upload-multiple',
  uploadMultiple('files', 5),
  handleUploadError,
  validateRequest({
    body: Joi.object({
      petId: commonSchemas.id,
      fileType: Joi.string().valid(
        'medical_history', 'vaccination', 'medication', 'surgical', 'diagnostic', 'blood_work', 'x_ray'
      ).required(),
      description: Joi.string().max(1000).optional(),
      clinicId: Joi.string().optional(),
      vetId: Joi.string().optional()
    })
  }),
  async (req: Request, res: Response) => {
    try {
      const files = req.files as Express.Multer.File[];
      
      if (!files || files.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No files uploaded',
          message: 'Please select files to upload'
        });
      }

      const { petId, fileType, description, clinicId, vetId } = req.body;
      
      // Verify pet belongs to the user
      const pet = await db.findById<Pet>('pets', petId);
      if (!pet || pet.ownerId !== req.user!.petOwnerId) {
        return res.status(400).json({
          success: false,
          error: 'Invalid pet',
          message: 'Pet not found or does not belong to you'
        });
      }

      // Create medical record entries for each file
      const records: MedicalRecord[] = [];
      for (const file of files) {
        const newRecord = await db.create<MedicalRecord>('medicalRecords', {
          recordId: uuidv4(),
          petId: petId,
          ownerId: req.user!.petOwnerId,
          fileType: fileType,
          fileName: file.filename,
          fileUrl: getFileUrl(file.filename),
          uploadDate: new Date().toISOString(),
          description: description,
          clinicId: clinicId,
          vetId: vetId
        });
        records.push(newRecord);
      }
      
      res.status(201).json({
        success: true,
        data: records,
        message: `${records.length} medical records uploaded successfully`
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Server error',
        message: 'Unable to upload medical records'
      });
    }
  }
);

// Update a medical record (metadata only, not the file)
router.put('/:id',
  validateRequest({ 
    params: Joi.object({ id: commonSchemas.id }),
    body: Joi.object({
      fileType: Joi.string().valid(
        'medical_history', 'vaccination', 'medication', 'surgical', 'diagnostic', 'blood_work', 'x_ray'
      ).optional(),
      description: Joi.string().max(1000).optional(),
      clinicId: Joi.string().optional(),
      vetId: Joi.string().optional()
    })
  }),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      // Check if record exists and belongs to user
      const existingRecord = await db.findById<MedicalRecord>('medicalRecords', id);
      
      if (!existingRecord) {
        return res.status(404).json({
          success: false,
          error: 'Medical record not found',
          message: 'The requested medical record does not exist'
        });
      }

      // Verify record belongs to the authenticated user through pet ownership
      const pet = await db.findById<Pet>('pets', existingRecord.petId);
      if (!pet || pet.ownerId !== req.user?.petOwnerId) {
        return res.status(403).json({
          success: false,
          error: 'Access denied',
          message: 'You do not have permission to update this medical record'
        });
      }

      const updatedRecord = await db.update<MedicalRecord>('medicalRecords', id, req.body);
      
      if (!updatedRecord) {
        return res.status(500).json({
          success: false,
          error: 'Update failed',
          message: 'Unable to update medical record'
        });
      }
      
      res.json({
        success: true,
        data: updatedRecord,
        message: 'Medical record updated successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Server error',
        message: 'Unable to update medical record'
      });
    }
  }
);

// Delete a medical record
router.delete('/:id',
  validateRequest({ params: Joi.object({ id: commonSchemas.id }) }),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      // Check if record exists and belongs to user
      const existingRecord = await db.findById<MedicalRecord>('medicalRecords', id);
      
      if (!existingRecord) {
        return res.status(404).json({
          success: false,
          error: 'Medical record not found',
          message: 'The requested medical record does not exist'
        });
      }

      // Verify record belongs to the authenticated user through pet ownership
      const pet = await db.findById<Pet>('pets', existingRecord.petId);
      if (!pet || pet.ownerId !== req.user?.petOwnerId) {
        return res.status(403).json({
          success: false,
          error: 'Access denied',
          message: 'You do not have permission to delete this medical record'
        });
      }

      // Delete the file from filesystem (optional, depending on your needs)
      // await deleteFile(path.join(process.env.UPLOAD_DIR || './uploads', existingRecord.fileName));

      const deleted = await db.delete('medicalRecords', id);
      
      if (!deleted) {
        return res.status(500).json({
          success: false,
          error: 'Delete failed',
          message: 'Unable to delete medical record'
        });
      }
      
      res.json({
        success: true,
        message: 'Medical record deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Server error',
        message: 'Unable to delete medical record'
      });
    }
  }
);

export default router;
