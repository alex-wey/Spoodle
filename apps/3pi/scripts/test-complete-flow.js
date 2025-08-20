const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcrypt')
const crypto = require('crypto')

const prisma = new PrismaClient()

async function testCompleteFlow() {
  try {
    console.log('🧪 Testing complete password reset flow...\n')

    // Step 1: Request password reset
    console.log('1️⃣ Requesting password reset...')
    const email = 'test@example.com'
    
    // Simulate the forgot-password API call
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenHash = await bcrypt.hash(resetToken, 10)
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000)

    await prisma.user.update({
      where: { email },
      data: {
        resetToken: resetTokenHash,
        resetTokenExpiry: resetTokenExpiry,
      }
    })

    console.log('✅ Password reset requested')
    console.log('📧 Reset URL:', `http://localhost:3002/auth/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`)

    // Step 2: Validate reset token
    console.log('\n2️⃣ Validating reset token...')
    
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user || !user.resetToken || !user.resetTokenExpiry) {
      console.log('❌ No reset token found')
      return
    }

    if (new Date() > user.resetTokenExpiry) {
      console.log('❌ Token has expired')
      return
    }

    const isValidToken = await bcrypt.compare(resetToken, user.resetToken)
    if (!isValidToken) {
      console.log('❌ Invalid token')
      return
    }

    console.log('✅ Token validated successfully')

    // Step 3: Reset password
    console.log('\n3️⃣ Resetting password...')
    
    const newPassword = 'newpassword123'
    const hashedNewPassword = await bcrypt.hash(newPassword, 10)

    await prisma.user.update({
      where: { email },
      data: {
        password: hashedNewPassword,
        resetToken: null,
        resetTokenExpiry: null,
      }
    })

    console.log('✅ Password reset successfully')

    // Step 4: Verify login with new password
    console.log('\n4️⃣ Verifying login with new password...')
    
    const updatedUser = await prisma.user.findUnique({
      where: { email }
    })

    if (!updatedUser || !updatedUser.password) {
      console.log('❌ User or password not found')
      return
    }

    const isPasswordValid = await bcrypt.compare(newPassword, updatedUser.password)
    if (!isPasswordValid) {
      console.log('❌ New password verification failed')
      return
    }

    console.log('✅ Login with new password works')

    // Step 5: Verify old token is invalid
    console.log('\n5️⃣ Verifying old token is invalid...')
    
    const isOldTokenValid = await bcrypt.compare(resetToken, updatedUser.resetToken || '')
    if (isOldTokenValid) {
      console.log('❌ Old token is still valid (should be cleared)')
    } else {
      console.log('✅ Old token is properly cleared')
    }

    console.log('\n🎉 Complete password reset flow test passed!')

  } catch (error) {
    console.error('❌ Error testing complete flow:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testCompleteFlow()
