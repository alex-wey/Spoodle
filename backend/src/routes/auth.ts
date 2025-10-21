import { Router, Request, Response } from 'express';
import { AuthService } from '../services/auth.js';
import { validateRequest, validationSchemas } from '../middleware/validation.js';
import { authRateLimit } from '../middleware/rateLimiting.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// Apply rate limiting to all auth routes
router.use(authRateLimit);

// Register endpoint
router.post('/register', 
  validateRequest({ body: validationSchemas.register }),
  async (req: Request, res: Response) => {
    try {
      const result = await AuthService.register(req.body);
      
      res.status(201).json({
        success: true,
        data: result,
        message: 'User registered successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Registration failed',
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
      const result = await AuthService.login(req.body);
      
      res.json({
        success: true,
        data: result,
        message: 'Login successful'
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        error: error instanceof Error ? error.message : 'Login failed',
        message: 'Invalid credentials'
      });
    }
  }
);

// Refresh token endpoint
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: 'Refresh token required',
        message: 'Please provide a refresh token'
      });
    }

    const result = await AuthService.refreshToken(refreshToken);
    
    res.json({
      success: true,
      data: result,
      message: 'Token refreshed successfully'
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      error: error instanceof Error ? error.message : 'Token refresh failed',
      message: 'Invalid refresh token'
    });
  }
});

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

    const user = await AuthService.validateUser(req.user.petOwnerId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        message: 'User profile not found'
      });
    }

    // Remove password from response
    const { password, ...userProfile } = user;
    
    res.json({
      success: true,
      data: userProfile,
      message: 'Profile retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error',
      message: 'Unable to retrieve user profile'
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
