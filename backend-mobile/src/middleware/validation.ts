import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

// Common validation schemas
export const commonSchemas = {
  id: z.string().uuid('Invalid ID format'),
  email: z.string().email('Invalid email format'),
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  phone: z.string().optional(),
  date: z.string().datetime('Invalid date format').optional()
};

// Validation schemas
export const validationSchemas = {
  createPet: z.object({
    name: commonSchemas.name,
    species: z.string().min(1, 'Species is required'),
    breed: z.string().optional(),
    dateOfBirth: z.string().datetime('Invalid date format').optional(),
    biologicalSex: z.string().optional(),
    spayedNeutered: z.boolean().optional(),
    weight: z.number().positive().optional(),
    allergies: z.array(z.string()).optional(),
    dietaryRestrictions: z.array(z.string()).optional(),
    imageUrl: z.string().optional()
  }),
  
  updatePet: z.object({
    name: commonSchemas.name.optional(),
    species: z.string().min(1, 'Species is required').optional(),
    breed: z.string().optional(),
    dateOfBirth: z.string().optional(),
    biologicalSex: z.string().optional(),
    spayedNeutered: z.boolean().optional(),
    weight: z.number().positive().optional(),
    allergies: z.array(z.string()).optional(),
    dietaryRestrictions: z.array(z.string()).optional(),
    imageUrl: z.string().optional()
  }),
  
  createDocument: z.object({
    category: z.enum(['x_ray_documents', 'diagnostic_reports', 'blood_test_reports', 'vaccination_history']),
    petId: commonSchemas.id.optional(),
    hospitalName: z.string().min(1, 'Hospital name is required'),
    fileName: z.string().min(1, 'File name is required'),
    date: commonSchemas.date,
    notes: z.string().max(1000).optional()
  })
};

// Validation middleware
export const validateRequest = (schema: { body?: z.ZodSchema; params?: z.ZodSchema | Record<string, z.ZodSchema>; query?: z.ZodSchema }) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate body
      if (schema.body) {
        req.body = schema.body.parse(req.body);
      }
      
      // Validate params
      if (schema.params) {
        // If params is a plain object of schemas, convert it to a z.object schema
        const paramsSchema = schema.params instanceof z.ZodSchema 
          ? schema.params 
          : z.object(schema.params);
        req.params = paramsSchema.parse(req.params);
      }
      
      // Validate query
      if (schema.query) {
        req.query = schema.query.parse(req.query);
      }
      
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Validation error',
          message: 'Invalid request data',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }
      
      return next(error);
    }
  };
};
