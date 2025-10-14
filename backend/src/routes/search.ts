import { Router, Request, Response } from 'express';
import Joi from 'joi';
import db from '../database/crud/index.js';
import { Pet, Appointment, Task, MedicalRecord } from '../database/entities/index.js';
import { validateRequest, commonSchemas } from '../middleware/validation.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// Apply authentication to all search routes
router.use(authenticateToken);

// Global search across all entities
router.get('/',
  validateRequest({
    query: Joi.object({
      q: Joi.string().min(1).max(100).required(),
      type: Joi.string().valid('all', 'pets', 'appointments', 'tasks', 'records').default('all'),
      limit: Joi.number().integer().min(1).max(50).default(20)
    })
  }),
  async (req: Request, res: Response) => {
    try {
      const { q, type, limit } = req.query;
      const searchTerm = (q as string).toLowerCase();
      const results: any = {
        pets: [],
        appointments: [],
        tasks: [],
        records: []
      };

      // Get user's pets first to filter all searches
      const userPets = await db.getPetsByOwner(req.user!.petOwnerId);
      const petIds = userPets.map(pet => pet.petId);

      // Search pets
      if (type === 'all' || type === 'pets') {
        const pets = userPets.filter(pet => 
          pet.name.toLowerCase().includes(searchTerm) ||
          (pet.breed && pet.breed.toLowerCase().includes(searchTerm))
        );
        results.pets = pets.slice(0, limit as number);
      }

      // Search appointments
      if (type === 'all' || type === 'appointments') {
        const allAppointments = await db.getAppointmentsByOwner(req.user!.petOwnerId);
        const appointments = allAppointments.filter(apt => 
          apt.appointmentType.toLowerCase().includes(searchTerm) ||
          (apt.reason && apt.reason.toLowerCase().includes(searchTerm)) ||
          (apt.notes && apt.notes.toLowerCase().includes(searchTerm))
        );
        results.appointments = appointments.slice(0, limit as number);
      }

      // Search tasks
      if (type === 'all' || type === 'tasks') {
        const allTasks: Task[] = [];
        for (const petId of petIds) {
          const petTasks = await db.getTasksByPet(petId);
          allTasks.push(...petTasks);
        }
        
        const tasks = allTasks.filter(task => 
          task.title.toLowerCase().includes(searchTerm) ||
          (task.description && task.description.toLowerCase().includes(searchTerm)) ||
          task.type.toLowerCase().includes(searchTerm)
        );
        results.tasks = tasks.slice(0, limit as number);
      }

      // Search medical records
      if (type === 'all' || type === 'records') {
        const allRecords: MedicalRecord[] = [];
        for (const petId of petIds) {
          const petRecords = await db.getMedicalRecordsByPet(petId);
          allRecords.push(...petRecords);
        }
        
        const records = allRecords.filter(record => 
          record.fileName.toLowerCase().includes(searchTerm) ||
          (record.description && record.description.toLowerCase().includes(searchTerm)) ||
          record.fileType.toLowerCase().includes(searchTerm)
        );
        results.records = records.slice(0, limit as number);
      }

      // Calculate total results
      const totalResults = results.pets.length + results.appointments.length + results.tasks.length + results.records.length;

      res.json({
        success: true,
        data: {
          query: q,
          type: type,
          results: results,
          total: totalResults,
          hasMore: totalResults >= (limit as number)
        },
        message: `Found ${totalResults} results for "${q}"`
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Server error',
        message: 'Unable to perform search'
      });
    }
  }
);

// Search pets specifically
router.get('/pets',
  validateRequest({
    query: Joi.object({
      q: Joi.string().min(1).max(100).required(),
      breed: Joi.string().optional(),
      gender: Joi.string().valid('male', 'female').optional(),
      limit: Joi.number().integer().min(1).max(50).default(20)
    })
  }),
  async (req: Request, res: Response) => {
    try {
      const { q, breed, gender, limit } = req.query;
      const searchTerm = (q as string).toLowerCase();
      
      const userPets = await db.getPetsByOwner(req.user!.petOwnerId);
      
      let filteredPets = userPets.filter(pet => 
        pet.name.toLowerCase().includes(searchTerm) ||
        (pet.breed && pet.breed.toLowerCase().includes(searchTerm))
      );

      // Apply additional filters
      if (breed) {
        filteredPets = filteredPets.filter(pet => 
          pet.breed && pet.breed.toLowerCase().includes((breed as string).toLowerCase())
        );
      }

      if (gender) {
        filteredPets = filteredPets.filter(pet => pet.gender === gender);
      }

      const results = filteredPets.slice(0, limit as number);

      res.json({
        success: true,
        data: {
          query: q,
          filters: { breed, gender },
          results: results,
          total: results.length
        },
        message: `Found ${results.length} pets matching "${q}"`
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Server error',
        message: 'Unable to search pets'
      });
    }
  }
);

