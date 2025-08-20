const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcrypt')

const prisma = new PrismaClient()

async function testTokenValidation() {
  try {
    console.log('Testing token validation...')
    
    // Get the user and their reset token
    const user = await prisma.user.findUnique({
      where: { email: 'jj@vonoiste.com' }
    })
    
    if (!user || !user.resetToken) {
      console.log('No reset token found for user')
      return
    }
    
    console.log('User found with reset token')
    console.log('Token expiry:', user.resetTokenExpiry)
    
    // Test bcrypt comparison performance
    const startTime = Date.now()
    
    // This will fail since we don't have the original token, but it tests the bcrypt performance
    const isValid = await bcrypt.compare('test-token', user.resetToken)
    
    const endTime = Date.now()
    const duration = endTime - startTime
    
    console.log(`Bcrypt comparison took ${duration}ms`)
    console.log('Token validation result:', isValid)
    
  } catch (error) {
    console.error('Token validation error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testTokenValidation()
