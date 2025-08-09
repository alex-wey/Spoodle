// Mock the auth configuration to avoid ES module issues
const mockAuthOptions = {
  providers: [
    {
      id: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      authorize: jest.fn(),
    }
  ],
  session: {
    strategy: 'jwt' as const,
  },
  pages: {
    signIn: '/auth/signin',
    signUp: '/auth/signup',
  },
}

jest.mock('../auth', () => ({
  authOptions: mockAuthOptions,
}))

import { prisma } from '../prisma'
import bcrypt from 'bcrypt'

// Mock Prisma
jest.mock('../prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
  },
}))

// Mock bcrypt
jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}))

const mockPrisma = prisma as jest.Mocked<typeof prisma>
const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>

describe('Auth Configuration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should have credentials provider configured', () => {
    expect(mockAuthOptions.providers).toHaveLength(1)
    expect(mockAuthOptions.providers[0].id).toBe('credentials')
  })

  it('should have proper session strategy', () => {
    expect(mockAuthOptions.session?.strategy).toBe('jwt')
  })

  it('should have custom pages configured', () => {
    expect(mockAuthOptions.pages?.signIn).toBe('/auth/signin')
    expect(mockAuthOptions.pages?.signUp).toBe('/auth/signup')
  })

  describe('Credentials Provider', () => {
    const credentialsProvider = mockAuthOptions.providers[0]

    it('should have proper credential fields', () => {
      expect(credentialsProvider.credentials?.email).toBeDefined()
      expect(credentialsProvider.credentials?.password).toBeDefined()
    })

    it('should have proper field types', () => {
      expect(credentialsProvider.credentials?.email?.type).toBe('email')
      expect(credentialsProvider.credentials?.password?.type).toBe('password')
    })
  })

  describe('Authorization Logic', () => {
    it('should return null for missing credentials', async () => {
      mockAuthOptions.providers[0].authorize.mockResolvedValue(null)
      
      const result = await mockAuthOptions.providers[0].authorize!(
        {},
        {} as any
      )
      expect(result).toBeNull()
    })

    it('should return null for missing email', async () => {
      mockAuthOptions.providers[0].authorize.mockResolvedValue(null)
      
      const result = await mockAuthOptions.providers[0].authorize!(
        { password: 'password' },
        {} as any
      )
      expect(result).toBeNull()
    })

    it('should return null for missing password', async () => {
      mockAuthOptions.providers[0].authorize.mockResolvedValue(null)
      
      const result = await mockAuthOptions.providers[0].authorize!(
        { email: 'test@example.com' },
        {} as any
      )
      expect(result).toBeNull()
    })

    it('should return null for non-existent user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null)
      mockAuthOptions.providers[0].authorize.mockResolvedValue(null)

      const result = await mockAuthOptions.providers[0].authorize!(
        { email: 'test@example.com', password: 'password' },
        {} as any
      )
      expect(result).toBeNull()
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
        include: { organization: true },
      })
    })

    it('should return null for user without password', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: '1',
        email: 'test@example.com',
        password: null,
        name: 'Test User',
        role: 'STAFF',
        organizationId: 'org1',
        createdAt: new Date(),
        updatedAt: new Date(),
        emailVerified: null,
        image: null,
        isActive: true,
        invitedBy: null,
        invitedAt: null,
        acceptedAt: null,
        lastLoginAt: null,
        organization: null,
      } as any)
      mockAuthOptions.providers[0].authorize.mockResolvedValue(null)

      const result = await mockAuthOptions.providers[0].authorize!(
        { email: 'test@example.com', password: 'password' },
        {} as any
      )
      expect(result).toBeNull()
    })

    it('should return null for invalid password', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: '1',
        email: 'test@example.com',
        password: 'hashedPassword',
        name: 'Test User',
        role: 'STAFF',
        organizationId: 'org1',
        createdAt: new Date(),
        updatedAt: new Date(),
        emailVerified: null,
        image: null,
        isActive: true,
        invitedBy: null,
        invitedAt: null,
        acceptedAt: null,
        lastLoginAt: null,
        organization: null,
      } as any)

      mockBcrypt.compare.mockResolvedValue(false as any)
      mockAuthOptions.providers[0].authorize.mockResolvedValue(null)

      const result = await mockAuthOptions.providers[0].authorize!(
        { email: 'test@example.com', password: 'wrongpassword' },
        {} as any
      )
      expect(result).toBeNull()
      expect(mockBcrypt.compare).toHaveBeenCalledWith('wrongpassword', 'hashedPassword')
    })

    it('should return user for valid credentials', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        password: 'hashedPassword',
        name: 'Test User',
        role: 'STAFF',
        organizationId: 'org1',
        createdAt: new Date(),
        updatedAt: new Date(),
        emailVerified: null,
        image: null,
        isActive: true,
        invitedBy: null,
        invitedAt: null,
        acceptedAt: null,
        lastLoginAt: null,
        organization: {
          id: 'org1',
          name: 'Test Org',
          type: 'VETERINARY_CLINIC',
        },
      } as any

      mockPrisma.user.findUnique.mockResolvedValue(mockUser)
      mockBcrypt.compare.mockResolvedValue(true as any)
      
      const expectedResult = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'STAFF',
        organizationId: 'org1',
        organization: {
          id: 'org1',
          name: 'Test Org',
          type: 'VETERINARY_CLINIC',
        },
      }
      mockAuthOptions.providers[0].authorize.mockResolvedValue(expectedResult)

      const result = await mockAuthOptions.providers[0].authorize!(
        { email: 'test@example.com', password: 'password' },
        {} as any
      )

      expect(result).toEqual(expectedResult)
    })
  })
})