// Search appointments specifically
router.get('/appointments',
  validateRequest({
    query: Joi.object({
      q: Joi.string().min(1).max(100).required(),
      status: Joi.string().valid('pending', 'confirmed', 'in_progress', 'completed', 'cancelled').optional(),
      type: Joi.string().valid('general_exam', 'vaccination', 'dental', 'surgery', 'emergency', 'follow_up').optional(),
      startDate: Joi.date().iso().optional(),
      endDate: Joi.date().iso().min(Joi.ref('startDate')).optional(),
      limit: Joi.number().integer().min(1).max(50).default(20)
    })
  }),
  async (req: Request, res: Response) => {
    try {
      const { q, status, type, startDate, endDate, limit } = req.query;
      const searchTerm = (q as string).toLowerCase();
      
      const allAppointments = await db.getAppointmentsByOwner(req.user!.petOwnerId);
      
      let filteredAppointments = allAppointments.filter(apt => 
        apt.appointmentType.toLowerCase().includes(searchTerm) ||
        (apt.reason && apt.reason.toLowerCase().includes(searchTerm)) ||
        (apt.notes && apt.notes.toLowerCase().includes(searchTerm))
      );

      // Apply additional filters
      if (status) {
        filteredAppointments = filteredAppointments.filter(apt => apt.status === status);
      }

      if (type) {
        filteredAppointments = filteredAppointments.filter(apt => apt.appointmentType === type);
      }

      if (startDate || endDate) {
        filteredAppointments = filteredAppointments.filter(apt => {
          const aptDate = new Date(apt.scheduledTime);
          if (startDate && aptDate < new Date(startDate as string)) return false;
          if (endDate && aptDate > new Date(endDate as string)) return false;
          return true;
        });
      }

      const results = filteredAppointments.slice(0, limit as number);

      res.json({
        success: true,
        data: {
          query: q,
          filters: { status, type, startDate, endDate },
          results: results,
          total: results.length
        },
        message: `Found ${results.length} appointments matching "${q}"`
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Server error',
        message: 'Unable to search appointments'
      });
    }
  }
);

// Search tasks specifically
router.get('/tasks',
  validateRequest({
    query: Joi.object({
      q: Joi.string().min(1).max(100).required(),
      type: Joi.string().valid('walk', 'feed', 'medicate', 'groom', 'training', 'checkup', 'other').optional(),
      completed: Joi.boolean().optional(),
      startDate: Joi.date().iso().optional(),
      endDate: Joi.date().iso().min(Joi.ref('startDate')).optional(),
      limit: Joi.number().integer().min(1).max(50).default(20)
    })
  }),
  async (req: Request, res: Response) => {
    try {
      const { q, type, completed, startDate, endDate, limit } = req.query;
      const searchTerm = (q as string).toLowerCase();
      
      const userPets = await db.getPetsByOwner(req.user!.petOwnerId);
      const petIds = userPets.map(pet => pet.petId);
      
      const allTasks: Task[] = [];
      for (const petId of petIds) {
        const petTasks = await db.getTasksByPet(petId);
        allTasks.push(...petTasks);
      }
      
      let filteredTasks = allTasks.filter(task => 
        task.title.toLowerCase().includes(searchTerm) ||
        (task.description && task.description.toLowerCase().includes(searchTerm)) ||
        task.type.toLowerCase().includes(searchTerm)
      );

      // Apply additional filters
      if (type) {
        filteredTasks = filteredTasks.filter(task => task.type === type);
      }

      if (completed !== undefined) {
        filteredTasks = filteredTasks.filter(task => task.completionStatus === completed);
      }

      if (startDate || endDate) {
        filteredTasks = filteredTasks.filter(task => {
          const taskDate = new Date(task.scheduledTime);
          if (startDate && taskDate < new Date(startDate as string)) return false;
          if (endDate && taskDate > new Date(endDate as string)) return false;
          return true;
        });
      }

      const results = filteredTasks.slice(0, limit as number);

      res.json({
        success: true,
        data: {
          query: q,
          filters: { type, completed, startDate, endDate },
          results: results,
          total: results.length
        },
        message: `Found ${results.length} tasks matching "${q}"`
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Server error',
        message: 'Unable to search tasks'
      });
    }
  }
);

// Search medical records specifically
router.get('/records',
  validateRequest({
    query: Joi.object({
      q: Joi.string().min(1).max(100).required(),
      fileType: Joi.string().valid('medical_history', 'vaccination', 'medication', 'surgical', 'diagnostic', 'blood_work', 'x_ray').optional(),
      startDate: Joi.date().iso().optional(),
      endDate: Joi.date().iso().min(Joi.ref('startDate')).optional(),
      limit: Joi.number().integer().min(1).max(50).default(20)
    })
  }),
  async (req: Request, res: Response) => {
    try {
      const { q, fileType, startDate, endDate, limit } = req.query;
      const searchTerm = (q as string).toLowerCase();
      
      const userPets = await db.getPetsByOwner(req.user!.petOwnerId);
      const petIds = userPets.map(pet => pet.petId);
      
      const allRecords: MedicalRecord[] = [];
      for (const petId of petIds) {
        const petRecords = await db.getMedicalRecordsByPet(petId);
        allRecords.push(...petRecords);
      }
      
      let filteredRecords = allRecords.filter(record => 
        record.fileName.toLowerCase().includes(searchTerm) ||
        (record.description && record.description.toLowerCase().includes(searchTerm)) ||
        record.fileType.toLowerCase().includes(searchTerm)
      );

      // Apply additional filters
      if (fileType) {
        filteredRecords = filteredRecords.filter(record => record.fileType === fileType);
      }

      if (startDate || endDate) {
        filteredRecords = filteredRecords.filter(record => {
          const recordDate = new Date(record.uploadDate);
          if (startDate && recordDate < new Date(startDate as string)) return false;
          if (endDate && recordDate > new Date(endDate as string)) return false;
          return true;
        });
      }

      const results = filteredRecords.slice(0, limit as number);

      res.json({
        success: true,
        data: {
          query: q,
          filters: { fileType, startDate, endDate },
          results: results,
          total: results.length
        },
        message: `Found ${results.length} medical records matching "${q}"`
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Server error',
        message: 'Unable to search medical records'
      });
    }
  }
);

export default router;
