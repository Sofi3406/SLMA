import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import errorHandler from './middlewares/errorHandler.js';

// Import routes
import authRoutes from './routes/auth.js';
import donationRoutes from './routes/donationRoutes.js';
import eventRoutes from './routes/events.js'; 
import adminUsersRoutes from './routes/adminUsers.js';
import adminRoutes from './routes/admin.js'; 
import galleryRoutes from './routes/galleries.js';
import activitiesRoutes from './routes/activities.js';
import dashboardRoutes from './routes/dashboard.js';
import projectRoutes from './routes/projects.js';
import coFoundersRoutes from './routes/coFounders.js';

// Import email service and payment reminder
import { testEmailService, sendMonthlyPaymentReminder } from './services/emailService.js';
import User from './models/User.js';

// Load env vars
dotenv.config();

// ES module fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect to database
connectDB();

const app = express();

// CORS Configuration - MUST BE FIRST MIDDLEWARE
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'Accept', 
    'X-Requested-With',
    'Origin',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers'
  ],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  optionsSuccessStatus: 200,
  maxAge: 86400, // 24 hours
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Handle preflight requests for all routes
app.options('*', cors(corsOptions));

// Body parser middleware
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Static folders
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
// Legacy fallback for files saved under src/uploads
app.use('/uploads', express.static(path.join(__dirname, './uploads')));
app.use('/uploads/donation-receipts', express.static(path.join(__dirname, '../uploads/donation-receipts')));
app.use('/uploads/event-images', express.static(path.join(__dirname, '../uploads/event-images')));
app.use('/uploads/receipts', express.static(path.join(__dirname, '../uploads/receipts')));
app.use('/uploads/registration', express.static(path.join(__dirname, '../uploads/registration')));
app.use('/uploads/galleries', express.static(path.join(__dirname, '../uploads/galleries')));
app.use('/uploads/project-images', express.static(path.join(__dirname, '../uploads/project-images')));
app.use('/uploads/cofounders', express.static(path.join(__dirname, '../uploads/cofounders')));

// ============================================
// ✅ HEALTH CHECK ENDPOINT
// ============================================

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: '✅ SLMA Backend is healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
    backendUrl: `http://localhost:${process.env.PORT || 5000}`,
    database: 'Connected',
    version: '1.2.0',
    features: {
      authentication: 'active',
      donations: 'active',
      membership: 'active',
      events: 'active',
      fileUpload: 'active'
    }
  });
});

// ============================================
// ✅ TEST ENDPOINTS
// ============================================

