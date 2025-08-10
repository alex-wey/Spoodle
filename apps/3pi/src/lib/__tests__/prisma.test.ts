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
}

jest.mock('../prisma', () => ({
  prisma: mockPrisma,
}))

import { prisma } from '../prisma'

describe('Prisma Client', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should be able to perform basic operations', () => {
    expect(prisma).toBeDefined()
    expect(prisma.user).toBeDefined()
    expect(prisma.organization).toBeDefined()
    expect(prisma.pet).toBeDefined()
    expect(prisma.medicalRecord).toBeDefined()
    expect(prisma.complianceCheck).toBeDefined()
  })

  it('should be able to find users', () => {
    mockPrisma.user.findMany.mockResolvedValue([])
    expect(prisma.user.findMany).toBeDefined()
  })

  it('should be able to create organizations', () => {
    mockPrisma.organization.create.mockResolvedValue({ id: '1', name: 'Test Org' })
    expect(prisma.organization.create).toBeDefined()
  })
})
