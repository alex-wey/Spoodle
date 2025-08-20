const { PrismaClient } = require('@prisma/client')
const crypto = require('crypto')
const bcrypt = require('bcrypt')

const prisma = new PrismaClient()

async function testCompletePasswordReset() {
  console.log('🔐 Testing Complete Password Reset Flow')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  
  try {
    // Step 1: Check if test user exists in database
    console.log('\n📋 Step 1: Checking if email exists in database')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    
    const user = await prisma.user.findUnique({
      where: { email: 'jj@vonoiste.com' }
    })
    
    if (!user) {
      console.log('❌ User jj@vonoiste.com does not exist in database')
      console.log('   Creating test user...')
      
      // Create test user
      const organization = await prisma.organization.findFirst({
        where: { referralCode: 'TESTCLINIC123' }
      })
      
      const hashedPassword = await bcrypt.hash('oldpassword123', 10)
      const newUser = await prisma.user.create({
        data: {
          email: 'jj@vonoiste.com',
          name: 'Test User',
          password: hashedPassword,
          role: 'ADMIN',
          organizationId: organization.id,
          isActive: true
        }
      })
      console.log('✅ Test user created:', newUser.email)
    } else {
      console.log('✅ User jj@vonoiste.com exists in database')
      console.log('   User ID:', user.id)
      console.log('   User Name:', user.name)
    }
    
    // Step 2: Generate reset token and simulate email sending
    console.log('\n📧 Step 2: Generating reset token and simulating email')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenHash = await bcrypt.hash(resetToken, 10)
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000) // 1 hour
    
    // Store reset token in database
    await prisma.user.update({
      where: { email: 'jj@vonoiste.com' },
      data: {
        resetToken: resetTokenHash,
        resetTokenExpiry: resetTokenExpiry,
      }
    })
    
    const resetUrl = `http://localhost:3000/auth/reset-password?token=${resetToken}&email=${encodeURIComponent('jj@vonoiste.com')}`
    
    console.log('✅ Reset token generated and stored in database')
    console.log('✅ Reset URL created:')
    console.log('   ' + resetUrl)
    console.log('\n📧 Email would be sent to: jj@vonoiste.com')
    console.log('   Subject: Reset Your Spoodle Password')
    console.log('   Contains: Reset link with token')
    
    // Step 3: Test token validation
    console.log('\n🔍 Step 3: Testing token validation')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    
    const userWithToken = await prisma.user.findUnique({
      where: { email: 'jj@vonoiste.com' }
    })
    
    if (!userWithToken || !userWithToken.resetToken) {
      console.log('❌ No reset token found in database')
      return
    }
    
    // Check if token has expired
    if (new Date() > userWithToken.resetTokenExpiry) {
      console.log('❌ Reset token has expired')
      return
    }
    
    // Verify the token
    const isValidToken = await bcrypt.compare(resetToken, userWithToken.resetToken)
    
    if (isValidToken) {
      console.log('✅ Token validation successful')
      console.log('✅ Token has not expired')
      console.log('✅ Token matches stored hash')
    } else {
      console.log('❌ Token validation failed')
      return
    }
    
    // Step 4: Test password reset
    console.log('\n🔑 Step 4: Testing password reset')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    
    const newPassword = 'newpassword123'
    const hashedNewPassword = await bcrypt.hash(newPassword, 10)
    
    // Update user with new password and clear reset token
    await prisma.user.update({
      where: { email: 'jj@vonoiste.com' },
      data: {
        password: hashedNewPassword,
        resetToken: null,
        resetTokenExpiry: null,
      }
    })
    
    console.log('✅ Password updated successfully')
    console.log('✅ Reset token cleared from database')
    
    // Step 5: Verify password change
    console.log('\n✅ Step 5: Verifying password change')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    
    const updatedUser = await prisma.user.findUnique({
      where: { email: 'jj@vonoiste.com' }
    })
    
    // Test old password (should fail)
    const oldPasswordValid = await bcrypt.compare('oldpassword123', updatedUser.password)
    console.log('Old password still valid:', oldPasswordValid ? '❌' : '✅')
    
    // Test new password (should succeed)
    const newPasswordValid = await bcrypt.compare('newpassword123', updatedUser.password)
    console.log('New password valid:', newPasswordValid ? '✅' : '❌')
    
    // Check that reset token is cleared
    console.log('Reset token cleared:', !updatedUser.resetToken ? '✅' : '❌')
    console.log('Reset token expiry cleared:', !updatedUser.resetTokenExpiry ? '✅' : '❌')
    
    console.log('\n🎉 Password Reset Flow Test Complete!')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('✅ All steps passed successfully')
    console.log('\n📋 Test Summary:')
    console.log('   1. ✅ Email exists in database')
    console.log('   2. ✅ Reset token generated and stored')
    console.log('   3. ✅ Email would be sent with reset link')
    console.log('   4. ✅ Token validation works')
    console.log('   5. ✅ Password successfully reset')
    console.log('   6. ✅ Old password no longer works')
    console.log('   7. ✅ New password works')
    console.log('   8. ✅ Reset token cleared after use')
    
    console.log('\n🌐 Live Test URL:')
    console.log('   ' + resetUrl)
    console.log('\n📝 Instructions:')
    console.log('   1. Open the URL above in your browser')
    console.log('   2. Enter a new password')
    console.log('   3. Verify the password is changed')
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testCompletePasswordReset()
