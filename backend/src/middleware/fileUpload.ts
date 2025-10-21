import multer from 'multer';
import * as path from 'path';
import * as fs from 'fs/promises';
import { Request } from 'express';

// Ensure upload directory exists
const uploadDir = process.env.UPLOAD_DIR || './uploads';
const maxFileSize = parseInt(process.env.MAX_FILE_SIZE || '10485760'); // 10MB
const allowedTypes = (process.env.ALLOWED_FILE_TYPES || 'pdf,jpg,jpeg,png,doc,docx').split(',');

// Create upload directory if it doesn't exist
async function ensureUploadDir() {
  try {
    await fs.mkdir(uploadDir, { recursive: true });
  } catch (error) {
    console.error('Failed to create upload directory:', error);
  }
}

// Initialize upload directory
ensureUploadDir();

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp and random string
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, extension);
    const sanitizedName = baseName.replace(/[^a-zA-Z0-9]/g, '_');
    cb(null, `${sanitizedName}-${uniqueSuffix}${extension}`);
  }
});

// File filter function
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const fileExtension = path.extname(file.originalname).toLowerCase().slice(1);
  
  if (allowedTypes.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(new Error(`File type .${fileExtension} is not allowed. Allowed types: ${allowedTypes.join(', ')}`));
  }
};

// Create multer instance
const upload = multer({
  storage: storage,
  limits: {
    fileSize: maxFileSize,
    files: 10 // Maximum 10 files per request
  },
  fileFilter: fileFilter
});

// Middleware for single file upload
export const uploadSingle = (fieldName: string) => {
  return upload.single(fieldName);
};

// Middleware for multiple file upload
export const uploadMultiple = (fieldName: string, maxCount: number = 5) => {
  return upload.array(fieldName, maxCount);
};

// Error handling middleware for file uploads
export const handleUploadError = (error: any, req: Request, res: any, next: any) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File too large',
        message: `File size exceeds the limit of ${maxFileSize / 1024 / 1024}MB`
      });
    } else if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        error: 'Too many files',
        message: 'Too many files uploaded in a single request'
      });
    } else if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        error: 'Unexpected file field',
        message: 'Unexpected file field name'
      });
    }
  } else if (error.message && error.message.includes('not allowed')) {
    return res.status(400).json({
      success: false,
      error: 'Invalid file type',
      message: error.message
    });
  }
  
  next(error);
};

// Utility function to delete file
export const deleteFile = async (filePath: string): Promise<boolean> => {
  try {
    await fs.unlink(filePath);
    return true;
  } catch (error) {
    console.error('Failed to delete file:', error);
    return false;
  }
};

// Utility function to get file URL
export const getFileUrl = (filename: string): string => {
  return `/uploads/${filename}`;
};
