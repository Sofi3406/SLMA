import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Test transporter connection
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Email transporter error:', error);
  } else {
    console.log('✅ Email server is ready to send messages');
  }
});

/**
 * Send verification email to new user
 */
export const sendVerificationEmail = async (email, name, token) => {
  try {
    const verificationUrl = `${process.env.FRONTEND_URL}/auth/verify-email?token=${token}`;
    
    const mailOptions = {
      from: `"Silte Ləmat Mehber" <${process.env.SMTP_FROM}>`,
      to: email,
      subject: 'Verify Your Email - Silte Ləmat Mehber',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Email Verification</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Welcome to Silte Ləmat Mehber!</h1>
          </div>
          <div class="content">
            <h2>Hello ${name},</h2>
            <p>Thank you for registering with Silte Ləmat Mehber community.</p>
            <p>Please verify your email address by clicking the button below:</p>
            <p style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" class="button">Verify Email Address</a>
            </p>
            <p>This verification link will expire in 24 hours.</p>
            <p>If you didn't create an account, you can safely ignore this email.</p>
            <div class="footer">
              <p>Best regards,<br>The SLMA Team</p>
              <p>If the button doesn't work, copy and paste this link:<br>
              <small>${verificationUrl}</small></p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Hello ${name},\n\nWelcome to Silte Ləmat Mehber! Please verify your email by clicking this link: ${verificationUrl}\n\nIf you didn't create an account, ignore this email.\n\nBest regards,\nThe SLMA Team`
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Verification email sent to ${email}: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`❌ Error sending verification email to ${email}:`, error);
    throw error;
  }
};

/**
 * Send password reset email
 */
export const sendPasswordResetEmail = async (email, name, token) => {
  try {
    const resetUrl = `${process.env.FRONTEND_URL}/auth/reset-password/${token}`;
    
    const mailOptions = {
      from: `"Silte Ləmat Mehber" <${process.env.SMTP_FROM}>`,
      to: email,
      subject: 'Reset Your Password - Silte Ləmat Mehber',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; }
            .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          <div class="content">
            <h2>Hello ${name},</h2>
            <p>We received a request to reset your password for your Silte Ləmat Mehber account.</p>
            <p>Click the button below to create a new password:</p>
            <p style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </p>
            <div class="warning">
              <strong>⚠️ Important:</strong>
              <p>This link will expire in 1 hour for security reasons.</p>
              <p>If you didn't request a password reset, please ignore this email or contact support if you're concerned.</p>
            </div>
            <div class="footer">
              <p>Best regards,<br>The SLMA Team</p>
              <p>If the button doesn't work, copy and paste this link:<br>
              <small>${resetUrl}</small></p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Hello ${name},\n\nYou requested to reset your password. Click this link: ${resetUrl}\n\nThis link expires in 1 hour.\n\nIf you didn't request this, please ignore this email.\n\nBest regards,\nThe SLMA Team`
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Password reset email sent to ${email}: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`❌ Error sending password reset email to ${email}:`, error);
    throw error;
  }
};

/**
 * Send welcome email after verification
 */
export const sendWelcomeEmail = async (email, name, membershipId) => {
  try {
    const mailOptions = {
      from: `"Silte Ləmat Mehber" <${process.env.SMTP_FROM}>`,
      to: email,
      subject: 'Welcome to Silte Ləmat Mehber!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to SLMA</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .badge { background: #4F46E5; color: white; padding: 5px 15px; border-radius: 20px; display: inline-block; font-weight: bold; }
            .features { margin: 20px 0; }
            .feature-item { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #4F46E5; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🎉 Welcome Aboard!</h1>
          </div>
          <div class="content">
            <h2>Hello ${name},</h2>
            <p>Congratulations! Your email has been verified and your account is now fully activated.</p>
            
            <p><strong>Your Membership ID:</strong> <span class="badge">${membershipId}</span></p>
            
            <div class="features">
              <h3>What you can do now:</h3>
              <div class="feature-item">
                <strong>👥 Connect with Community</strong>
                <p>Join discussions with other Siltie community members</p>
              </div>
              <div class="feature-item">
                <strong>📅 Attend Events</strong>
                <p>Participate in cultural and community events</p>
              </div>
              <div class="feature-item">
                <strong>💼 Access Resources</strong>
                <p>Get access to exclusive community resources</p>
              </div>
            </div>
            
            <p>Start exploring by logging into your account:</p>
            <p style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}/auth/login" class="button" style="background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Go to Dashboard</a>
            </p>
            
            <div class="footer">
              <p>Need help? Contact us at support@siltecommunity.org</p>
              <p>Best regards,<br>The SLMA Team</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Hello ${name},\n\nWelcome to Silte Ləmat Mehber! Your account is now verified.\n\nYour Membership ID: ${membershipId}\n\nYou can now:\n- Connect with community members\n- Attend events\n- Access exclusive resources\n\nLogin: ${process.env.FRONTEND_URL}/auth/login\n\nNeed help? Contact support@siltecommunity.org\n\nBest regards,\nThe SLMA Team`
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Welcome email sent to ${email}: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`❌ Error sending welcome email to ${email}:`, error);
    throw error;
  }
};

/**
 * Test email function
 */
export const testEmailService = async (toEmail) => {
  try {
    const testMailOptions = {
      from: `"SLMA Test" <${process.env.SMTP_FROM}>`,
      to: toEmail,
      subject: 'Test Email from SLMA Backend',
      text: 'This is a test email from your SLMA backend server. If you receive this, email service is working!',
      html: '<h1>Test Email</h1><p>This is a test email from your SLMA backend server.</p><p>If you receive this, email service is working correctly!</p>'
    };

    const info = await transporter.sendMail(testMailOptions);
    console.log(`✅ Test email sent to ${toEmail}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ Test email failed:`, error);
    return { success: false, error: error.message };
  }
};