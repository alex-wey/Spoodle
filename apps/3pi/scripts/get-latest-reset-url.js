const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function getLatestResetUrl() {
  try {
    console.log('🔍 Finding latest password reset token...\n')

    const user = await prisma.user.findUnique({
      where: { email: 'test@example.com' },
      select: {
        email: true,
        resetToken: true,
        resetTokenExpiry: true
      }
    })

    if (!user || !user.resetToken) {
      console.log('❌ No reset token found for test@example.com')
      console.log('💡 Try requesting a password reset first at: http://localhost:3002/auth/forgot-password')
      return
    }

    console.log('✅ Found reset token for:', user.email)
    console.log('⏰ Token expires:', user.resetTokenExpiry)
    console.log('🕐 Current time:', new Date())
    
    if (new Date() > user.resetTokenExpiry) {
      console.log('❌ Token has expired! Request a new one.')
      return
    }

    console.log('✅ Token is still valid')
    console.log('\n📧 To test the password reset:')
    console.log('1. Go to: http://localhost:3002/auth/forgot-password')
    console.log('2. Enter: test@example.com')
    console.log('3. Check the server console for the reset URL')
    console.log('4. Copy the URL and visit it in your browser')
    console.log('\n💡 The reset URL will look like:')
    console.log('http://localhost:3002/auth/reset-password?token=<token>&email=test%40example.com')

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

getLatestResetUrl()
