import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';
import multerS3 from 'multer-s3';
import { S3Client, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import * as path from 'path';
import * as fs from 'fs/promises';
import { z } from 'zod';
import { prisma } from '../index.js';
import { validateRequest, commonSchemas } from '../middleware/validation.js';
import { authenticateClerk } from '../middleware/auth.js';

const router = Router();

// S3 Configuration
const useS3 = process.env.USE_S3 === 'true';
let s3Client: S3Client | null = null;
let s3BucketName = '';

if (useS3) {
  s3Client = new S3Client({
    region: process.env.AWS_REGION || 'us-east-2',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    },
  });
  s3BucketName = process.env.S3_BUCKET_NAME || 'spoodle-documents';
  console.log('✅ S3 configured:', s3BucketName);
} else {
  console.log('📁 Using local file storage');
}

// Configure multer for file uploads (S3 or local)
const storage = useS3 && s3Client
  ? multerS3({
      s3: s3Client,
      bucket: s3BucketName,
      metadata: (req: any, file: Express.Multer.File, cb: (error: any, metadata: any) => void) => {
        cb(null, { fieldName: file.fieldname });
      },
      key: (req: any, file: Express.Multer.File, cb: (error: any, key: string) => void) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, `documents/doc-${uniqueSuffix}${ext}`);
      },
    })
  : multer.diskStorage({
      destination: async (req: any, file: Express.Multer.File, cb: (error: any, destination: string) => void) => {
        const uploadDir = process.env.UPLOAD_DIR || './uploads';
        const documentsDir = path.join(uploadDir, 'documents');
        
        try {
          await fs.mkdir(documentsDir, { recursive: true });
          cb(null, documentsDir);
        } catch (error) {
          cb(error as Error, '');
        }
      },
      filename: (req: any, file: Express.Multer.File, cb: (error: any, filename: string) => void) => {
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
    const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
    
    console.log('📋 File filter check:', {
      originalname: file.originalname,
      extractedExt: ext,
      allowedTypes
    });
    
    if (!ext) {
      cb(new Error(`File has no extension. Allowed types: ${allowedTypes.join(', ')}`));
      return;
    }
    
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`File type .${ext} is not allowed. Allowed types: ${allowedTypes.join(', ')}`));
    }
  }
});

// Apply authentication to all document routes
router.use(authenticateClerk);

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
      where: {
        pet: {
          ownerId: req.user.id
        }
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
    
    return res.json({
      success: true,
      data: documents,
      message: 'Documents retrieved successfully'
    });
  } catch (error) {
    console.error('Get documents error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error',
      message: 'Unable to retrieve documents'
    });
  }
});

// Get documents by category
router.get('/category/:category',
  validateRequest({ 
    params: z.object({ 
      category: z.enum(['veterinary_notes', 'diagnostic_reports_and_imaging', 'lab_results', 'vaccine_record'], {
        errorMap: () => ({ message: 'Invalid category. Must be one of: veterinary_notes, diagnostic_reports_and_imaging, lab_results, vaccine_record' })
      })
    })
  }),
  async (req: Request, res: Response) => {
    try {
      console.log('📂 [Documents] GET /category/:category - Route matched');
      console.log('📂 [Documents] Received params:', JSON.stringify(req.params, null, 2));
      console.log('📂 [Documents] Received query:', JSON.stringify(req.query, null, 2));
      console.log('📂 [Documents] User authenticated:', !!req.user);
      
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
          message: 'Please log in to view documents'
        });
      }

      const { category } = req.params;
      console.log('📂 [Documents] Fetching documents for category:', category);
      
      const documents = await prisma.document.findMany({
        where: {
          pet: {
            ownerId: req.user!.id
          },
          category: category as string
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
      
      return res.json({
        success: true,
        data: documents,
        message: 'Documents retrieved successfully'
      });
    } catch (error) {
      console.error('Get documents by category error:', error);
      return res.status(500).json({
        success: false,
        error: 'Server error',
        message: 'Unable to retrieve documents'
      });
    }
  }
);

