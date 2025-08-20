const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testDbConnection() {
  try {
    console.log('Testing database connection...')
    const startTime = Date.now()
    
    // Test a simple query
    const user = await prisma.user.findUnique({
      where: { email: 'jj@vonoiste.com' }
    })
    
    const endTime = Date.now()
    const duration = endTime - startTime
    
    console.log(`Database query took ${duration}ms`)
    console.log('User found:', user ? user.email : 'Not found')
    
  } catch (error) {
    console.error('Database connection error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testDbConnection()
