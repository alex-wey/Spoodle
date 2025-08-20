interface EmailOptions {
  to: string
  subject: string
  html: string
}

export async function sendEmail(options: EmailOptions) {
  try {
    // Check if we're in development mode and no API key is set
    const isDevelopment = !process.env.RESEND_API_KEY
    
    if (isDevelopment) {
      // Development mode: log email details
      console.log('📧 Password Reset Email (Development Mode):')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log('To:', options.to)
      console.log('Subject:', options.subject)
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log('HTML Content:')
      console.log(options.html)
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log('💡 To send real emails, set RESEND_API_KEY in your .env file')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      
      return { success: true, message: 'Email logged to console (development mode)' }
    }

    // Production mode: send real email
    const { Resend } = await import('resend')
    const resend = new Resend(process.env.RESEND_API_KEY)
    
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is required for sending emails')
    }

    const result = await resend.emails.send({
      from: process.env.FROM_EMAIL || 'noreply@spoodle.com',
      to: options.to,
      subject: options.subject,
      html: options.html,
    })

    console.log('📧 Email sent successfully:', result)
    return { success: true, data: result }
    
  } catch (error) {
    console.error('Failed to send email:', error)
    return { success: false, error }
  }
}

export function createPasswordResetEmail(email: string, resetUrl: string) {
  const subject = 'Reset Your Spoodle Password'
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your Password</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4f46e5; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9fafb; }
        .button { display: inline-block; background: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
        .warning { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Spoodle Password Reset</h1>
        </div>
        <div class="content">
          <h2>Hello!</h2>
          <p>We received a request to reset your password for your Spoodle account.</p>
          <p>Click the button below to reset your password:</p>
          <a href="${resetUrl}" class="button">Reset Password</a>
          <div class="warning">
            <strong>Important:</strong> This link will expire in 1 hour for security reasons.
          </div>
          <p>If you didn't request a password reset, you can safely ignore this email.</p>
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #6b7280;">${resetUrl}</p>
        </div>
        <div class="footer">
          <p>This email was sent to ${email}</p>
          <p>If you have any questions, please contact our support team.</p>
        </div>
      </div>
    </body>
    </html>
  `

  return { subject, html }
}
