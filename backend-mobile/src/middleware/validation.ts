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
    category: z.enum(['veterinary_notes', 'diagnostic_reports', 'lab_results', 'vaccination_records']),
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
        // Accept either a Zod schema (with a parse function) or a plain map of field schemas
        const maybeSchema: any = schema.params as any;
        
        // Check if it's already a Zod schema by checking for parse method
        const isZodSchema = maybeSchema && typeof maybeSchema.parse === 'function';
        
        const paramsSchema = isZodSchema
          ? (maybeSchema as z.ZodTypeAny)
          : z.object(schema.params as Record<string, z.ZodSchema<any>>);
        
        console.log('🔍 [Validation] Validating params:', {
          receivedParams: req.params,
          paramsSchemaType: isZodSchema ? 'ZodSchema' : 'PlainObject',
          paramsKeys: Object.keys(req.params || {}),
          categoryValue: req.params?.category
        });
        
        try {
          const validatedParams = paramsSchema.parse(req.params);
          req.params = validatedParams as any; // Type assertion needed for Express
          console.log('✅ [Validation] Params validated successfully:', validatedParams);
        } catch (parseError) {
          console.error('❌ [Validation] Params validation failed:', {
            receivedParams: req.params,
            paramsType: typeof req.params,
            categoryValue: req.params?.category,
            categoryType: typeof req.params?.category,
            error: parseError instanceof Error ? parseError.message : parseError,
            zodErrorDetails: parseError instanceof z.ZodError ? parseError.errors : 'Not a ZodError'
          });
          throw parseError;
        }
      }
      
      // Validate query
      if (schema.query) {
        req.query = schema.query.parse(req.query);
      }
      
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error('❌ [Validation] Zod validation error:', {
          errors: error.errors.map(err => ({
            path: err.path.join('.'),
            message: err.message,
            code: err.code
          })),
          receivedData: {
            params: req.params,
            query: req.query,
            body: req.body
          }
        });
        
        return res.status(400).json({
          success: false,
          error: 'Validation error',
          message: error.errors.length > 0 
            ? error.errors[0]!.message 
            : 'Invalid request data',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
            code: err.code
          }))
        });
      }
      
      return next(error);
    }
  };
};
