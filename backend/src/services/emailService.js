import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const parseBool = (value) =>
  typeof value === 'string' ? value.toLowerCase() === 'true' : undefined;

const emailHost = process.env.SMTP_HOST || process.env.EMAIL_HOST;
const emailPort = Number(process.env.SMTP_PORT || process.env.EMAIL_PORT || 587);
const emailUser = process.env.SMTP_USER || process.env.EMAIL_USER;
const emailPass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
const emailFrom = process.env.SMTP_FROM || process.env.EMAIL_FROM || emailUser;
const emailService = process.env.SMTP_SERVICE || process.env.EMAIL_SERVICE;
const emailSecure = parseBool(process.env.SMTP_SECURE || process.env.EMAIL_SECURE);
const emailDisabled =
  parseBool(process.env.SMTP_DISABLED || process.env.EMAIL_DISABLED) === true ||
  !emailUser ||
  !emailPass;
const tlsRejectUnauthorized = parseBool(process.env.SMTP_TLS_REJECT_UNAUTHORIZED);

// Create transporter
const transporter = emailDisabled
  ? nodemailer.createTransport({ jsonTransport: true })
  : nodemailer.createTransport({
      ...(emailService ? { service: emailService } : { host: emailHost, port: emailPort }),
      secure: emailSecure ?? emailPort === 465,
      auth: {
        user: emailUser,
        pass: emailPass,
      },
      ...(typeof tlsRejectUnauthorized === 'boolean'
        ? { tls: { rejectUnauthorized: tlsRejectUnauthorized } }
        : {}),
    });

// Test transporter connection
if (emailDisabled) {
  console.warn('⚠️ Email is disabled or missing SMTP credentials. Emails will be skipped.');
} else {
  transporter.verify((error) => {
    if (error) {
      console.error('❌ Email transporter error:', error);
    } else {
      console.log('✅ Email server is ready to send messages');
    }
  });
}

// ============================================
// ✅ EXISTING FUNCTIONS - UNCHANGED BELOW
// ============================================

/**
 * Send verification email to new user
 */
