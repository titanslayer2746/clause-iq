import sgMail from "@sendgrid/mail";

interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

class EmailService {
  private isInitialized = false;

  private initialize() {
    if (this.isInitialized) return;

    const apiKey = process.env.SENDGRID_API_KEY;
    if (apiKey) {
      sgMail.setApiKey(apiKey);
    } else {
      console.warn(
        "⚠️ SENDGRID_API_KEY not set. Email functionality will be disabled."
      );
    }

    this.isInitialized = true;
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    this.initialize(); // Lazy initialization

    if (!process.env.SENDGRID_API_KEY) {
      console.log(
        `📧 [DEV MODE] Email would be sent to ${options.to}: ${options.subject}`
      );
      return;
    }

    try {
      await sgMail.send({
        from: {
          email: process.env.EMAIL_FROM || "noreply@clause-iq.com",
          name: process.env.EMAIL_FROM_NAME || "Clause-IQ",
        },
        to: options.to,
        subject: options.subject,
        text: options.text || "",
        html: options.html || "",
      } as any);
      console.log(`📧 Email sent to ${options.to}`);
    } catch (error: any) {
      console.error(
        "❌ Email sending failed:",
        error.response?.body || error.message
      );
      throw new Error("Failed to send email");
    }
  }

  async sendOTP(email: string, otp: string): Promise<void> {
    this.initialize(); // Lazy initialization

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6; 
              color: #333;
              margin: 0;
              padding: 0;
              background-color: #f5f5f5;
            }
            .container { 
              max-width: 600px; 
              margin: 40px auto; 
              background: white;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            .header { 
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white; 
              padding: 40px 20px; 
              text-align: center; 
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
              font-weight: 600;
            }
            .content { 
              padding: 40px 30px;
            }
            .content h2 {
              color: #333;
              font-size: 24px;
              margin-top: 0;
              margin-bottom: 20px;
            }
            .content p {
              color: #666;
              font-size: 16px;
              margin: 16px 0;
            }
            .otp-container {
              background: #f8f9fa;
              border-radius: 8px;
              padding: 30px;
              margin: 30px 0;
              text-align: center;
            }
            .otp { 
              font-size: 36px; 
              font-weight: bold; 
              color: #667eea;
              letter-spacing: 12px;
              margin: 10px 0;
              font-family: 'Courier New', monospace;
            }
            .otp-label {
              color: #666;
              font-size: 14px;
              text-transform: uppercase;
              letter-spacing: 1px;
              margin-bottom: 10px;
            }
            .footer { 
              text-align: center; 
              color: #999; 
              font-size: 14px; 
              padding: 30px;
              background: #f8f9fa;
            }
            .divider {
              height: 1px;
              background: #e0e0e0;
              margin: 30px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Clause-IQ</h1>
            </div>
            <div class="content">
              <h2>Email Verification</h2>
              <p>Thank you for signing up with Clause-IQ! We're excited to help you manage your contracts efficiently.</p>
              <p>Please use the following one-time password (OTP) to verify your email address:</p>
              <div class="otp-container">
                <div class="otp-label">Your Verification Code</div>
                <div class="otp">${otp}</div>
              </div>
              <p><strong>⏰ This OTP will expire in 10 minutes.</strong></p>
              <div class="divider"></div>
              <p style="color: #999; font-size: 14px;">If you didn't request this verification code, please ignore this email or contact support if you have concerns.</p>
            </div>
            <div class="footer">
              <p>&copy; 2025 Clause-IQ. All rights reserved.</p>
              <p>Intelligent Contract Management</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await this.sendEmail({
      to: email,
      subject: "Verify Your Email - Clause-IQ",
      html,
      text: `Your OTP is: ${otp}. It will expire in 10 minutes.`,
    });
  }

  async sendInvitation(
    email: string,
    organizationName: string,
    inviterName: string,
    inviteToken: string
  ): Promise<void> {
    this.initialize(); // Lazy initialization

    const inviteUrl = `${
      process.env.FRONTEND_URL || "http://localhost:5173"
    }/accept-invite?token=${inviteToken}`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6; 
              color: #333;
              margin: 0;
              padding: 0;
              background-color: #f5f5f5;
            }
            .container { 
              max-width: 600px; 
              margin: 40px auto; 
              background: white;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            .header { 
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white; 
              padding: 40px 20px; 
              text-align: center; 
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
              font-weight: 600;
            }
            .content { 
              padding: 40px 30px;
            }
            .content h2 {
              color: #333;
              font-size: 24px;
              margin-top: 0;
              margin-bottom: 20px;
            }
            .content p {
              color: #666;
              font-size: 16px;
              margin: 16px 0;
            }
            .invite-box {
              background: #f8f9fa;
              border-left: 4px solid #667eea;
              padding: 20px;
              margin: 25px 0;
              border-radius: 4px;
            }
            .button-container {
              text-align: center;
              margin: 35px 0;
            }
            .button { 
              display: inline-block; 
              padding: 16px 40px; 
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white !important; 
              text-decoration: none; 
              border-radius: 8px;
              font-weight: 600;
              font-size: 16px;
              box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
            }
            .button:hover {
              box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
            }
            .link-box {
              background: #f8f9fa;
              padding: 15px;
              border-radius: 6px;
              margin: 20px 0;
              word-break: break-all;
              font-size: 14px;
              color: #666;
            }
            .footer { 
              text-align: center; 
              color: #999; 
              font-size: 14px; 
              padding: 30px;
              background: #f8f9fa;
            }
            .divider {
              height: 1px;
              background: #e0e0e0;
              margin: 30px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🤝 Clause-IQ</h1>
            </div>
            <div class="content">
              <h2>You're Invited!</h2>
              <div class="invite-box">
                <p style="margin: 0;"><strong>${inviterName}</strong> has invited you to join</p>
                <p style="margin: 8px 0 0 0; font-size: 18px; color: #667eea;"><strong>${organizationName}</strong></p>
              </div>
              <p>Clause-IQ is an intelligent contract management platform that helps teams collaborate on contract analysis, risk assessment, and compliance tracking.</p>
              <p>Click the button below to accept the invitation and create your account:</p>
              <div class="button-container">
                <a href="${inviteUrl}" class="button">Accept Invitation</a>
              </div>
              <div class="divider"></div>
              <p style="font-size: 14px; color: #666;">Or copy and paste this link into your browser:</p>
              <div class="link-box">${inviteUrl}</div>
              <p style="color: #999; font-size: 14px;"><strong>⏰ This invitation will expire in 7 days.</strong></p>
            </div>
            <div class="footer">
              <p>&copy; 2025 Clause-IQ. All rights reserved.</p>
              <p>Intelligent Contract Management</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await this.sendEmail({
      to: email,
      subject: `You're invited to join ${organizationName} on Clause-IQ`,
      html,
      text: `${inviterName} has invited you to join ${organizationName} on Clause-IQ. Visit: ${inviteUrl}`,
    });
  }
}

export default new EmailService();
