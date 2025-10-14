import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import Joi from 'joi';
import db from '../database/crud/index.js';
import { Appointment, CreateAppointmentRequest, Pet, Clinic } from '../database/entities/index.js';
import { validateRequest, validationSchemas, commonSchemas } from '../middleware/validation.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// Apply authentication to all appointment routes
router.use(authenticateToken);

// Get all appointments for the authenticated user
router.get('/', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: 'Please log in to view appointments'
      });
    }

    const appointments = await db.getAppointmentsByOwner(req.user.petOwnerId);
    
    // Sort by scheduled time (most recent first)
    appointments.sort((a, b) => new Date(b.scheduledTime).getTime() - new Date(a.scheduledTime).getTime());
    
    res.json({
      success: true,
      data: appointments,
      message: 'Appointments retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error',
      message: 'Unable to retrieve appointments'
    });
  }
});

// Get appointments for a specific date range
router.get('/schedule',
  validateRequest({ 
    query: Joi.object({
      startDate: Joi.date().iso().required(),
      endDate: Joi.date().iso().min(Joi.ref('startDate')).required()
    })
  }),
  async (req: Request, res: Response) => {
    try {
      const { startDate, endDate } = req.query;
      
      const appointments = await db.getAppointmentsByOwner(req.user!.petOwnerId);
      
      // Filter by date range
      const filteredAppointments = appointments.filter(apt => {
        const aptDate = new Date(apt.scheduledTime);
        const start = new Date(startDate as string);
        const end = new Date(endDate as string);
        return aptDate >= start && aptDate <= end;
      });
      
      res.json({
        success: true,
        data: filteredAppointments,
        message: 'Schedule retrieved successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Server error',
        message: 'Unable to retrieve schedule'
      });
    }
  }
);

// Get a specific appointment by ID
router.get('/:id',
  validateRequest({ params: Joi.object({ id: commonSchemas.id }) }),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      const appointment = await db.findById<Appointment>('appointments', id);
      
      if (!appointment) {
        return res.status(404).json({
          success: false,
          error: 'Appointment not found',
          message: 'The requested appointment does not exist'
        });
      }

      // Verify appointment belongs to the authenticated user
      if (appointment.petOwnerId !== req.user?.petOwnerId) {
        return res.status(403).json({
          success: false,
          error: 'Access denied',
          message: 'You do not have permission to view this appointment'
        });
      }
      
      res.json({
        success: true,
        data: appointment,
        message: 'Appointment retrieved successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Server error',
        message: 'Unable to retrieve appointment'
      });
    }
  }
);

// Create a new appointment
router.post('/',
  validateRequest({ body: validationSchemas.createAppointment }),
  async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
          message: 'Please log in to create appointments'
        });
      }

      const appointmentData: CreateAppointmentRequest = req.body;
      
      // Verify pet belongs to the user
      const pet = await db.findById<Pet>('pets', appointmentData.petId);
      if (!pet || pet.ownerId !== req.user.petOwnerId) {
        return res.status(400).json({
          success: false,
          error: 'Invalid pet',
          message: 'Pet not found or does not belong to you'
        });
      }

      // Verify clinic exists
      const clinic = await db.findById<Clinic>('clinics', appointmentData.clinicId);
      if (!clinic) {
        return res.status(400).json({
          success: false,
          error: 'Invalid clinic',
          message: 'Clinic not found'
        });
      }

      // Check for conflicting appointments (basic check)
      const existingAppointments = await db.getAppointmentsByOwner(req.user.petOwnerId);
      const scheduledTime = new Date(appointmentData.scheduledTime);
      
      const hasConflict = existingAppointments.some(apt => {
        const aptTime = new Date(apt.scheduledTime);
        const timeDiff = Math.abs(scheduledTime.getTime() - aptTime.getTime());
        return timeDiff < 30 * 60 * 1000; // 30 minutes
      });

      if (hasConflict) {
        return res.status(400).json({
          success: false,
          error: 'Scheduling conflict',
          message: 'You already have an appointment scheduled around this time'
        });
      }
      
      const newAppointment = await db.createAppointment({
        appointmentId: uuidv4(),
        petOwnerId: req.user.petOwnerId,
        petId: appointmentData.petId,
        clinicId: appointmentData.clinicId,
        scheduledTime: appointmentData.scheduledTime,
        appointmentType: appointmentData.appointmentType,
        reason: appointmentData.reason,
        notes: appointmentData.notes,
        status: 'pending'
      });
      
      res.status(201).json({
        success: true,
        data: newAppointment,
        message: 'Appointment created successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Server error',
        message: 'Unable to create appointment'
      });
    }
  }
);

