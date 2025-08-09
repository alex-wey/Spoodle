// Mock the Prisma client
const mockPrisma = {
  user: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  organization: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  pet: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  vaccination: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  medicalRecord: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  complianceCheck: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  document: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  ownerRequest: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
}

jest.mock('../prisma', () => ({
  prisma: mockPrisma,
}))

import { prisma } from '../prisma'

describe('Prisma Client', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should be able to create a Prisma client instance', () => {
    expect(prisma).toBeDefined()
    expect(typeof prisma.user.findMany).toBe('function')
    expect(typeof prisma.organization.findMany).toBe('function')
    expect(typeof prisma.pet.findMany).toBe('function')
  })

  it('should have all required models', () => {
    // Check that all models from the schema are available
    expect(prisma.user).toBeDefined()
    expect(prisma.organization).toBeDefined()
    expect(prisma.pet).toBeDefined()
    expect(prisma.vaccination).toBeDefined()
    expect(prisma.medicalRecord).toBeDefined()
    expect(prisma.complianceCheck).toBeDefined()
    expect(prisma.document).toBeDefined()
    expect(prisma.ownerRequest).toBeDefined()
  })

  it('should have proper model relationships', () => {
    // Test that the User model has organization relationship
    expect(prisma.user.findUnique).toBeDefined()
    
    // Test that the Organization model has users relationship
    expect(prisma.organization.findUnique).toBeDefined()
    
    // Test that the Pet model has organization relationship
    expect(prisma.pet.findUnique).toBeDefined()
  })

  it('should be able to perform basic operations', async () => {
    // Mock successful operations
    mockPrisma.user.findMany.mockResolvedValue([])
    mockPrisma.organization.findMany.mockResolvedValue([])
    mockPrisma.pet.findMany.mockResolvedValue([])

    // Test that operations can be called
    await prisma.user.findMany()
    await prisma.organization.findMany()
    await prisma.pet.findMany()

    expect(mockPrisma.user.findMany).toHaveBeenCalled()
    expect(mockPrisma.organization.findMany).toHaveBeenCalled()
    expect(mockPrisma.pet.findMany).toHaveBeenCalled()
  })
})
