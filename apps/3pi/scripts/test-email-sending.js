const { sendEmail, createPasswordResetEmail } = require('../src/lib/email.ts')

async function testEmailSending() {
  console.log('📧 Testing Email Sending Functionality')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  
  try {
    // Test email configuration
    console.log('\n🔧 Email Configuration:')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('NODE_ENV:', process.env.NODE_ENV || 'not set')
    console.log('RESEND_API_KEY:', process.env.RESEND_API_KEY ? '✅ Set' : '❌ Not set')
    console.log('FROM_EMAIL:', process.env.FROM_EMAIL || 'not set')
    
    // Create test email
    const testEmail = 'test@example.com'
    const testResetUrl = 'http://localhost:3000/auth/reset-password?token=test123&email=test@example.com'
    
    const { subject, html } = createPasswordResetEmail(testEmail, testResetUrl)
    
    console.log('\n📧 Test Email Details:')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('To:', testEmail)
    console.log('Subject:', subject)
    console.log('HTML Length:', html.length, 'characters')
    
    // Send test email
    console.log('\n🚀 Sending Test Email:')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    
    const result = await sendEmail({
      to: testEmail,
      subject,
      html
    })
    
    console.log('Result:', result)
    
    if (result.success) {
      console.log('✅ Email test completed successfully')
      
      if (process.env.NODE_ENV === 'development' && !process.env.RESEND_API_KEY) {
        console.log('\n💡 Development Mode Active:')
        console.log('   - Emails are logged to console')
        console.log('   - No actual emails are sent')
        console.log('   - Set RESEND_API_KEY to send real emails')
      } else if (process.env.RESEND_API_KEY) {
        console.log('\n✅ Production Mode Active:')
        console.log('   - Real emails are being sent')
        console.log('   - Check your email inbox')
      }
    } else {
      console.log('❌ Email test failed:', result.error)
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

testEmailSending()