export const sendVerificationEmail = async (email, name, token) => {
  try {
    const verificationUrl = `${process.env.FRONTEND_URL}/auth/verify-email?token=${token}`;
    
    const mailOptions = {
      from: `"Silte Lmat Mehber" <${process.env.SMTP_FROM}>`,
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
            <h1>Welcome to Silte Lmat Mehber!</h1>
          </div>
          <div class="content">
            <h2>Hello ${name},</h2>
            <p>Thank you for registering with Silte Lmat Mehber community.</p>
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
      text: `Hello ${name},\n\nWelcome to Silte Lmat Mehber! Please verify your email by clicking this link: ${verificationUrl}\n\nIf you didn't create an account, ignore this email.\n\nBest regards,\nThe SLMA Team`
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
 * Send payment verification email
 */
export const sendPaymentVerificationEmail = async (email, name, plan, membershipId) => {
  try {
    const amount = plan === 'active' ? 'ETB 500' : 'ETB 1,200';
    const planName = plan === 'active' ? 'Active Member' : 'Premium Member';
    
    const mailOptions = {
      from: `"SLMA Payment Verification" <${process.env.SMTP_FROM}>`,
      to: email,
      subject: `Payment Receipt Received - ${planName} Membership`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Payment Verification</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .info-box { background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
            .warning-box { background: #fffbeb; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #fde68a; color: #92400e; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Payment Receipt Received</h1>
            <p>SLMA Membership Registration</p>
          </div>
          
          <div class="content">
            <h2>Hello ${name},</h2>
            <p>Thank you for submitting your payment receipt for <strong>${planName}</strong> membership.</p>
            
            <div class="info-box">
              <h3 style="margin-top: 0;">Registration Details:</h3>
              <p><strong>Membership ID:</strong> ${membershipId}</p>
              <p><strong>Plan:</strong> ${planName}</p>
              <p><strong>Amount:</strong> ${amount}</p>
              <p><strong>Status:</strong> <span style="color: #f59e0b;">Payment Verification Pending</span></p>
            </div>
            
            <h3>📋 Next Steps:</h3>
            <ol style="padding-left: 20px;">
              <li>Our team will verify your payment receipt</li>
              <li>You'll receive an email once verification is complete</li>
              <li>After verification, your membership will be activated</li>
              <li>You can then login and access all member benefits</li>
            </ol>
            
            <div class="warning-box">
              <p style="margin: 0;">
                ⏰ <strong>Verification Time:</strong> Usually within 24-48 hours
              </p>
            </div>
            
            <p>If you have any questions, please contact our membership team at <a href="mailto:membership@siltecommunity.org">membership@siltecommunity.org</a>.</p>
            
            <div class="footer">
              <p style="color: #6b7280; font-size: 12px;">
                This is an automated message. Please do not reply to this email.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Hello ${name},\n\nThank you for submitting your payment receipt for ${planName} membership.\n\nMembership ID: ${membershipId}\nPlan: ${planName}\nAmount: ${amount}\nStatus: Payment Verification Pending\n\nOur team will verify your payment receipt within 24-48 hours. You'll receive another email once verification is complete.\n\nIf you have questions, contact membership@siltecommunity.org\n\nBest regards,\nSLMA Team`
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Payment verification email sent to ${email}: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`❌ Error sending payment verification email to ${email}:`, error);
    throw error;
  }
};

/**
 * Send payment approved email
 */
export const sendPaymentApprovedEmail = async (email, name, membershipId) => {
  try {
    const mailOptions = {
      from: `"SLMA Membership" <${process.env.SMTP_FROM}>`,
      to: email,
      subject: '🎉 Payment Verified - Welcome to SLMA!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Payment Approved</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .success-box { background: #d1fae5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981; }
            .button { display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; }
            .badge { background: #4F46E5; color: white; padding: 5px 15px; border-radius: 20px; display: inline-block; font-weight: bold; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Payment Verified Successfully!</h1>
          </div>
          
          <div class="content">
            <h2>Congratulations ${name}!</h2>
            
            <div class="success-box">
              <h3 style="margin-top: 0; color: #065f46;">✅ Payment Approved</h3>
              <p>Your payment has been verified and your SLMA membership is now active!</p>
            </div>
            
            <p><strong>Your Membership ID:</strong> <span class="badge">${membershipId}</span></p>
            
            <h3>🎯 What's Next?</h3>
            <ul>
              <li>Access all member benefits on the platform</li>
              <li>Join community discussions and events</li>
              <li>Download your digital membership card</li>
              <li>Participate in voting and community decisions</li>
            </ul>
            
            <p style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}/dashboard" class="button">Go to Your Dashboard</a>
            </p>
            
            <p>Need help getting started? Check our <a href="${process.env.FRONTEND_URL}/help">Member Guide</a> or contact our support team.</p>
            
            <div class="footer">
              <p>Welcome to the SLMA community!</p>
              <p style="color: #6b7280; font-size: 12px;">
                This is an automated message from Silte Lmat Mehber Association.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Congratulations ${name}!\n\nYour payment has been verified and your SLMA membership is now active!\n\nMembership ID: ${membershipId}\n\nYou can now:\n- Access all member benefits\n- Join community discussions\n- Attend events\n- Participate in voting\n\nLogin: ${process.env.FRONTEND_URL}/auth/login\n\nWelcome to the SLMA community!\n\nBest regards,\nSLMA Team`
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Payment approved email sent to ${email}: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`❌ Error sending payment approved email to ${email}:`, error);
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
      from: `"Silte Lmat Mehber" <${process.env.SMTP_FROM}>`,
      to: email,
      subject: 'Reset Your Password - Silte Lmat Mehber',
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
      from: `"Silte Lmat Mehber" <${process.env.SMTP_FROM}>`,
      to: email,
      subject: 'Welcome to Silte Lmat Mehber!',
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
              <p>Need help? Contact us at supportsiltecommunity@gmail.com</p>
              <p>Best regards,<br>The SLMA Team</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Hello ${name},\n\nWelcome to Silte Lmat Mehber! Your account is now verified.\n\nYour Membership ID: ${membershipId}\n\nYou can now:\n- Connect with community members\n- Attend events\n- Access exclusive resources\n\nLogin: ${process.env.FRONTEND_URL}/auth/login\n\nNeed help? Contact supportsiltecommunity@gmail.com\n\nBest regards,\nThe SLMA Team`
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

/**
 * Send user account verification email (when admin verifies user)
 */
export const sendUserVerificationEmail = async (email, name, membershipId) => {
  try {
    const mailOptions = {
      from: `"SLMA Membership" <${process.env.SMTP_FROM}>`,
      to: email,
      subject: '✅ Account Verified - Welcome to SLMA!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Account Verified</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .success-box { background: #d1fae5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981; }
            .button { display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; }
            .badge { background: #4F46E5; color: white; padding: 5px 15px; border-radius: 20px; display: inline-block; font-weight: bold; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Account Verified Successfully!</h1>
          </div>
          
          <div class="content">
            <h2>Congratulations ${name}!</h2>
            
            <div class="success-box">
              <h3 style="margin-top: 0; color: #065f46;">✅ Your Account Has Been Verified</h3>
              <p>Your SLMA account has been verified by our admin team. You can now access all member features!</p>
            </div>
            
            ${membershipId ? `<p><strong>Your Membership ID:</strong> <span class="badge">${membershipId}</span></p>` : ''}
            
            <h3>🎯 What's Next?</h3>
            <ul>
              <li>Login to your account and explore member features</li>
              <li>Complete your profile to connect with the community</li>
              <li>Join community discussions and events</li>
              <li>Access exclusive member resources</li>
            </ul>
            
            <p style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}/auth/login" class="button">Login to Your Account</a>
            </p>
            
            <p>If you have any questions or need assistance, please contact our support team.</p>
            
            <div class="footer">
              <p>Welcome to the SLMA community!</p>
              <p style="color: #6b7280; font-size: 12px;">
                This is an automated message from Silte Lmat Mehber Association.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Congratulations ${name}!\n\nYour SLMA account has been verified by our admin team. You can now access all member features!\n\n${membershipId ? `Membership ID: ${membershipId}\n\n` : ''}What's Next:\n- Login to your account\n- Complete your profile\n- Join community discussions\n- Access member resources\n\nLogin: ${process.env.FRONTEND_URL}/auth/login\n\nWelcome to the SLMA community!\n\nBest regards,\nSLMA Team`
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ User verification email sent to ${email}: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`❌ Error sending user verification email to ${email}:`, error);
    throw error;
  }
};

/**
 * Send payment verification result email (when admin verifies/rejects payment)
 */
export const sendAdminPaymentVerificationEmail = async (email, name, status, amount, membershipId, notes) => {
  try {
    const isVerified = status === 'verified';
    const subject = isVerified 
      ? `✅ Payment Verified - Your SLMA Membership is Active!`
      : `⚠️ Payment Verification Update - Action Required`;
    
    const mailOptions = {
      from: `"SLMA Membership" <${process.env.SMTP_FROM}>`,
      to: email,
      subject,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Payment Verification</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, ${isVerified ? '#10b981' : '#ef4444'} 0%, ${isVerified ? '#059669' : '#dc2626'} 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .status-box { background: ${isVerified ? '#d1fae5' : '#fee2e2'}; color: ${isVerified ? '#065f46' : '#b91c1c'}; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${isVerified ? '#10b981' : '#ef4444'}; }
            .info-box { background: #f8fafc; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .button { display: inline-block; background: ${isVerified ? '#10b981' : '#4F46E5'}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; }
            .badge { background: #4F46E5; color: white; padding: 5px 15px; border-radius: 20px; display: inline-block; font-weight: bold; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${isVerified ? 'Payment Verified Successfully!' : 'Payment Verification Update'}</h1>
          </div>
          
          <div class="content">
            <h2>Hello ${name},</h2>
            
            <div class="status-box">
              <h3 style="margin-top: 0;">${isVerified ? '✅ Payment Approved' : '⚠️ Payment Issue'}</h3>
              ${isVerified ? `
                <p>Your payment of <strong>ETB ${amount}</strong> has been verified by our admin team. Your SLMA membership is now active!</p>
              ` : `
                <p>We encountered an issue while verifying your payment of <strong>ETB ${amount}</strong>.</p>
                ${notes ? `<p><strong>Reason:</strong> ${notes}</p>` : ''}
              `}
            </div>
            
            <div class="info-box">
              <h4 style="margin-top: 0;">Payment Details:</h4>
              <p><strong>Amount:</strong> ETB ${amount}</p>
              ${membershipId ? `<p><strong>Membership ID:</strong> <span class="badge">${membershipId}</span></p>` : ''}
              <p><strong>Status:</strong> ${isVerified ? 'Verified ✓' : 'Rejected'}</p>
              <p><strong>Date:</strong> ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            
            ${isVerified ? `
              <h3>🎉 What's Next?</h3>
              <ul>
                <li>Your membership is now active and you can access all member benefits</li>
                <li>Login to your account to explore features</li>
                <li>Join community discussions and events</li>
                <li>Download your digital membership card</li>
              </ul>
              
              <p style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_URL}/dashboard" class="button">Go to Your Dashboard</a>
              </p>
            ` : `
              <h3>🔄 What to do next:</h3>
              <ol>
                <li>Review the reason for rejection above</li>
                <li>Verify your payment details match our account information</li>
                <li>Ensure the receipt clearly shows the transaction details</li>
                <li>Contact support if you need assistance or want to upload a new receipt</li>
              </ol>
              
              <p><strong>Our Payment Details:</strong></p>
              <ul>
                <li>CBE Account: 1000212203746 (Sofiya Yasin)</li>
                <li>TeleBirr: +251 93 067 0088 (Sofiya Yasin)</li>
              </ul>
              
              <p style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_URL}/contact" class="button">Contact Support</a>
              </p>
            `}
            
            <div class="footer">
              <p><strong>Need help?</strong></p>
              <p>📧 Email: membershipsiltecommunity@gmail.com</p>
              <p>📞 Phone: +251 93 067 0088</p>
              <p style="color: #6b7280; font-size: 12px; margin-top: 20px;">
                ${isVerified ? 'Welcome to the SLMA community!' : 'We\'re here to help you complete your registration successfully.'}
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Hello ${name},\n\n${isVerified ? 
`✅ Your payment of ETB ${amount} has been verified by our admin team. Your SLMA membership is now active!\n\nPayment Details:\nAmount: ETB ${amount}\n${membershipId ? `Membership ID: ${membershipId}\n` : ''}Status: Verified\nDate: ${new Date().toLocaleDateString()}\n\nWhat's Next:\n- Your membership is now active\n- Login to access all member benefits\n- Join community discussions\n- Attend events\n\nLogin: ${process.env.FRONTEND_URL}/auth/login\n\nWelcome to the SLMA community!` : 
`⚠️ We encountered an issue while verifying your payment of ETB ${amount}.\n\nPayment Details:\nAmount: ETB ${amount}\n${membershipId ? `Membership ID: ${membershipId}\n` : ''}Status: Rejected\n${notes ? `Reason: ${notes}\n` : ''}Date: ${new Date().toLocaleDateString()}\n\nWhat to do next:\n1. Review the reason for rejection\n2. Verify payment details match our account\n3. Ensure receipt shows transaction details\n4. Contact support for assistance\n\nOur Payment Details:\n- CBE Account: 1000212203746 (Sofiya Yasin)\n- TeleBirr: +251 93 067 0088 (Sofiya Yasin)\n\nContact: membership@siltecommunity.org or +251 93 067 0088`}\n\nBest regards,\nSLMA Team`
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Admin payment verification email sent to ${email}: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`❌ Error sending admin payment verification email to ${email}:`, error);
    throw error;
  }
};

/**
 * Send payment rejected email
 */
export const sendPaymentRejectedEmail = async (email, name, membershipId, reason) => {
  try {
    const mailOptions = {
      from: `"SLMA Membership" <${process.env.SMTP_FROM}>`,
      to: email,
      subject: 'Payment Verification Required - SLMA Membership',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Payment Issue</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .alert-box { background: #fee2e2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444; }
            .button { display: inline-block; background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Payment Verification Issue</h1>
          </div>
          
          <div class="content">
            <h2>Hello ${name},</h2>
            
            <div class="alert-box">
              <h3 style="margin-top: 0; color: #b91c1c;">⚠️ Payment Receipt Issue</h3>
              <p>We encountered an issue with your payment receipt:</p>
              <p><strong>Reason:</strong> ${reason}</p>
            </div>
            
            <p><strong>Membership ID:</strong> ${membershipId}</p>
            
            <h3>🔄 What to do next:</h3>
            <ol>
              <li>Verify your payment details match our account information</li>
              <li>Ensure the receipt clearly shows the transaction details</li>
              <li>Upload a new receipt or contact support for assistance</li>
            </ol>
            
            <p>Please contact our membership team immediately:</p>
            <ul>
              <li>Email: membershipsiltecommunity@gmail.com</li>
              <li>Phone: +251 93 067 0088</li>
              <li>Account: CBE 1000212203746 (Sofiya Yasin)</li>
            </ul>
            
            <p style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}/contact" class="button">Contact Support</a>
            </p>
            
            <div class="footer">
              <p>We're here to help you complete your registration successfully.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Hello ${name},\n\nWe encountered an issue with your payment receipt.\n\nReason: ${reason}\n\nMembership ID: ${membershipId}\n\nPlease:\n1. Verify payment details match our account\n2. Ensure receipt shows transaction details\n3. Upload new receipt or contact support\n\nContact: membership@siltecommunity.org\nPhone: +251 93 067 0088\nAccount: CBE 1000212203746\n\nBest regards,\nSLMA Team`
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Payment rejected email sent to ${email}: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`❌ Error sending payment rejected email to ${email}:`, error);
    throw error;
  }
};

/**
 * Send monthly payment reminder (membership renewal due)
 */
export const sendMonthlyPaymentReminder = async (email, name, dueDate, amount, membershipId) => {
  try {
    const dueStr = new Date(dueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const mailOptions = {
      from: `"SLMA Membership" <${process.env.SMTP_FROM}>`,
      to: email,
      subject: `⏰ Membership Payment Reminder - Due ${dueStr}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .reminder-box { background: #fffbeb; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b; }
            .due-date { font-size: 1.2em; font-weight: bold; color: #b45309; }
            .button { display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>⏰ Membership Payment Reminder</h1>
          </div>
          <div class="content">
            <h2>Hello ${name},</h2>
            <div class="reminder-box">
              <p><strong>Your membership payment is coming due!</strong></p>
              <p class="due-date">Due date: ${dueStr}</p>
              <p>Amount: ETB ${amount || 500}</p>
              <p>Membership ID: ${membershipId || 'N/A'}</p>
            </div>
            <p>Please ensure your payment is completed before the due date to maintain uninterrupted access to SLMA benefits.</p>
            <p><strong>Payment details:</strong></p>
            <ul>
              <li>CBE Account: 1000212203746</li>
              <li>Account Name: Sofiya Yasin</li>
              <li>Telebirr: +251930670088</li>
            </ul>
            <p style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/membership" class="button">View Membership</a>
            </p>
            <div class="footer">
              <p>This is a monthly payment reminder from Silte Lmat Mehber Association.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Hello ${name},\n\nYour membership payment is coming due on ${dueStr}.\nAmount: ETB ${amount || 500}\nMembership ID: ${membershipId}\n\nPayment: CBE 1000212203746 (Sofiya Yasin), Telebirr +251930670088\n\nView: ${process.env.FRONTEND_URL}/membership\n\nBest regards,\nSLMA Team`
    };
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Payment reminder sent to ${email}`);
    return info;
  } catch (error) {
    console.error(`❌ Error sending payment reminder to ${email}:`, error);
    throw error;
  }
};

// ============================================
// ✅ NEW DONATION-RELATED FUNCTIONS ADDED BELOW
// ============================================

/**
 * Send donation payment instructions
 */
export const sendDonationEmail = async ({ to, donorName, amount, transactionId, paymentInstructions, donationType, project }) => {
  try {
    const { method, steps, details } = paymentInstructions;
    
    const subject = `Payment Instructions for Your SLMA Donation - ${transactionId}`;
    
    let htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Donation Payment Instructions</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .info-box { background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
          .instruction-box { background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .warning-box { background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border: 1px solid #ffeaa7; }
          .button { display: inline-block; background: #27ae60; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Thank You for Your Donation, ${donorName}!</h1>
        </div>
        
        <div class="content">
          <div class="info-box">
            <h3 style="color: #27ae60; margin-top: 0;">Donation Details:</h3>
            <p><strong>Transaction ID:</strong> ${transactionId}</p>
            <p><strong>Amount:</strong> ETB ${amount}</p>
            <p><strong>Type:</strong> ${donationType === 'monthly' ? 'Monthly Recurring' : 'One-time'}</p>
            <p><strong>Project:</strong> ${project}</p>
            <p><strong>Payment Method:</strong> ${method.toUpperCase()}</p>
          </div>
          
          <div class="instruction-box">
            <h3 style="color: #1565c0; margin-top: 0;">Payment Instructions (${method}):</h3>
            <ol style="margin-left: 20px;">
              ${steps.map(step => `<li>${step}</li>`).join('')}
            </ol>
          </div>
          
          <div class="warning-box">
            <h4 style="color: #856404; margin-top: 0;">Important Details:</h4>
            ${Object.entries(details).map(([key, value]) => `
              <p><strong>${key.replace(/([A-Z])/g, ' $1').toUpperCase()}:</strong> ${value}</p>
            `).join('')}
            <p><strong>REFERENCE:</strong> Use "${donorName.substring(0, 20)}" or your phone number</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; text-align: center;">
            <p><strong>After completing payment, please upload your receipt:</strong></p>
            <a href="${process.env.FRONTEND_URL}/donate/upload/${transactionId}" 
               class="button">
              📤 Upload Receipt
            </a>
          </div>
          
          <div class="footer">
            <p><strong>Need help?</strong> Contact our donation team:</p>
            <p>📧 Email: donationssiltecommunity@gmail.com</p>
            <p>📞 Phone: +251 93 067 0088</p>
            <p style="font-size: 0.9em; margin-top: 20px; color: #6b7280;">
              Silte Language & Multicultural Association<br>
              Preserving Heritage, Empowering Future
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    const mailOptions = {
      from: `"SLMA Donations" <${process.env.SMTP_FROM}>`,
      to,
      subject,
      html: htmlContent,
      text: `
Dear ${donorName},

Thank you for your donation to Silte Lmat Mehber!

DONATION DETAILS:
Transaction ID: ${transactionId}
Amount: ETB ${amount}
Type: ${donationType === 'monthly' ? 'Monthly Recurring' : 'One-time'}
Project: ${project}
Payment Method: ${method.toUpperCase()}

PAYMENT INSTRUCTIONS (${method.toUpperCase()}):
${steps.map((step, index) => `${index + 1}. ${step}`).join('\n')}

IMPORTANT DETAILS:
${Object.entries(details).map(([key, value]) => `${key.toUpperCase()}: ${value}`).join('\n')}
REFERENCE: Use "${donorName.substring(0, 20)}" or your phone number

After payment, upload your receipt at:
${process.env.FRONTEND_URL}/donate/upload/${transactionId}

Need help? Contact: donationssiltecommunity@gmail.com or call +251 93 067 0088

Thank you for supporting our community!
Silte Language & Multicultural Association
`
    };
    
    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Donation email sent to ${to}: ${result.messageId}`);
    return { success: true, messageId: result.messageId };
    
  } catch (error) {
    console.error('❌ Failed to send donation email:', error);
    throw error;
  }
};

/**
 * Send receipt verification status email for donations
 */
export const sendReceiptVerificationEmail = async ({ to, donorName, amount, status, transactionId, notes }) => {
  try {
    const isVerified = status === 'verified';
    const subject = isVerified 
      ? `Receipt Verified - Thank You! (${transactionId})`
      : `Receipt Verification Update (${transactionId})`;
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Receipt Verification</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, ${isVerified ? '#10b981' : '#ef4444'} 0%, ${isVerified ? '#059669' : '#dc2626'} 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .status-box { background: ${isVerified ? '#d1fae5' : '#fee2e2'}; color: ${isVerified ? '#065f46' : '#b91c1c'}; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${isVerified ? '#10b981' : '#ef4444'}; }
          .info-box { background: #f8fafc; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${isVerified ? '✅ Receipt Verified Successfully!' : '⚠️ Receipt Verification Update'}</h1>
        </div>
        
        <div class="content">
          <p>Dear ${donorName},</p>
          
          <div class="status-box">
            <h3 style="margin-top: 0;">${isVerified ? 'Your donation receipt has been verified!' : 'Receipt Verification Issue'}</h3>
            ${isVerified ? `
              <p>Thank you for supporting the Silte community. Your contribution of <strong>ETB ${amount}</strong> 
              has been confirmed and recorded.</p>
            ` : `
              <p>We encountered an issue while verifying your receipt for donation <strong>ETB ${amount}</strong>.</p>
              ${notes ? `<p><strong>Reason:</strong> ${notes}</p>` : ''}
            `}
          </div>
          
          <div class="info-box">
            <h4 style="margin-top: 0;">Transaction Summary:</h4>
            <p><strong>Transaction ID:</strong> ${transactionId}</p>
            <p><strong>Amount:</strong> ETB ${amount}</p>
            <p><strong>Status:</strong> ${isVerified ? 'Verified ✓' : 'Needs Attention'}</p>
            <p><strong>Date:</strong> ${new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</p>
          </div>
          
          ${isVerified ? `
            <p>You will receive an official tax-deductible receipt within 7-10 business days.</p>
          ` : `
            <p><strong>What to do next:</strong></p>
            <ol>
              <li>Verify your payment details match our account information</li>
              <li>Ensure the receipt clearly shows the transaction details</li>
              <li>Upload a new receipt or contact support for assistance</li>
            </ol>
            <p><strong>Our Payment Details:</strong></p>
            <ul>
              <li>CBE Account: 1000212203746 (Sofiya Yasin)</li>
              <li>TeleBirr: +251 93 067 0088 (Sofiya Yasin)</li>
            </ul>
          `}
          
          <div class="footer">
            <p><strong>For any questions:</strong></p>
            <p>📧 Email: donationssiltecommunity@gmail.com</p>
            <p>📞 Phone: +251 93 067 0088</p>
            <p>🕒 Hours: Mon-Fri, 9AM-5PM EAT</p>
            
            <p style="font-size: 0.9em; margin-top: 20px; color: #6b7280;">
              <em>Your support makes a difference in preserving Silte heritage.</em><br>
              Silte Language & Multicultural Association
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    const mailOptions = {
      from: `"SLMA Donations" <${process.env.SMTP_FROM}>`,
      to,
      subject,
      html: htmlContent,
      text: `
Dear ${donorName},

${isVerified ? 
`✅ Your donation receipt has been verified!

Thank you for supporting the Silte community. Your contribution of ETB ${amount} has been confirmed and recorded.

Transaction ID: ${transactionId}
Amount: ETB ${amount}
Status: Verified
Date: ${new Date().toLocaleDateString()}

You will receive an official tax-deductible receipt within 7-10 business days.` : 
`⚠️ Receipt Verification Issue

We encountered an issue while verifying your receipt for donation ETB ${amount}.

Transaction ID: ${transactionId}
Amount: ETB ${amount}
Status: Needs Attention
${notes ? `Reason: ${notes}\n` : ''}

What to do next:
1. Verify your payment details match our account
2. Ensure receipt shows transaction details
3. Upload a new receipt or contact support

Our Payment Details:
- CBE Account: 1000212203746 (Sofiya Yasin)
- TeleBirr: +251 93 067 0088 (Sofiya Yasin)`
}

For questions, contact:
Email: donations@siltecommunity.org
Phone: +251 93 067 0088

Thank you for your support!
Silte Language & Multicultural Association
`
    };
    
    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Donation verification email sent to ${to}: ${result.messageId}`);
    return { success: true, messageId: result.messageId };
    
  } catch (error) {
    console.error('❌ Failed to send donation verification email:', error);
    throw error;
  }
};

/**
 * Send donation receipt confirmation (when user uploads receipt)
 */
export const sendDonationReceiptConfirmation = async ({ to, donorName, amount, transactionId }) => {
  try {
    const subject = `Donation Receipt Received - ${transactionId}`;
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Receipt Confirmation</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .confirmation-box { background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6; }
          .info-box { background: #f8fafc; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Receipt Received Successfully!</h1>
        </div>
        
        <div class="content">
          <p>Dear ${donorName},</p>
          
          <div class="confirmation-box">
            <h3 style="color: #3b82f6; margin-top: 0;">✅ Receipt Upload Confirmed</h3>
            <p>We have successfully received your payment receipt for donation <strong>ETB ${amount}</strong>.</p>
          </div>
          
          <div class="info-box">
            <h4 style="margin-top: 0;">Transaction Details:</h4>
            <p><strong>Transaction ID:</strong> ${transactionId}</p>
            <p><strong>Amount:</strong> ETB ${amount}</p>
            <p><strong>Status:</strong> Under Review</p>
            <p><strong>Receipt Received:</strong> ${new Date().toLocaleDateString()}</p>
          </div>
          
          <h4>📋 Next Steps:</h4>
          <ol>
            <li>Our team will verify your payment receipt</li>
            <li>Verification usually takes 24-48 hours</li>
            <li>You'll receive another email once verification is complete</li>
            <li>After verification, your donation will be officially recorded</li>
          </ol>
          
          <p><strong>Note:</strong> If you have any questions about your payment, please contact us immediately.</p>
          
          <div class="footer">
            <p><strong>Need to contact us?</strong></p>
            <p>📧 Email: donationssiltecommunity@gmail.com</p>
            <p>📞 Phone: +251 93 067 0088</p>
            <p style="font-size: 0.9em; margin-top: 20px; color: #6b7280;">
              Thank you for your patience and support!<br>
              Silte Language & Multicultural Association
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    const mailOptions = {
      from: `"SLMA Donations" <${process.env.SMTP_FROM}>`,
      to,
      subject,
      html: htmlContent,
      text: `
Dear ${donorName},

✅ We have successfully received your payment receipt for donation ETB ${amount}.

TRANSACTION DETAILS:
Transaction ID: ${transactionId}
Amount: ETB ${amount}
Status: Under Review
Receipt Received: ${new Date().toLocaleDateString()}

NEXT STEPS:
1. Our team will verify your payment receipt
2. Verification usually takes 24-48 hours
3. You'll receive another email once verification is complete
4. After verification, your donation will be officially recorded

If you have any questions about your payment, please contact us immediately.

Contact us:
Email: donationssiltecommunity@gmail.com
Phone: +251 93 067 0088

Thank you for your patience and support!
Silte Language & Multicultural Association
`
    };
    
    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Donation receipt confirmation sent to ${to}: ${result.messageId}`);
    return { success: true, messageId: result.messageId };
    
  } catch (error) {
    console.error('❌ Failed to send donation receipt confirmation:', error);
    throw error;
  }
};

// ============================================
// ✅ EXPORT ALL FUNCTIONS
// ============================================

export default {
  // Original functions
  sendVerificationEmail,
  sendPaymentVerificationEmail,
  sendPaymentApprovedEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
  testEmailService,
  sendPaymentRejectedEmail,
  sendMonthlyPaymentReminder,
  
  // Admin verification functions
  sendUserVerificationEmail,
  sendAdminPaymentVerificationEmail,
  
  // New donation functions
  sendDonationEmail,
  sendReceiptVerificationEmail,
  sendDonationReceiptConfirmation
};