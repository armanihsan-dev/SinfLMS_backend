// src/services/mailer.service.ts
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Verify the connection on startup
transporter.verify((error) => {
  if (error) {
    console.error('❌ Mailer connection failed:', error);
  } else {
    console.log('✅ Mailer ready');
  }
});

export class MailerService {
  async sendOTP(to: string, otp: string, fullName?: string) {
    const html = `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="utf-8" />  
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <meta name="color-scheme" content="light dark" />
            <meta name="supported-color-schemes" content="light dark" />
            <style>
              /* Poppins via Google Fonts — works in most modern clients, degrades gracefully elsewhere */
              @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@400;500;600;700&display=swap');

              /* Dark mode overrides — iOS Mail, Apple Mail, Outlook.com, newer Gmail */
              @media (prefers-color-scheme: dark) {
                .email-bg        { background: #0a0a0a !important; }
                .email-card      { background: #18181b !important; border-color: #27272a !important; }
                .email-brand     { color: #4fa8a8 !important; }
                .email-title     { color: #fafafa !important; }
                .email-body      { color: #a1a1aa !important; }
                .email-muted     { color: #71717a !important; }
                .otp-block       { background: #1f1f22 !important; border-color: #3f3f46 !important; }
                .otp-label       { color: #71717a !important; }
                .otp-code        { color: #4fa8a8 !important; }
                .email-footer    { color: #52525b !important; }
              }
            </style>
          </head>
          <body style="margin: 0; padding: 0; background: #f4f7f7;">

            <!-- Preheader (hidden preview text in the inbox) -->
            <div style="display: none; max-height: 0; overflow: hidden; opacity: 0; visibility: hidden; mso-hide: all;">
              Your SinfLMS verification code is ${otp}. It expires in 10 minutes.
            </div>

            <div class="email-bg" style="font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 40px 20px; background: #f4f7f7;">
              <div class="email-card" style="background: #ffffff; border-radius: 16px; padding: 40px 36px; border: 1px solid #d4e8e8; box-shadow: 0 1px 3px rgba(13, 61, 61, 0.06);">

                <!-- Brand mark -->
                <div class="email-brand" style="font-family: 'Poppins', sans-serif; font-size: 13px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #0d3d3d; margin-bottom: 28px;">
                  SinfLMS
                </div>

                <h1 class="email-title" style="font-family: 'Poppins', sans-serif; font-size: 24px; font-weight: 600; line-height: 1.3; margin: 0 0 12px; color: #0d3d3d; letter-spacing: -0.01em;">
                  Verify your email
                </h1>

                <p class="email-body" style="font-family: 'Poppins', sans-serif; font-size: 15px; font-weight: 400; line-height: 1.65; color: #4d6b6b; margin: 0 0 32px;">
                  ${fullName ? `Hi ${fullName}, use` : 'Use'} this code to verify your email address. It expires in 10 minutes.
                </p>

                <!-- OTP block -->
                <div class="otp-block" style="background: #ecf7f7; border: 1px dashed #a8d4d4; border-radius: 12px; padding: 28px 20px; text-align: center; margin-bottom: 32px;">
                  <div class="otp-label" style="font-family: 'Poppins', sans-serif; font-size: 11px; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase; color: #4d6b6b; margin-bottom: 14px;">
                    Verification code
                  </div>
                  <div class="otp-code" style="font-family: 'SF Mono', 'Menlo', 'Courier New', monospace; font-size: 36px; font-weight: 700; letter-spacing: 10px; color: #0d3d3d; line-height: 1;">
                    ${otp}
                  </div>
                </div>

                <p class="email-muted" style="font-family: 'Poppins', sans-serif; font-size: 13px; font-weight: 400; line-height: 1.65; color: #7a9999; margin: 0;">
                  If you didn't request this, you can safely ignore this email. No changes will be made to your account.
                </p>
              </div>

              <p class="email-footer" style="font-family: 'Poppins', sans-serif; text-align: center; font-size: 12px; font-weight: 400; color: #7a9999; margin: 24px 0 0;">
                © ${new Date().getFullYear()} SinfLMS. All rights reserved.
              </p>
            </div>
          </body>
          </html>
`;

    return transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject: `${otp} is your SinfLMS verification code`,
      html,
      text: `Your SinfLMS verification code is ${otp}. It expires in 10 minutes.`,
    });
  }
}

export const mailerService = new MailerService();