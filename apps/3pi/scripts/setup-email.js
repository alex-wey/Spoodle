const fs = require('fs')
const path = require('path')

function setupEmail() {
  console.log('📧 Email Setup for Spoodle')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  
  const envPath = path.join(__dirname, '..', '.env.local')
  const envExists = fs.existsSync(envPath)
  
  console.log('\n🔧 Current Configuration:')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('.env.local exists:', envExists ? '✅' : '❌')
  
  if (envExists) {
    const envContent = fs.readFileSync(envPath, 'utf8')
    const hasResendKey = envContent.includes('RESEND_API_KEY=')
    const hasFromEmail = envContent.includes('FROM_EMAIL=')
    
    console.log('RESEND_API_KEY configured:', hasResendKey ? '✅' : '❌')
    console.log('FROM_EMAIL configured:', hasFromEmail ? '✅' : '❌')
  }
  
  console.log('\n📋 Setup Instructions:')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('1. Create a Resend account at https://resend.com')
  console.log('2. Get your API key from the Resend dashboard')
  console.log('3. Add the following to your .env.local file:')
  console.log('')
  console.log('   # Email Configuration')
  console.log('   RESEND_API_KEY=re_your_api_key_here')
  console.log('   FROM_EMAIL=noreply@yourdomain.com')
  console.log('')
  console.log('4. Restart your development server')
  console.log('5. Test email sending with: npm run test:email')
  
  console.log('\n💡 Quick Start (Development):')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('For development, you can use Resend\'s default domain:')
  console.log('FROM_EMAIL=onboarding@resend.dev')
  console.log('')
  console.log('This allows you to send emails immediately without')
  console.log('domain verification, perfect for testing!')
  
  console.log('\n🔒 Security Notes:')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('✅ Never commit API keys to version control')
  console.log('✅ Use .env.local for local development')
  console.log('✅ Use environment variables in production')
  console.log('✅ Rotate API keys regularly')
  
  console.log('\n📚 Documentation:')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📖 Email Setup Guide: EMAIL_SETUP_GUIDE.md')
  console.log('🌐 Resend Documentation: https://docs.resend.com')
  console.log('📧 Test Email Script: scripts/test-email-sending.js')
  
  console.log('\n🎯 Next Steps:')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('1. Set up your Resend account')
  console.log('2. Configure environment variables')
  console.log('3. Test email functionality')
  console.log('4. Deploy with email support')
}

setupEmail()