// Test email endpoint
app.post('/api/test-email', async (req, res) => {
  try {
    const { email } = req.body;
    
    console.log('📧 Test email request:', { email });
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    const result = await testEmailService(email);
    
    if (result.success) {
      console.log('✅ Test email sent successfully:', result.messageId);
      res.json({
        success: true,
        message: 'Test email sent successfully',
        messageId: result.messageId,
        timestamp: new Date().toISOString()
      });
    } else {
      console.error('❌ Failed to send test email:', result.error);
      res.status(500).json({
        success: false,
        message: 'Failed to send test email',
        error: result.error,
        troubleshooting: [
          '1. Check SMTP configuration in .env file',
          '2. Verify Gmail app password is correct',
          '3. Check internet connection',
          '4. Ensure firewall allows port 587'
        ]
      });
    }
  } catch (error) {
    console.error('🔥 Test email endpoint error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while sending test email',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Test registration endpoint
app.post('/api/test-register', (req, res) => {
  console.log('✅ Test registration endpoint hit:', req.body);
  res.json({
    success: true,
    message: 'Test endpoint working!',
    receivedData: req.body,
    timestamp: new Date().toISOString(),
  });
});

// Test donation endpoint
app.post('/api/test-donation', (req, res) => {
  console.log('✅ Test donation endpoint hit:', {
    amount: req.body?.amount,
    email: req.body?.donor?.email ? `${req.body.donor.email.substring(0, 10)}...` : 'none'
  });
  res.json({
    success: true,
    message: 'Donation test endpoint working!',
    timestamp: new Date().toISOString(),
    paymentDetails: {
      cbeAccount: '1000212203746',
      cbeName: 'SOFIYA YASIN',
      telebirrPhone: '+251930670088',
      bank: 'Commercial Bank of Ethiopia'
    }
  });
});

// ============================================
// ✅ WELCOME ROUTE
// ============================================

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🚀 SLMA Platform API is running...',
    version: '1.2.0',
    documentation: {
      health: 'GET /api/health',
      test: {
        email: 'POST /api/test-email',
        register: 'POST /api/test-register',
        donation: 'POST /api/test-donation'
      },
      endpoints: {
        auth: '/api/auth',
        donations: '/api/donations',
        events: '/api/events',
      }
    },
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// ============================================
// ✅ RECEIPT FILE SERVING (for admin view)
// ============================================
app.get('/api/receipts/:filename', (req, res) => {
  const filename = req.params.filename;
  if (!filename || /[^a-zA-Z0-9._-]/.test(filename)) {
    return res.status(400).json({ success: false, message: 'Invalid filename' });
  }
  const filePath = path.join(__dirname, '../uploads/receipts', filename);
  res.sendFile(filePath, (err) => {
    if (err) res.status(404).json({ success: false, message: 'Receipt not found' });
  });
});

// ============================================
// ✅ API ROUTES
// ============================================

app.use('/api/auth', authRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/events', eventRoutes); 
app.use('/api/galleries', galleryRoutes); 
app.use('/api/activities', activitiesRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/admin/users', adminUsersRoutes);
app.use('/api/admin', adminRoutes); 
app.use('/api/projects', projectRoutes);
app.use('/api/co-founders', coFoundersRoutes);

// ============================================
// ✅ 404 HANDLER
// ============================================

app.use('/api/*', (req, res) => {
  console.warn(`⚠️  Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: `API endpoint ${req.originalUrl} not found`,
    availableEndpoints: [
      'GET /api/health',
      'POST /api/test-register',
      'POST /api/test-email',
      'POST /api/test-donation',
      'POST /api/auth/register',
      'POST /api/auth/login',
      'POST /api/auth/forgot-password',
      'GET /api/auth/verify-email/:token',
      'PUT /api/auth/reset-password/:token',
      'GET /api/auth/me',
      'POST /api/donations',
      'POST /api/donations/:id/receipt',
      'GET /api/donations/:identifier',
      'GET /api/donations/stats/summary',
      // Event endpoints
      'GET /api/events',
      'GET /api/events/:id',
      'POST /api/events (protected)',
      'PUT /api/events/:id (protected)',
      'DELETE /api/events/:id (protected)',
      // Admin event endpoints
      'GET /api/events/admin/all (admin only)',
      'GET /api/events/admin/dashboard-stats (admin only)'
    ],
    suggestion: 'Check GET / for full API documentation'
  });
});

// Global error handler middleware
app.use(errorHandler);

// Handle 404 for non-API routes
app.use('*', (req, res) => {
  console.warn(`⚠️  Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: 'Route not found',
    suggestion: 'Check GET / for available endpoints'
  });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, async () => {
  console.log('='.repeat(60));
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
  console.log('📋 Available endpoints:');
  console.log(`   ✅ Health check: http://localhost:${PORT}/api/health`);
  console.log(`   ✅ Register: http://localhost:${PORT}/api/auth/register`);
  console.log(`   ✅ Login: http://localhost:${PORT}/api/auth/login`);
  console.log(`   ✅ Donations: http://localhost:${PORT}/api/donations`);
  console.log(`   ✅ Events: http://localhost:${PORT}/api/events`);
  console.log(`   ✅ Home: http://localhost:${PORT}/`);
  console.log('='.repeat(60));
  
  // Check upload directories
  try {
    const fs = await import('fs');
    const uploadDirs = [
      path.join(__dirname, '../uploads'),
      path.join(__dirname, '../uploads/donation-receipts'),
      path.join(__dirname, '../uploads/event-images'),
      path.join(__dirname, '../uploads/receipts'),
      path.join(__dirname, '../uploads/galleries'),
      path.join(__dirname, '../uploads/project-images')
    ];
    
    for (const dir of uploadDirs) {
      if (!fs.existsSync(dir)) {
        console.warn(`⚠️  Creating directory: ${dir}`);
        fs.mkdirSync(dir, { recursive: true });
      } else {
        console.log(`✅ Upload directory exists: ${dir}`);
      }
    }
  } catch (error) {
    console.warn('⚠️  Could not check upload directories:', error.message);
  }

  // Monthly payment reminder job - run daily
  const runPaymentReminderJob = async () => {
    try {
      const now = new Date();
      const in30Days = new Date(now);
      in30Days.setDate(in30Days.getDate() + 30);
      const minLastSent = new Date(now);
      minLastSent.setDate(minLastSent.getDate() - 28);

      const users = await User.find({
        'membership.status': 'active',
        'membership.endDate': { $gte: now, $lte: in30Days },
        isActive: true,
        $or: [
          { 'membership.lastPaymentReminderSent': { $exists: false } },
          { 'membership.lastPaymentReminderSent': null },
          { 'membership.lastPaymentReminderSent': { $lt: minLastSent } }
        ]
      }).select('name email membership payment');

      for (const user of users) {
        try {
          await sendMonthlyPaymentReminder(
            user.email,
            user.name,
            user.membership?.endDate,
            user.payment?.amount || 500,
            user.membership?.membershipId
          );
          user.membership.lastPaymentReminderSent = new Date();
          await user.save({ validateBeforeSave: false });
        } catch (e) {
          console.warn(`⚠️ Payment reminder failed for ${user.email}:`, e.message);
        }
      }
      if (users.length > 0) {
        console.log(`📧 Sent ${users.length} payment reminder(s)`);
      }
    } catch (err) {
      console.warn('⚠️ Payment reminder job error:', err.message);
    }
  };

  runPaymentReminderJob();
  setInterval(runPaymentReminderJob, 24 * 60 * 60 * 1000);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('='.repeat(60));
  console.error(`❌ Unhandled Promise Rejection:`);
  console.error(`   Message: ${err.message}`);
  console.error(`   Stack: ${err.stack}`);
  console.error('='.repeat(60));
  
  server.close(() => {
    console.log('💥 Server closed due to unhandled rejection');
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('='.repeat(60));
  console.error(`💥 Uncaught Exception:`);
  console.error(`   Message: ${err.message}`);
  console.error(`   Stack: ${err.stack}`);
  console.error('='.repeat(60));
  
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

export default app;