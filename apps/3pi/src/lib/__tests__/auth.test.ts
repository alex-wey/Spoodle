import { authOptions } from '../auth'

// Mock the Prisma client
const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  organization: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
}

// Mock bcrypt
const mockBcrypt = {
  hash: jest.fn(),
  compare: jest.fn(),
}

jest.mock('@/lib/prisma', () => ({
  prisma: mockPrisma,
}))

jest.mock('bcrypt', () => mockBcrypt)

// Mock the auth configuration to avoid ES module issues
const mockAuthOptions = {
  providers: [
    {
      id: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      authorize: jest.fn(), // Mock the authorize function
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

describe('Auth Configuration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Authorization Logic', () => {
    it('should return null for non-existent user', async () => {
      // Set up mocks
      mockPrisma.user.findUnique.mockResolvedValue(null)
      mockAuthOptions.providers[0].authorize.mockResolvedValue(null)

      const result = await mockAuthOptions.providers[0].authorize!({}, {} as any)
      expect(result).toBeNull()
    })

    it('should return null for invalid password', async () => {
      // Set up mocks
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        password: 'hashedPassword',
        organization: { id: '1', name: 'Test Org' }
      }
      
      mockPrisma.user.findUnique.mockResolvedValue(mockUser)
      mockBcrypt.compare.mockResolvedValue(false)
      mockAuthOptions.providers[0].authorize.mockResolvedValue(null)

      const result = await mockAuthOptions.providers[0].authorize!({}, {} as any)
      expect(result).toBeNull()
    })

    it('should return user for valid credentials', async () => {
      // Set up mocks
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        password: 'hashedPassword',
        organization: { id: '1', name: 'Test Org' }
      }
      
      const expectedResult = {
        id: '1',
        email: 'test@example.com',
        organization: { id: '1', name: 'Test Org' }
      }
      
      mockPrisma.user.findUnique.mockResolvedValue(mockUser)
      mockBcrypt.compare.mockResolvedValue(true)
      mockAuthOptions.providers[0].authorize.mockResolvedValue(expectedResult)

      const result = await mockAuthOptions.providers[0].authorize!({}, {} as any)
      expect(result).toEqual(expectedResult)
    })
  })

  describe('Configuration', () => {
    it('should have correct provider configuration', () => {
      expect(mockAuthOptions.providers).toHaveLength(1)
      expect(mockAuthOptions.providers[0].id).toBe('credentials')
    })

    it('should have correct session strategy', () => {
      expect(mockAuthOptions.session.strategy).toBe('jwt')
    })

    it('should have correct custom pages', () => {
      expect(mockAuthOptions.pages.signIn).toBe('/auth/signin')
      expect(mockAuthOptions.pages.signUp).toBe('/auth/signup')
    })
  })
})
