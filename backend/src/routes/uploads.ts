import { Router, Request, Response } from 'express';
import * as path from 'path';
import * as fs from 'fs/promises';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// Apply authentication to all upload routes
router.use(authenticateToken);

// Serve uploaded files
router.get('/:filename', async (req: Request, res: Response) => {
  try {
    const { filename } = req.params;
    
    // Validate filename to prevent directory traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({
        success: false,
        error: 'Invalid filename',
        message: 'Invalid file path'
      });
    }

    const uploadDir = process.env.UPLOAD_DIR || './uploads';
    const filePath = path.join(uploadDir, filename);
    
    // Check if file exists
    try {
      await fs.access(filePath);
    } catch {
      return res.status(404).json({
        success: false,
        error: 'File not found',
        message: 'The requested file does not exist'
      });
    }

    // Set appropriate headers
    const ext = path.extname(filename).toLowerCase();
    const mimeTypes: Record<string, string> = {
      '.pdf': 'application/pdf',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    };

    const mimeType = mimeTypes[ext] || 'application/octet-stream';
    res.setHeader('Content-Type', mimeType);
    
    // For images and PDFs, allow inline viewing
    if (['.jpg', '.jpeg', '.png', '.pdf'].includes(ext)) {
      res.setHeader('Content-Disposition', 'inline');
    } else {
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    }

    // Stream the file
    const fileStream = await fs.readFile(filePath);
    res.send(fileStream);
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error',
      message: 'Unable to serve file'
    });
  }
});

export default router;