// Get documents by pet and category
router.get('/pet/:petId/category/:category',
  validateRequest({ 
    params: z.object({ 
      petId: commonSchemas.id,
      category: z.enum(['veterinary_notes', 'diagnostic_reports_and_imaging', 'lab_results', 'vaccine_record'])
    })
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

      const { petId, category } = req.params;
      
      // Verify pet belongs to the authenticated user
      const pet = await prisma.pet.findFirst({
        where: {
          id: petId as string,
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
          petId: petId as string,
          category: category as string,
          pet: {
            ownerId: req.user!.id
          }
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
      
      return res.json({
        success: true,
        data: documents,
        message: 'Documents retrieved successfully'
      });
    } catch (error) {
      console.error('Get documents by pet and category error:', error);
      return res.status(500).json({
        success: false,
        error: 'Server error',
        message: 'Unable to retrieve documents'
      });
    }
  }
);

// Get documents for a specific pet
router.get('/pet/:petId',
  validateRequest({ params: z.object({ petId: commonSchemas.id }) }),
  async (req: Request, res: Response) => {
    try {
      const { petId } = req.params;
      
      // Verify pet belongs to the authenticated user
      const pet = await prisma.pet.findFirst({
        where: { 
          id: petId as string,
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
          petId: petId as string,
          pet: {
            ownerId: req.user!.id
          }
        },
        orderBy: { createdAt: 'desc' }
      });
      
      return res.json({
        success: true,
        data: documents,
        message: 'Documents retrieved successfully'
      });
    } catch (error) {
      console.error('Get pet documents error:', error);
      return res.status(500).json({
        success: false,
        error: 'Server error',
        message: 'Unable to retrieve documents'
      });
    }
  }
);

// Get a specific document by ID
router.get('/:id',
  validateRequest({ params: z.object({ id: commonSchemas.id }) }),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      const document = await prisma.document.findFirst({
        where: { 
          id: id as string,
          pet: {
            ownerId: req.user!.id
          }
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
      
      return res.json({
        success: true,
        data: document,
        message: 'Document retrieved successfully'
      });
    } catch (error) {
      console.error('Get document error:', error);
      return res.status(500).json({
        success: false,
        error: 'Server error',
        message: 'Unable to retrieve document'
      });
    }
  }
);

// Upload a new document
router.post('/upload',
  // Accept both 'document' and legacy 'file' field names
  upload.fields([{ name: 'document', maxCount: 1 }, { name: 'file', maxCount: 1 }]),
  async (req: Request, res: Response) => {
    try {
      console.log('📤 Upload request received');
      console.log('  User:', req.user?.id);
      // Normalize uploaded file regardless of field name
      const files: any = (req as any).files;
      const normalizedFile: Express.Multer.File | undefined = (req as any).file
        || (files?.document?.[0])
        || (files?.file?.[0]);
      if (normalizedFile && !(req as any).file) {
        (req as any).file = normalizedFile;
      }
      console.log('  File:', (req as any).file ? (req as any).file.originalname : 'NO FILE');
      console.log('  File details:', (req as any).file);
      console.log('  Body:', req.body);
      console.log('  Headers:', req.headers);
      
      if (!req.user) {
        console.log('❌ No user authenticated');
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
          message: 'Please log in to upload documents'
        });
      }

      // Check if file was uploaded
      if (!(req as any).file) {
        return res.status(400).json({
          success: false,
          error: 'No file uploaded',
          message: 'Please select a file to upload'
        });
      }

      const { category, petId, hospitalName, fileName: userFileName, date, notes } = req.body;
      console.log('  Category:', category);
      console.log('  PetId:', petId);
      console.log('  Hospital:', hospitalName);
      console.log('  FileName:', userFileName);
      console.log('  File details:', req.file);
      
      // If petId is provided, verify pet belongs to the user
      // Note: req.user is actually a PetOwner object from userSync
      let selectedPetId = petId;
      if (petId) {
        const petOwnerId = req.user!.id; // This is the PetOwner ID
        console.log('🔍 Pet lookup:', {
          petId,
          petOwnerId,
          clerkUserId: req.user!.clerkUserId,
          userObject: req.user
        });
        
        // First, verify the PetOwner exists and get their pets
        const petOwner = await prisma.petOwner.findUnique({
          where: { id: petOwnerId },
          include: { pets: true }
        });
        
        if (!petOwner) {
          console.error('❌ PetOwner not found:', petOwnerId);
          return res.status(500).json({
            success: false,
            error: 'Account error',
            message: 'Unable to verify pet ownership. Please try again.'
          });
        }
        
        console.log(`📋 PetOwner found with ${petOwner.pets.length} pets`);
        
        // Now check if the requested pet belongs to this PetOwner
        const pet = await prisma.pet.findFirst({
          where: {
            id: petId as string,
            ownerId: petOwnerId
          }
        });
        
        console.log('🔍 Pet lookup result:', pet ? { id: pet.id, name: pet.name } : 'NOT FOUND');
        
        if (!pet) {
          console.error('❌ Pet not found or does not belong to user:', {
            requestedPetId: petId,
            petOwnerId,
            availablePets: petOwner.pets.map(p => ({ id: p.id, name: p.name }))
          });
          return res.status(400).json({
            success: false,
            error: 'Invalid pet',
            message: 'Pet not found or does not belong to you'
          });
        }
      } else {
        // If no petId provided, get the user's first pet
        const petOwnerId = req.user!.id;
        const userPets = await prisma.pet.findMany({
          where: { ownerId: petOwnerId },
          take: 1
        });
        
        if (userPets.length > 0) {
          selectedPetId = userPets[0]!.id;
        } else {
          return res.status(400).json({
            success: false,
            error: 'No pets found',
            message: 'Please add a pet first before uploading documents'
          });
        }
      }
      
      // Get file path or S3 location
      let filePath: string;
      // The stored display name should prioritize the user's custom name (userFileName)
      let storedFileName: string;
      // Keep original name for logging only (not stored in DB to match schema)
      let originalFileName: string;
      
      const file = (req as any).file as any; // Type assertion for multer-s3
      
      if (useS3 && file.location) {
        // S3 upload
        filePath = file.location;
        originalFileName = file.originalname;
        storedFileName = (userFileName && String(userFileName).trim().length > 0)
          ? String(userFileName).trim()
          : (file.key.split('/').pop() || file.originalname);
      } else if (file.path) {
        // Local upload
        filePath = file.path;
        originalFileName = file.originalname;
        storedFileName = (userFileName && String(userFileName).trim().length > 0)
          ? String(userFileName).trim()
          : file.filename;
      } else {
        filePath = '';
        originalFileName = file.originalname;
        storedFileName = (userFileName && String(userFileName).trim().length > 0)
          ? String(userFileName).trim()
          : file.originalname;
      }

      // Persist only columns that exist in Prisma schema
      const documentData = {
        id: uuidv4(),
        petId: selectedPetId as string,
        category: String(category),
        fileName: storedFileName,
        filePath,
        fileSize: Number(file.size),
        mimeType: String(file.mimetype)
      } as const;
      
      console.log('📝 Creating document with data:', documentData);
      
      const newDocument = await prisma.document.create({
        data: documentData,
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
      
      console.log('✅ Document created successfully:', newDocument.id);
      console.log('✅ Document data:', newDocument);
      
      return res.status(201).json({
        success: true,
        data: newDocument,
        message: 'Document uploaded successfully'
      });
    } catch (error) {
      // Clean up uploaded file if document creation fails (only for local storage)
      if (req.file && !useS3 && 'path' in req.file) {
        try {
          await fs.unlink(req.file.path as string);
        } catch (unlinkError) {
          console.error('Error cleaning up uploaded file:', unlinkError);
        }
      }
      
      console.error('Upload document error:', error);
      return res.status(500).json({
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
    params: z.object({ id: commonSchemas.id }),
    body: z.object({
      category: z.enum(['veterinary_notes', 'diagnostic_reports_and_imaging', 'lab_results', 'vaccine_record']).optional(),
      hospitalName: z.string().min(1).optional(),
      fileName: z.string().min(1).optional(),
      date: z.string().datetime().optional(),
      notes: z.string().max(1000).optional()
    })
  }),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      // Check if document exists and belongs to user
      const existingDocument = await prisma.document.findFirst({
        where: { 
          id: id as string,
          pet: {
            ownerId: req.user!.id
          }
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
        where: { id: id as string },
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
      
      return res.json({
        success: true,
        data: updatedDocument,
        message: 'Document updated successfully'
      });
    } catch (error) {
      console.error('Update document error:', error);
      return res.status(500).json({
        success: false,
        error: 'Server error',
        message: 'Unable to update document'
      });
    }
  }
);

// Download a document
router.get('/download/:id',
  validateRequest({ params: z.object({ id: commonSchemas.id }) }),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const wantJson = req.query.json === '1' || (req.headers.accept || '').includes('application/json');
      
      // Check if document exists and belongs to user
      const document = await prisma.document.findFirst({
        where: { 
          id: id as string,
          pet: {
            ownerId: req.user!.id
          }
        }
      });
      
      if (!document) {
        return res.status(404).json({
          success: false,
          error: 'Document not found',
          message: 'The requested document does not exist or you do not have permission to access it'
        });
      }

      // Helper to presign using best-effort bucket/key detection
      const presignFromPath = async (rawPath: string) => {
        const lazyClient = s3Client || new S3Client({
          region: process.env.AWS_REGION || 'us-east-2',
          credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
          }
        });
        let key = rawPath.replace(/^\//, '');
        let bucket: string = s3BucketName || '';
        try {
          if (/^https?:\/\//.test(rawPath)) {
            const u = new URL(rawPath);
            key = u.pathname.replace(/^\//, '');
            // Try to derive bucket from host if env differs
            // e.g. spoodle-medical-records.s3.us-east-2.amazonaws.com
            const hostParts = u.hostname.split('.');
            if (hostParts.length >= 4 && hostParts[1] === 's3') {
              bucket = hostParts[0] || bucket;
            }
          }
        } catch {}
        const signed = await getSignedUrl(lazyClient, new GetObjectCommand({ Bucket: bucket, Key: key }), { expiresIn: 300 });
        return signed;
      };

      // If filePath is a full URL or S3 key/local path, handle both with presign for JSON
      if (wantJson) {
        try {
          const signed = await presignFromPath(document.filePath);
          return res.json({ success: true, data: { url: signed, fileName: document.fileName, fileSize: document.fileSize, mimeType: document.mimeType } });
        } catch (e) {
          console.error('Presign JSON failed:', e);
        }
      } else if ((useS3 && s3Client) || /^documents\//.test(document.filePath) || /^https?:\/\//.test(document.filePath)) {
        try {
          // For non-JSON, redirect to a presigned URL for S3 objects (key or full URL)
          const signed = await presignFromPath(document.filePath);
          res.setHeader('Content-Type', document.mimeType || 'application/octet-stream');
          res.setHeader('Content-Disposition', `inline; filename="${document.fileName}"`);
          return res.redirect(signed);
        } catch (s3Err) {
          console.error('S3 redirect presign failed:', s3Err);
        }
      }

      // Local filesystem fallback (legacy)
      if (!/^https?:\/\//.test(document.filePath)) {
        try {
          await fs.access(document.filePath);
          // Stream local file
          const getRes: any = await fs.readFile(document.filePath);
          // Forward headers and stream body
          res.setHeader('Content-Type', document.mimeType || 'application/octet-stream');
          res.setHeader('Content-Disposition', `inline; filename="${document.fileName}"`);
          return res.send(getRes);
        } catch (fsErr) {
          console.error('Local file send failed:', fsErr);
        }
      }

      // Local file storage: check if file exists
      try {
        await fs.access(document.filePath);
        
        // Set appropriate headers for file download
        res.setHeader('Content-Type', document.mimeType);
        res.setHeader('Content-Disposition', `inline; filename="${document.fileName}"`);
        res.setHeader('Content-Length', document.fileSize.toString());
        
        // Stream the file
        const fileStream = await fs.readFile(document.filePath);
        return res.send(fileStream);
        
      } catch (error) {
        console.error('File not found:', document.filePath);
        return res.status(404).json({
          success: false,
          error: 'File not found',
          message: 'The document file could not be found on the server'
        });
      }
    } catch (error) {
      console.error('Download document error:', error);
      return res.status(500).json({
        success: false,
        error: 'Server error',
        message: 'Unable to retrieve document download info'
      });
    }
  }
);

// Delete a document
router.delete('/:id',
  validateRequest({ params: z.object({ id: commonSchemas.id }) }),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      // Check if document exists and belongs to user
      const existingDocument = await prisma.document.findFirst({
        where: { 
          id: id as string,
          pet: {
            ownerId: req.user!.id
          }
        }
      });
      
      if (!existingDocument) {
        return res.status(404).json({
          success: false,
          error: 'Document not found',
          message: 'The requested document does not exist or you do not have permission to delete it'
        });
      }

      // Delete the file from S3 or filesystem
      try {
        if (useS3 && s3Client) {
          // S3 deletion - extract key from URL
          const url = new URL(existingDocument.filePath);
          const key = url.pathname.substring(1); // Remove leading /
          await s3Client.send(new DeleteObjectCommand({
            Bucket: s3BucketName,
            Key: key,
          }));
          console.log('✅ Deleted file from S3:', key);
        } else {
          // Local file deletion
          await fs.unlink(existingDocument.filePath);
          console.log('✅ Deleted file from local storage:', existingDocument.filePath);
        }
      } catch (fileError) {
        console.error('Error deleting file:', fileError);
        // Continue with database deletion even if file deletion fails
      }

      await prisma.document.delete({
        where: { id: id as string }
      });
      
      return res.json({
        success: true,
        message: 'Document deleted successfully'
      });
    } catch (error) {
      console.error('Delete document error:', error);
      return res.status(500).json({
        success: false,
        error: 'Server error',
        message: 'Unable to delete document'
      });
    }
  }
);

export default router;
