import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

export const validateRequest = (schema: {
  body?: Joi.ObjectSchema;
  query?: Joi.ObjectSchema;
  params?: Joi.ObjectSchema;
}) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const errors: string[] = [];

    // Validate body
    if (schema.body) {
      const { error } = schema.body.validate(req.body);
      if (error) {
        errors.push(`Body: ${error.details.map(d => d.message).join(', ')}`);
      }
    }

    // Validate query
    if (schema.query) {
      const { error } = schema.query.validate(req.query);
      if (error) {
        errors.push(`Query: ${error.details.map(d => d.message).join(', ')}`);
      }
    }

    // Validate params
    if (schema.params) {
      const { error } = schema.params.validate(req.params);
      if (error) {
        errors.push(`Params: ${error.details.map(d => d.message).join(', ')}`);
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        message: errors.join('; ')
      });
    }

    next();
  };
};

// Common validation schemas
export const commonSchemas = {
  id: Joi.string().required().messages({
    'string.empty': 'ID is required',
    'any.required': 'ID is required'
  }),
  
  pagination: {
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sortBy: Joi.string().optional(),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc')
  },

  dateRange: {
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().min(Joi.ref('startDate')).optional()
  },

  search: {
    q: Joi.string().min(1).max(100).optional(),
    type: Joi.string().optional()
  }
};

// Specific validation schemas for different entities
export const validationSchemas = {
  register: Joi.object({
    username: Joi.string().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).max(128).required(),
    phoneNumber: Joi.string().optional(),
    address: Joi.string().optional()
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),

  createPet: Joi.object({
    name: Joi.string().min(1).max(50).required(),
    breed: Joi.string().max(100).optional(),
    dateOfBirth: Joi.date().iso().optional(),
    gender: Joi.string().valid('male', 'female').optional(),
    spayedNeutered: Joi.boolean().optional(),
    weight: Joi.number().positive().optional(),
    allergies: Joi.array().items(Joi.string()).optional(),
    dietaryRestrictions: Joi.array().items(Joi.string()).optional()
  }),

  updatePet: Joi.object({
    name: Joi.string().min(1).max(50).optional(),
    breed: Joi.string().max(100).optional(),
    dateOfBirth: Joi.date().iso().optional(),
    gender: Joi.string().valid('male', 'female').optional(),
    spayedNeutered: Joi.boolean().optional(),
    weight: Joi.number().positive().optional(),
    allergies: Joi.array().items(Joi.string()).optional(),
    dietaryRestrictions: Joi.array().items(Joi.string()).optional()
  }),

  createAppointment: Joi.object({
    petId: Joi.string().required(),
    clinicId: Joi.string().required(),
    scheduledTime: Joi.date().iso().required(),
    appointmentType: Joi.string().valid(
      'general_exam', 'vaccination', 'dental', 'surgery', 'emergency', 'follow_up'
    ).required(),
    reason: Joi.string().max(500).optional(),
    notes: Joi.string().max(1000).optional()
  }),

  createTask: Joi.object({
    petId: Joi.string().required(),
    type: Joi.string().valid(
      'walk', 'feed', 'medicate', 'groom', 'training', 'checkup', 'other'
    ).required(),
    title: Joi.string().min(1).max(100).required(),
    description: Joi.string().max(500).optional(),
    scheduledTime: Joi.date().iso().required(),
    recurring: Joi.boolean().optional(),
    recurrencePattern: Joi.string().valid('daily', 'weekly', 'monthly').optional()
  })
};
