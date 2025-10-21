import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import db from '../database/crud/index.js';
import { User, RegisterRequest, LoginRequest, AuthResponse, AuthUser } from '../database/entities/index.js';

export class AuthService {
  private static readonly SALT_ROUNDS = 12;

  static async register(userData: RegisterRequest): Promise<AuthResponse> {
    // Check if user already exists
    const existingUsers = await db.findAll<User>('users');
    const existingUser = existingUsers.find(user => user.email === userData.email);
    
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Check if username is taken
    const usernameExists = existingUsers.find(user => user.username === userData.username);
    if (usernameExists) {
      throw new Error('Username is already taken');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, this.SALT_ROUNDS);

    // Create user
    const newUser = await db.createUser({
      petOwnerId: uuidv4(),
      username: userData.username,
      email: userData.email,
      phoneNumber: userData.phoneNumber,
      address: userData.address,
      password: hashedPassword // Note: This field isn't in the User interface, we'll need to extend it
    });

    // Generate tokens
    const tokens = this.generateTokens({
      petOwnerId: newUser.petOwnerId,
      email: newUser.email,
      username: newUser.username
    });

    return {
      user: {
        petOwnerId: newUser.petOwnerId,
        email: newUser.email,
        username: newUser.username
      },
      token: tokens.accessToken,
      refreshToken: tokens.refreshToken
    };
  }

  static async login(credentials: LoginRequest): Promise<AuthResponse> {
    // Find user by email
    const users = await db.findAll<User>('users');
    const user = users.find(u => u.email === credentials.email);

    if (!user) {
      throw new Error('Invalid email or password');
    }

    // For now, we'll need to extend our User interface to include password
    // This is a temporary solution - in production, you'd have a separate auth table
    const userWithPassword = user as User & { password?: string };

    if (!userWithPassword.password) {
      throw new Error('User account not properly configured');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(credentials.password, userWithPassword.password);
    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }

    // Generate tokens
    const tokens = this.generateTokens({
      petOwnerId: user.petOwnerId,
      email: user.email,
      username: user.username
    });

    return {
      user: {
        petOwnerId: user.petOwnerId,
        email: user.email,
        username: user.username
      },
      token: tokens.accessToken,
      refreshToken: tokens.refreshToken
    };
  }

  static async refreshToken(refreshToken: string): Promise<{ token: string }> {
    const refreshSecret = process.env.REFRESH_TOKEN_SECRET;
    if (!refreshSecret) {
      throw new Error('Refresh token secret not configured');
    }

    try {
      const decoded = jwt.verify(refreshToken, refreshSecret) as any;
      
      // Verify user still exists
      const user = await db.findById<User>('users', decoded.petOwnerId);
      if (!user) {
        throw new Error('User not found');
      }

      // Generate new access token
      const newToken = this.generateAccessToken({
        petOwnerId: user.petOwnerId,
        email: user.email,
        username: user.username
      });

      return { token: newToken };
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  private static generateTokens(user: AuthUser): { accessToken: string; refreshToken: string } {
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);
    
    return { accessToken, refreshToken };
  }

  private static generateAccessToken(user: AuthUser): string {
    const secret = process.env.JWT_SECRET;
    const options: SignOptions = { expiresIn: Number(process.env.JWT_EXPIRES_IN) || '7d' };
    
    if (!secret) {
      throw new Error('JWT secret not configured');
    }

    return jwt.sign(
      {
        petOwnerId: user.petOwnerId,
        email: user.email,
        username: user.username
      },
      secret,
      options
    );
  }

  private static generateRefreshToken(user: AuthUser): string {
    const secret = process.env.REFRESH_TOKEN_SECRET;
    const options: SignOptions = { expiresIn: Number(process.env.JWT_EXPIRES_IN) || '7d' };
    
    if (!secret) {
      throw new Error('Refresh token secret not configured');
    }

    return jwt.sign(
      {
        petOwnerId: user.petOwnerId,
        email: user.email,
        username: user.username
      },
      secret,
      options
    );
  }

  static async validateUser(userId: string): Promise<User | null> {
    return await db.findById<User>('users', userId);
  }
}
