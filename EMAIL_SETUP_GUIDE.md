# Email Setup Guide for Spoodle

## Overview
This guide explains how to set up real email sending functionality for the Spoodle application, including password reset emails.

## Email Service Options

### 1. Resend (Recommended) ⭐
**Best for**: Production applications, developer-friendly, great deliverability
- Free tier: 3,000 emails/month
- Easy setup
- Great documentation
- Built-in analytics

### 2. SendGrid
**Best for**: High volume, enterprise features
- Free tier: 100 emails/day
- Advanced features
- Good deliverability

### 3. AWS SES
**Best for**: Cost-effective, high volume
- Very cheap ($0.10 per 1,000 emails)
- Requires AWS setup
- Good for enterprise

## Setup Instructions

### Option 1: Resend (Recommended)

#### Step 1: Create Resend Account
1. Go to [resend.com](https://resend.com)
2. Sign up for a free account
3. Verify your email address

#### Step 2: Get API Key
1. Go to the Resend dashboard
2. Navigate to "API Keys"
3. Click "Create API Key"
4. Copy the API key (starts with `re_`)

#### Step 3: Verify Domain (Optional but Recommended)
1. Go to "Domains" in Resend dashboard
2. Add your domain (e.g., `spoodle.com`)
3. Follow DNS setup instructions
4. Wait for verification (usually 24-48 hours)

#### Step 4: Configure Environment Variables
Create or update your `.env.local` file:

```bash
# Email Configuration
RESEND_API_KEY=re_your_api_key_here
FROM_EMAIL=noreply@yourdomain.com
# OR use Resend's default domain:
# FROM_EMAIL=onboarding@resend.dev
```

#### Step 5: Test Email Sending
1. Restart your development server
2. Try the password reset flow
3. Check your email inbox

### Option 2: SendGrid

#### Step 1: Create SendGrid Account
1. Go to [sendgrid.com](https://sendgrid.com)
2. Sign up for a free account
3. Verify your email address

#### Step 2: Get API Key
1. Go to Settings → API Keys
2. Create a new API key
3. Copy the API key

#### Step 3: Configure Environment Variables
```bash
SENDGRID_API_KEY=your_sendgrid_api_key_here
FROM_EMAIL=noreply@yourdomain.com
```

#### Step 4: Update Email Service
Replace the Resend implementation in `src/lib/email.ts` with SendGrid:

```typescript
import sgMail from '@sendgrid/mail'

export async function sendEmail(options: EmailOptions) {
  try {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY!)
    
    const msg = {
      to: options.to,
      from: process.env.FROM_EMAIL!,
      subject: options.subject,
      html: options.html,
    }
    
    const result = await sgMail.send(msg)
    return { success: true, data: result }
  } catch (error) {
    console.error('Failed to send email:', error)
    return { success: false, error }
  }
}
```

### Option 3: AWS SES

#### Step 1: AWS Setup
1. Create AWS account
2. Go to SES (Simple Email Service)
3. Verify your email address or domain
4. Create SMTP credentials

#### Step 2: Install AWS SDK
```bash
npm install @aws-sdk/client-ses
```

#### Step 3: Configure Environment Variables
```bash
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
FROM_EMAIL=noreply@yourdomain.com
```

## Environment Variables Reference

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `RESEND_API_KEY` | Resend API key | Yes (for Resend) | `re_1234567890` |
| `SENDGRID_API_KEY` | SendGrid API key | Yes (for SendGrid) | `SG.1234567890` |
| `FROM_EMAIL` | Sender email address | Yes | `noreply@spoodle.com` |
| `NODE_ENV` | Environment mode | No | `development` or `production` |

## Testing Email Functionality

### Development Mode
When `NODE_ENV=development` and no API key is set:
- Emails are logged to console
- No actual emails are sent
- Perfect for development and testing

### Production Mode
When API key is configured:
- Real emails are sent
- Check email service dashboard for delivery status
- Monitor bounce rates and spam complaints

## Email Templates

The current email template includes:
- Professional HTML formatting
- Responsive design
- Clear call-to-action button
- Security warnings
- Fallback text link

### Customizing Email Templates

Edit `src/lib/email.ts` to modify the email template:

```typescript
export function createPasswordResetEmail(email: string, resetUrl: string) {
  const subject = 'Reset Your Spoodle Password'
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Reset Your Password</title>
      <style>
        /* Your custom styles here */
      </style>
    </head>
    <body>
      <!-- Your custom HTML here -->
    </body>
    </html>
  `
  return { subject, html }
}
```

## Troubleshooting

### Common Issues

#### 1. "RESEND_API_KEY is required"
- Check that your `.env.local` file has the correct API key
- Restart your development server after adding environment variables

#### 2. "Email not received"
- Check spam/junk folder
- Verify domain is properly configured
- Check email service dashboard for delivery status

#### 3. "Invalid API key"
- Regenerate your API key
- Ensure you're using the correct key format
- Check for extra spaces or characters

#### 4. "Domain not verified"
- Complete domain verification in your email service
- Wait 24-48 hours for DNS propagation
- Use a verified email address as fallback

### Debug Mode

Enable debug logging by adding to your `.env.local`:

```bash
DEBUG_EMAIL=true
```

This will show detailed email sending logs.

## Security Best Practices

1. **Never commit API keys to version control**
2. **Use environment variables for all sensitive data**
3. **Rotate API keys regularly**
4. **Monitor email delivery and bounce rates**
5. **Implement rate limiting for email endpoints**
6. **Use verified domains for better deliverability**

## Production Checklist

- [ ] API key configured
- [ ] Domain verified
- [ ] FROM_EMAIL set to verified domain
- [ ] Email templates tested
- [ ] Delivery monitoring set up
- [ ] Bounce handling configured
- [ ] Rate limiting implemented
- [ ] Error handling tested

## Support

For issues with:
- **Resend**: [docs.resend.com](https://docs.resend.com)
- **SendGrid**: [docs.sendgrid.com](https://docs.sendgrid.com)
- **AWS SES**: [docs.aws.amazon.com/ses](https://docs.aws.amazon.com/ses)

For Spoodle-specific issues, check the application logs and ensure all environment variables are properly configured.
