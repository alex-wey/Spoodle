import { Resend } from 'resend';

interface BugReportEmailData {
  title: string;
  description: string;
  severity: string;
  reporterEmail?: string;
  reporterName?: string;
  timestamp: string;
}

class EmailService {
  private resend: Resend | null = null;

  constructor() {
    this.initializeResend();
  }

  private initializeResend() {
    try {
      const apiKey = process.env.RESEND_API_KEY;
      
      if (!apiKey || apiKey === 'your-resend-api-key-here') {
        console.error('❌ RESEND_API_KEY not configured in environment variables');
        console.error('📝 Please set RESEND_API_KEY in your .env file');
        this.resend = null;
        return;
      }
      
      this.resend = new Resend(apiKey);
      console.log('✅ Resend email service initialized with API key');
    } catch (error) {
      console.error('❌ Failed to initialize Resend email service:', error);
      this.resend = null;
    }
  }

  async sendBugReport(data: BugReportEmailData): Promise<boolean> {
    console.log('📧 EmailService.sendBugReport called with:', {
      title: data.title,
      severity: data.severity,
      reporterEmail: data.reporterEmail,
      timestamp: data.timestamp
    });
    
    if (!this.resend) {
      console.error('❌ Resend email service not initialized - check RESEND_API_KEY');
      return false;
    }

    try {
      console.log('📧 Attempting to send bug report email...');
      console.log('📧 Recipient: seher@spoodle.ai');
      console.log('📧 Subject:', data.title);
      
      const severityEmojis = {
        low: '🟢',
        medium: '🟡',
        high: '🟠',
        critical: '🔴'
      };

      const severityLabels = {
        low: 'Low Priority',
        medium: 'Medium Priority',
        high: 'High Priority',
        critical: 'Critical Priority'
      };

      const emailData = {
        from: 'Spoodle Bug Reports <onboarding@resend.dev>',
        to: ['seher@spoodle.ai'],
        subject: `[${severityLabels[data.severity as keyof typeof severityLabels]}] Bug Report: ${data.title}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #4559A7 0%, #3BB272 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
              <h1 style="margin: 0; font-size: 24px;">🐛 Spoodle Bug Report</h1>
            </div>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 0 0 10px 10px; border: 1px solid #dee2e6;">
              <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <h2 style="color: #4559A7; margin-top: 0;">${severityEmojis[data.severity as keyof typeof severityEmojis]} ${data.title}</h2>
                
                <div style="margin: 15px 0;">
                  <strong style="color: #6c757d;">Severity:</strong> 
                  <span style="background: ${data.severity === 'critical' ? '#dc2626' : data.severity === 'high' ? '#ef4444' : data.severity === 'medium' ? '#f59e0b' : '#10b981'}; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; margin-left: 8px;">
                    ${severityLabels[data.severity as keyof typeof severityLabels]}
                  </span>
                </div>
                
                <div style="margin: 15px 0;">
                  <strong style="color: #6c757d;">Reported:</strong> ${data.timestamp}
                </div>
                
                ${data.reporterEmail ? `
                <div style="margin: 15px 0;">
                  <strong style="color: #6c757d;">Reporter Email:</strong> ${data.reporterEmail}
                </div>
                ` : ''}
                
                ${data.reporterName ? `
                <div style="margin: 15px 0;">
                  <strong style="color: #6c757d;">Reporter Name:</strong> ${data.reporterName}
                </div>
                ` : ''}
              </div>
              
              <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <h3 style="color: #4559A7; margin-top: 0;">Description</h3>
                <div style="background: #f8f9fa; padding: 15px; border-radius: 6px; border-left: 4px solid #4559A7; white-space: pre-wrap; line-height: 1.6;">
                  ${data.description}
                </div>
              </div>
            </div>
            
            <div style="text-align: center; margin-top: 20px; color: #6c757d; font-size: 12px;">
              <p>This bug report was submitted through the Spoodle mobile application.</p>
              <p>Please review and take appropriate action.</p>
            </div>
          </div>
        `,
        text: `
Spoodle Bug Report
==================

Title: ${data.title}
Severity: ${severityLabels[data.severity as keyof typeof severityLabels]}
Reported: ${data.timestamp}
${data.reporterEmail ? `Reporter Email: ${data.reporterEmail}` : ''}
${data.reporterName ? `Reporter Name: ${data.reporterName}` : ''}

Description:
${data.description}

---
This bug report was submitted through the Spoodle mobile application.
        `
      };

      const result = await this.resend.emails.send(emailData);
      console.log('✅ Bug report email sent successfully via Resend:', result);
      console.log('📧 Resend API Response:', JSON.stringify(result, null, 2));
      return true;
    } catch (error) {
      console.error('❌ Failed to send bug report email via Resend:', error);
      return false;
    }
  }

  async testConnection(): Promise<boolean> {
    if (!this.resend) {
      return false;
    }

    try {
      // Test Resend connection by sending a simple test email
      const result = await this.resend.emails.send({
        from: 'Spoodle Bug Reports <onboarding@resend.dev>',
        to: ['seher@spoodle.ai'],
        subject: 'Test Email from Spoodle',
        html: '<p>This is a test email to verify Resend connection.</p>',
      });
      
      console.log('✅ Resend connection test successful:', result);
      return true;
    } catch (error) {
      console.error('❌ Resend connection test failed:', error);
      return false;
    }
  }
}

export const emailService = new EmailService();
