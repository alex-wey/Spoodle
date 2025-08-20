const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function getResetToken() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'test@example.com' },
      select: {
        email: true,
        resetToken: true,
        resetTokenExpiry: true
      }
    })

    if (!user || !user.resetToken) {
      console.log('No reset token found for user')
      return
    }

    console.log('User:', user.email)
    console.log('Reset token exists:', !!user.resetToken)
    console.log('Token expiry:', user.resetTokenExpiry)
    console.log('Current time:', new Date())
    console.log('Token expired:', new Date() > user.resetTokenExpiry)

    // Note: We can't get the original token since it's hashed
    // But we can verify it exists and check expiry

  } catch (error) {
    console.error('Error getting reset token:', error)
  } finally {
    await prisma.$disconnect()
  }
}

getResetToken()
