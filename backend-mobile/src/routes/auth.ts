import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../index.js';
import { validateRequest, validationSchemas } from '../middleware/validation.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// Register endpoint
router.post('/register', 
  validateRequest({ body: validationSchemas.register }),
  async (req: Request, res: Response) => {
    try {
      const { email, firstName, lastName, password, phone } = req.body;
      
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });
      
      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: 'User already exists',
          message: 'An account with this email already exists'
        });
      }
      
      // Hash password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      
      // Create user
      const user = await prisma.user.create({
        data: {
          id: uuidv4(),
          email,
          firstName,
          lastName,
          password: hashedPassword,
          phone
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          createdAt: true
        }
      });
      
      // Generate JWT token
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        throw new Error('JWT_SECRET not configured');
      }
      
      const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        jwtSecret,
        { expiresIn }
      );
      
      res.status(201).json({
        success: true,
        data: {
          user,
          token
        },
        message: 'User registered successfully'
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        error: 'Registration failed',
        message: 'Unable to create user account'
      });
    }
  }
);

// Login endpoint
router.post('/login',
  validateRequest({ body: validationSchemas.login }),
  async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      
      // Find user
      const user = await prisma.user.findUnique({
        where: { email }
      });
      
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials',
          message: 'Email or password is incorrect'
        });
      }
      
      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials',
          message: 'Email or password is incorrect'
        });
      }
      
      // Generate JWT token
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        throw new Error('JWT_SECRET not configured');
      }
      
      const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        jwtSecret,
        { expiresIn }
      );
      
      // Return user data without password
      const { password: _, ...userWithoutPassword } = user;
      
      res.json({
        success: true,
        data: {
          user: userWithoutPassword,
          token
        },
        message: 'Login successful'
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        error: 'Login failed',
        message: 'Unable to authenticate user'
      });
    }
  }
);

// Get current user profile
router.get('/me', authenticateToken, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: 'Please log in to access your profile'
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        address: true,
        createdAt: true,
        updatedAt: true
      }
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        message: 'User profile not found'
      });
    }
    
    res.json({
      success: true,
      data: user,
      message: 'Profile retrieved successfully'
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error',
      message: 'Unable to retrieve user profile'
    });
  }
});

// Update user profile
router.put('/me', authenticateToken, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: 'Please log in to update your profile'
      });
    }

    const { firstName, lastName, phone, address } = req.body;
    
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(phone !== undefined && { phone }),
        ...(address !== undefined && { address })
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        address: true,
        createdAt: true,
        updatedAt: true
      }
    });
    
    res.json({
      success: true,
      data: updatedUser,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error',
      message: 'Unable to update user profile'
    });
  }
});

// Delete account endpoint
router.delete('/me', authenticateToken, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: 'Please log in to delete your account'
      });
    }

    console.log(`🗑️ Starting complete account deletion for user: ${req.user.id}`);

    // Delete all user-related data in the correct order to respect foreign key constraints
    // 1. Delete bug reports
    await prisma.bugReport.deleteMany({
      where: { petOwnerId: req.user.id }
    });
    console.log('✅ Deleted bug reports');

    // 2. Delete medical records
    await prisma.medical_records.deleteMany({
      where: { ownerId: req.user.id }
    });
    console.log('✅ Deleted medical records');

    // 3. Delete appointments
    await prisma.appointments.deleteMany({
      where: { 
        pets: {
          ownerId: req.user.id
        }
      }
    });
    console.log('✅ Deleted appointments');

    // 4. Delete documents
    await prisma.document.deleteMany({
      where: { ownerId: req.user.id }
    });
    console.log('✅ Deleted documents');

    // 5. Delete tasks
    await prisma.task.deleteMany({
      where: { ownerId: req.user.id }
    });
    console.log('✅ Deleted tasks');

    // 6. Delete pets (this will cascade delete related data due to foreign key constraints)
    await prisma.pet.deleteMany({
      where: { ownerId: req.user.id }
    });
    console.log('✅ Deleted pets');

    // 7. Delete pet_owners record if it exists
    await prisma.pet_owners.deleteMany({
      where: { id: req.user.id }
    });
    console.log('✅ Deleted pet_owners record');

    // 8. Finally, delete the user
    await prisma.user.delete({
      where: { id: req.user.id }
    });
    console.log('✅ Deleted user account');

    console.log(`🎉 Complete account deletion successful for user: ${req.user.id}`);
    
    res.json({
      success: true,
      message: 'Account and all related data deleted successfully'
    });
  } catch (error) {
    console.error('❌ Delete account error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error',
      message: 'Unable to delete account. Please try again or contact support.'
    });
  }
});

// Logout endpoint (client-side token removal)
router.post('/logout', authenticateToken, async (req: Request, res: Response) => {
  // In a more sophisticated setup, you'd maintain a blacklist of tokens
  // For now, we'll just return success and let the client handle token removal
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

export default router;
