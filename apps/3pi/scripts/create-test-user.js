const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcrypt')

const prisma = new PrismaClient()

async function createTestUser() {
  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'jj@vonoiste.com' }
    })

    if (existingUser) {
      console.log('Test user already exists:', existingUser.email)
      return
    }

    // Find or create organization
    let organization = await prisma.organization.findFirst({
      where: { referralCode: 'TESTCLINIC123' }
    })

    if (!organization) {
      organization = await prisma.organization.create({
        data: {
          name: 'Test Clinic',
          type: 'VETERINARY_CLINIC',
          email: 'jj@vonoiste.com',
          phone: '555-1234',
          address: '123 Test St',
          city: 'Test City',
          state: 'TS',
          zipCode: '12345',
          country: 'US',
          description: 'Test veterinary clinic for development',
          businessLicense: 'TEST123',
          referralCode: 'TESTCLINIC123'
        }
      })
      console.log('Organization created:', organization.name)
    } else {
      console.log('Using existing organization:', organization.name)
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('password123', 10)

    // Create user
    const user = await prisma.user.create({
      data: {
        email: 'jj@vonoiste.com',
        name: 'Test User',
        password: hashedPassword,
        role: 'ADMIN',
        organizationId: organization.id,
        isActive: true
      }
    })

    console.log('Test user created successfully:', user.email)
    console.log('Organization:', organization.name)
  } catch (error) {
    console.error('Error creating test user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestUser()
