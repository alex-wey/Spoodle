# Email Setup for Password Reset

## Current Status

The password reset functionality is working, but emails are currently logged to the console in development mode. To send actual emails in production, you need to configure an email service.

## Development Mode

In development, when you request a password reset:
1. The reset token is generated and stored in the database
2. A beautiful HTML email is created with the reset link
3. The email content is logged to the server console
4. You can copy the reset URL from the console logs

## Production Email Setup

### Option 1: Resend (Recommended)

1. **Sign up for Resend**: https://resend.com
2. **Get your API key** from the Resend dashboard
3. **Add environment variables**:

```bash
# .env.local
RESEND_API_KEY=your_resend_api_key_here
FROM_EMAIL=noreply@yourdomain.com
```

4. **Uncomment the Resend code** in `src/lib/email.ts`:

```typescript
// Remove the comment markers and uncomment this section:
import { Resend } from 'resend'
const resend = new Resend(process.env.RESEND_API_KEY)

const result = await resend.emails.send({
  from: process.env.FROM_EMAIL || 'noreply@spoodle.com',
  to: options.to,
  subject: options.subject,
  html: options.html,
})
```

### Option 2: Other Email Services

You can modify `src/lib/email.ts` to use other email services like:
- SendGrid
- AWS SES
- Mailgun
- Nodemailer with SMTP

## Testing Email Functionality

### Development Testing

1. Request a password reset at `/auth/forgot-password`
2. Check the server console for the email content
3. Copy the reset URL from the console logs
4. Visit the reset URL to test the password reset flow

### Production Testing

1. Set up your email service (e.g., Resend)
2. Configure environment variables
3. Request a password reset
4. Check your email inbox for the reset link
5. Test the complete flow

## Email Template

The current email template includes:
- Professional styling with Spoodle branding
- Clear call-to-action button
- Security warning about token expiration
- Fallback text link
- Mobile-responsive design

## Security Features

- Reset tokens expire after 1 hour
- Tokens are single-use (cleared after password reset)
- Tokens are securely hashed with bcrypt
- Email doesn't reveal if an account exists

## Troubleshooting

### Email not sending
- Check environment variables are set correctly
- Verify API key is valid
- Check server logs for error messages

### Reset link not working
- Ensure the token hasn't expired (1 hour limit)
- Check if the token was already used
- Verify the email address matches the token

### Development vs Production
- Development: Emails are logged to console
- Production: Emails are sent via configured service
