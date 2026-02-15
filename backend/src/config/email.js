import nodemailer from 'nodemailer';

const emailHost = process.env.SMTP_HOST || process.env.EMAIL_HOST;
const emailPort = Number(process.env.SMTP_PORT || process.env.EMAIL_PORT || 587);
const emailUser = process.env.SMTP_USER || process.env.EMAIL_USER;
const emailPass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
const emailFrom = process.env.SMTP_FROM || process.env.EMAIL_FROM || emailUser;
const emailService = process.env.SMTP_SERVICE || process.env.EMAIL_SERVICE;
const parseBool = (value) =>
  typeof value === 'string' ? value.toLowerCase() === 'true' : undefined;
const emailSecure = parseBool(process.env.SMTP_SECURE || process.env.EMAIL_SECURE);

const transporter = nodemailer.createTransport({
  ...(emailService ? { service: emailService } : { host: emailHost, port: emailPort }),
  secure: emailSecure ?? emailPort === 465,
  auth: {
    user: emailUser,
    pass: emailPass,
  },
});

export const sendEmail = async (to, subject, html) => {
  try {
    const mailOptions = {
      from: `"SLMA Platform" <${emailFrom}>`,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 Email sent: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error('❌ Email send error:', error);
    return false;
  }
};

export default transporter;