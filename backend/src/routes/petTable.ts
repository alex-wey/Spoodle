import { Router, Request, Response } from 'express';
import Joi from 'joi';
import db from '../database/crud/index.js';
import { Pet, User } from '../database/entities/index.js';
import { validateRequest, commonSchemas } from '../middleware/validation.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';

const router = Router();

// Apply optional authentication (allows viewing table without login for demo purposes)
router.use(optionalAuth);

// Get pet demographics table data
router.get('/',
  validateRequest({
    query: Joi.object({
      format: Joi.string().valid('table', 'json').default('json'),
      includeOwner: Joi.boolean().default(true),
      includeAge: Joi.boolean().default(true),
      includeWeight: Joi.boolean().default(true),
      includeAllergies: Joi.boolean().default(true),
      includeSpayNeuter: Joi.boolean().default(true),
      limit: Joi.number().integer().min(1).max(100).optional(),
      offset: Joi.number().integer().min(0).default(0)
    })
  }),
  async (req: Request, res: Response) => {
    try {
      const { 
        format, 
        includeOwner, 
        includeAge, 
        includeWeight, 
        includeAllergies, 
        includeSpayNeuter,
        limit,
        offset 
      } = req.query;

      // Get all pets
      let pets = await db.findAll<Pet>('pets');
      const users = await db.findAll<User>('users');
      
      // Create user lookup map
      const userMap = new Map(users.map(user => [user.petOwnerId, user]));
      
      // Calculate age from date of birth
      function calculateAge(dateOfBirth: string | undefined): string {
        if (!dateOfBirth) return 'N/A';
        const birth = new Date(dateOfBirth);
        const today = new Date();
        const ageInYears = Math.floor((today.getTime() - birth.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
        const ageInMonths = Math.floor((today.getTime() - birth.getTime()) / (30.44 * 24 * 60 * 60 * 1000));
        
        if (ageInYears >= 1) {
          return `${ageInYears} year${ageInYears > 1 ? 's' : ''}`;
        } else {
          return `${ageInMonths} month${ageInMonths > 1 ? 's' : ''}`;
        }
      }
      
      // Format weight
      function formatWeight(weight: number | undefined): string {
        if (!weight) return 'N/A';
        return `${weight} lbs`;
      }
      
      // Format allergies
      function formatAllergies(allergies: string[] | undefined): string {
        if (!allergies || allergies.length === 0) return 'None';
        return allergies.join(', ');
      }
      
      // Apply pagination if requested
      if (limit) {
        pets = pets.slice(offset as number, (offset as number) + (limit as number));
      }
      
      // Transform pets data
      const tableData = pets.map(pet => {
        const owner = userMap.get(pet.ownerId);
        const ownerName = owner ? owner.username : 'Unknown';
        
        const row: any = {
          petId: pet.petId,
          petName: pet.name || 'N/A',
          breed: pet.breed || 'Mixed',
          dateOfBirth: pet.dateOfBirth ? new Date(pet.dateOfBirth).toLocaleDateString() : 'N/A',
          gender: pet.gender || 'N/A'
        };
        
        if (includeOwner) {
          row.owner = ownerName;
        }
        
        if (includeAge) {
          row.age = calculateAge(pet.dateOfBirth);
        }
        
        if (includeWeight) {
          row.weight = formatWeight(pet.weight);
        }
        
        if (includeSpayNeuter) {
          row.spayedNeutered = pet.spayedNeutered ? 'Yes' : 'No';
        }
        
        if (includeAllergies) {
          row.allergies = formatAllergies(pet.allergies);
        }
        
        return row;
      });
      
      // Calculate summary statistics
      const allPets = await db.findAll<Pet>('pets');
      const genderCounts = allPets.reduce((acc, pet) => {
        const gender = pet.gender || 'Unknown';
        acc[gender] = (acc[gender] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const breedCounts = allPets.reduce((acc, pet) => {
        const breed = pet.breed || 'Mixed';
        acc[breed] = (acc[breed] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const totalWeight = allPets.reduce((sum, pet) => sum + (pet.weight || 0), 0);
      const avgWeight = allPets.length > 0 ? totalWeight / allPets.length : 0;
      
      const spayedNeuteredCount = allPets.filter(pet => pet.spayedNeutered).length;
      const petsWithAllergies = allPets.filter(pet => pet.allergies && pet.allergies.length > 0).length;
      
      const summary = {
        totalPets: allPets.length,
        averageWeight: parseFloat(avgWeight.toFixed(1)),
        genderDistribution: genderCounts,
        mostCommonBreeds: Object.entries(breedCounts)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 5)
          .map(([breed, count]) => ({ breed, count })),
        spayedNeuteredPercentage: parseFloat(((spayedNeuteredCount / allPets.length) * 100).toFixed(1)),
        petsWithAllergiesPercentage: parseFloat(((petsWithAllergies / allPets.length) * 100).toFixed(1))
      };
      
      if (format === 'table') {
        // Return formatted table for terminal display
        let tableOutput = '🐾 Pet Demographics Table\n';
        tableOutput += '='.repeat(120) + '\n';
        
        // Header
        const headers = ['Pet Name', 'Breed', 'Date of Birth'];
        if (includeOwner) headers.splice(1, 0, 'Owner');
        if (includeAge) headers.push('Age');
        headers.push('Gender');
        if (includeWeight) headers.push('Weight');
        if (includeSpayNeuter) headers.push('Spayed/Neutered');
        if (includeAllergies) headers.push('Allergies');
        
        tableOutput += headers.map(h => h.padEnd(15)).join('') + '\n';
        tableOutput += '-'.repeat(120) + '\n';
        
        // Data rows
        tableData.forEach(row => {
          const values = [row.petName, row.breed, row.dateOfBirth];
          if (includeOwner) values.splice(1, 0, row.owner);
          if (includeAge) values.push(row.age);
          values.push(row.gender);
          if (includeWeight) values.push(row.weight);
          if (includeSpayNeuter) values.push(row.spayedNeutered);
          if (includeAllergies) values.push(row.allergies);
          
          tableOutput += values.map(v => String(v).padEnd(15)).join('') + '\n';
        });
        
        tableOutput += '-'.repeat(120) + '\n';
        tableOutput += `\n📊 Total Pets: ${allPets.length}\n`;
        
        res.setHeader('Content-Type', 'text/plain');
        return res.send(tableOutput);
      }
      
      // Return JSON format
      res.json({
        success: true,
        data: {
          table: tableData,
          summary: summary,
          pagination: limit ? {
            offset: offset,
            limit: limit,
            total: allPets.length,
            hasMore: (offset as number) + (limit as number) < allPets.length
          } : null
        },
        message: `Retrieved ${tableData.length} pets with demographics`
      });
      
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Server error',
        message: 'Unable to retrieve pet table data'
      });
    }
  }
);

// Get pet table with specific filters
router.get('/filtered',
  validateRequest({
    query: Joi.object({
      breed: Joi.string().optional(),
      gender: Joi.string().valid('male', 'female').optional(),
      minAge: Joi.number().min(0).optional(),
      maxAge: Joi.number().min(0).optional(),
      minWeight: Joi.number().min(0).optional(),
      maxWeight: Joi.number().min(0).optional(),
      spayedNeutered: Joi.boolean().optional(),
      hasAllergies: Joi.boolean().optional()
    })
  }),
  async (req: Request, res: Response) => {
    try {
      const { breed, gender, minAge, maxAge, minWeight, maxWeight, spayedNeutered, hasAllergies } = req.query;
      
      let pets = await db.findAll<Pet>('pets');
      
      // Apply filters
      pets = pets.filter(pet => {
        if (breed && !pet.breed?.toLowerCase().includes((breed as string).toLowerCase())) {
          return false;
        }
        
        if (gender && pet.gender !== gender) {
          return false;
        }
        
        if (spayedNeutered !== undefined && pet.spayedNeutered !== spayedNeutered) {
          return false;
        }
        
        if (hasAllergies !== undefined) {
          const hasAllergiesValue = !!(pet.allergies && pet.allergies.length > 0);
          if (hasAllergiesValue !== hasAllergies) {
            return false;
          }
        }
        
        if (minWeight !== undefined && (pet.weight || 0) < (minWeight as number)) {
          return false;
        }
        
        if (maxWeight !== undefined && (pet.weight || 0) > (maxWeight as number)) {
          return false;
        }
        
        // Age filtering (approximate)
        if (minAge !== undefined || maxAge !== undefined) {
          if (pet.dateOfBirth) {
            const birth = new Date(pet.dateOfBirth);
            const today = new Date();
            const ageInYears = (today.getTime() - birth.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
            
            if (minAge !== undefined && ageInYears < (minAge as number)) {
              return false;
            }
            
            if (maxAge !== undefined && ageInYears > (maxAge as number)) {
              return false;
            }
          }
        }
        
        return true;
      });
      
      // Transform to table format (simplified)
      const tableData = pets.map(pet => ({
        petId: pet.petId,
        petName: pet.name || 'N/A',
        breed: pet.breed || 'Mixed',
        dateOfBirth: pet.dateOfBirth ? new Date(pet.dateOfBirth).toLocaleDateString() : 'N/A',
        gender: pet.gender || 'N/A',
        weight: pet.weight ? `${pet.weight} lbs` : 'N/A',
        spayedNeutered: pet.spayedNeutered ? 'Yes' : 'No',
        allergies: pet.allergies && pet.allergies.length > 0 ? pet.allergies.join(', ') : 'None'
      }));
      
      res.json({
        success: true,
        data: {
          table: tableData,
          filters: req.query,
          count: tableData.length
        },
        message: `Found ${tableData.length} pets matching filters`
      });
      
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Server error',
        message: 'Unable to filter pet table data'
      });
    }
  }
);

export default router;
