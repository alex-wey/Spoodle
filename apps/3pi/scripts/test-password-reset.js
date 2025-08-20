const { PrismaClient } = require('@prisma/client')
const crypto = require('crypto')
const bcrypt = require('bcrypt')

const prisma = new PrismaClient()

async function testPasswordReset() {
  try {
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: 'jj@vonoiste.com' }
    })

    if (!user) {
      console.log('User jj@vonoiste.com does not exist')
      return
    }

    console.log('User found:', user.email)

    // Generate a test reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenHash = await bcrypt.hash(resetToken, 10)
    
    // Set expiration (1 hour from now)
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000)

    // Store the reset token in the database
    await prisma.user.update({
      where: { email: 'jj@vonoiste.com' },
      data: {
        resetToken: resetTokenHash,
        resetTokenExpiry: resetTokenExpiry,
      }
    })

    const resetUrl = `http://localhost:3000/auth/reset-password?token=${resetToken}&email=${encodeURIComponent('jj@vonoiste.com')}`

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📧 Password Reset Test')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('Reset URL:')
    console.log(resetUrl)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('Copy and paste this URL into your browser to test the reset flow')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  } catch (error) {
    console.error('Error testing password reset:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testPasswordReset()