// Update an appointment
router.put('/:id',
  validateRequest({ 
    params: Joi.object({ id: commonSchemas.id }),
    body: Joi.object({
      scheduledTime: Joi.date().iso().optional(),
      appointmentType: Joi.string().valid(
        'general_exam', 'vaccination', 'dental', 'surgery', 'emergency', 'follow_up'
      ).optional(),
      reason: Joi.string().max(500).optional(),
      notes: Joi.string().max(1000).optional(),
      status: Joi.string().valid(
        'pending', 'confirmed', 'in_progress', 'completed', 'cancelled'
      ).optional()
    })
  }),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      // Check if appointment exists and belongs to user
      const existingAppointment = await db.findById<Appointment>('appointments', id);
      
      if (!existingAppointment) {
        return res.status(404).json({
          success: false,
          error: 'Appointment not found',
          message: 'The requested appointment does not exist'
        });
      }

      if (existingAppointment.petOwnerId !== req.user?.petOwnerId) {
        return res.status(403).json({
          success: false,
          error: 'Access denied',
          message: 'You do not have permission to update this appointment'
        });
      }

      const updatedAppointment = await db.update<Appointment>('appointments', id, req.body);
      
      if (!updatedAppointment) {
        return res.status(500).json({
          success: false,
          error: 'Update failed',
          message: 'Unable to update appointment'
        });
      }
      
      res.json({
        success: true,
        data: updatedAppointment,
        message: 'Appointment updated successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Server error',
        message: 'Unable to update appointment'
      });
    }
  }
);

// Cancel an appointment
router.patch('/:id/cancel',
  validateRequest({ params: Joi.object({ id: commonSchemas.id }) }),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      // Check if appointment exists and belongs to user
      const existingAppointment = await db.findById<Appointment>('appointments', id);
      
      if (!existingAppointment) {
        return res.status(404).json({
          success: false,
          error: 'Appointment not found',
          message: 'The requested appointment does not exist'
        });
      }

      if (existingAppointment.petOwnerId !== req.user?.petOwnerId) {
        return res.status(403).json({
          success: false,
          error: 'Access denied',
          message: 'You do not have permission to cancel this appointment'
        });
      }

      // Only allow cancellation of pending or confirmed appointments
      if (!['pending', 'confirmed'].includes(existingAppointment.status)) {
        return res.status(400).json({
          success: false,
          error: 'Cannot cancel appointment',
          message: 'Only pending or confirmed appointments can be cancelled'
        });
      }

      const updatedAppointment = await db.update<Appointment>('appointments', id, {
        status: 'cancelled'
      });
      
      res.json({
        success: true,
        data: updatedAppointment,
        message: 'Appointment cancelled successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Server error',
        message: 'Unable to cancel appointment'
      });
    }
  }
);

// Delete an appointment
router.delete('/:id',
  validateRequest({ params: Joi.object({ id: commonSchemas.id }) }),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      // Check if appointment exists and belongs to user
      const existingAppointment = await db.findById<Appointment>('appointments', id);
      
      if (!existingAppointment) {
        return res.status(404).json({
          success: false,
          error: 'Appointment not found',
          message: 'The requested appointment does not exist'
        });
      }

      if (existingAppointment.petOwnerId !== req.user?.petOwnerId) {
        return res.status(403).json({
          success: false,
          error: 'Access denied',
          message: 'You do not have permission to delete this appointment'
        });
      }

      const deleted = await db.delete('appointments', id);
      
      if (!deleted) {
        return res.status(500).json({
          success: false,
          error: 'Delete failed',
          message: 'Unable to delete appointment'
        });
      }
      
      res.json({
        success: true,
        message: 'Appointment deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Server error',
        message: 'Unable to delete appointment'
      });
    }
  }
);

export default router;
