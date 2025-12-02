import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import errorHandler from './middlewares/errorHandler.js';

// Import routes
import authRoutes from './routes/auth.js';

// Import email service
import { testEmailService } from './services/emailService.js';

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
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static folder
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check endpoint - for debugging
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: '✅ SLMA Backend is healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
    backendUrl: `http://localhost:${process.env.PORT || 5000}`,
    database: 'Connected',
    cors: {
      origin: corsOptions.origin,
      methods: corsOptions.methods,
    },
    emailService: process.env.SMTP_USER ? 'Configured' : 'Not configured',
    version: '1.0.0'
  });
});

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

    // Validate email format
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

// Test registration endpoint - for debugging
app.post('/api/test-register', (req, res) => {
  console.log('✅ Test registration endpoint hit:', req.body);
  res.json({
    success: true,
    message: 'Test endpoint working!',
    receivedData: req.body,
    timestamp: new Date().toISOString(),
  });
});

// Welcome route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🚀 SLMA Platform API is running...',
    version: '1.0.0',
    documentation: {
      health: 'GET /api/health',
      test: 'POST /api/test-register',
      email: 'POST /api/test-email',
      auth: 'POST /api/auth/register',
      endpoints: {
        auth: '/api/auth',
        members: '/api/members',
        events: '/api/events',
        projects: '/api/projects',
        admin: '/api/admin',
      }
    },
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);

// 404 handler for undefined API routes
app.use('/api/*', (req, res) => {
  console.warn(`⚠️  Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: `API endpoint ${req.originalUrl} not found`,
    availableEndpoints: [
      'GET /api/health',
      'POST /api/test-register',
      'POST /api/test-email',
      'POST /api/auth/register',
      'POST /api/auth/login',
      'POST /api/auth/forgot-password',
      'GET /api/auth/verify-email/:token',
      'PUT /api/auth/reset-password/:token',
      'GET /api/auth/me'
    ],
    suggestion: 'Check GET / for full API documentation'
  });
});

// Global error handler middleware (MUST be after all routes)
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

const server = app.listen(PORT, () => {
  console.log('='.repeat(60));
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
  console.log(`📧 Email Service: ${process.env.SMTP_USER ? 'Configured' : 'NOT CONFIGURED'}`);
  console.log('📋 Available endpoints:');
  console.log(`   ✅ Health check: http://localhost:${PORT}/api/health`);
  console.log(`   ✅ Test endpoint: http://localhost:${PORT}/api/test-register`);
  console.log(`   ✅ Test email: http://localhost:${PORT}/api/test-email`);
  console.log(`   ✅ Register: http://localhost:${PORT}/api/auth/register`);
  console.log(`   ✅ Login: http://localhost:${PORT}/api/auth/login`);
  console.log(`   ✅ Forgot password: http://localhost:${PORT}/api/auth/forgot-password`);
  console.log(`   ✅ Home: http://localhost:${PORT}/`);
  console.log('='.repeat(60));
  
  // Display important warnings
  if (!process.env.SMTP_USER) {
    console.warn('⚠️  WARNING: Email service is not configured!');
    console.warn('   Auth features (verification, password reset) will not work.');
    console.warn('   Set SMTP_USER, SMTP_PASS in .env file to enable email.');
  }
  
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.includes('super_secret_key')) {
    console.warn('⚠️  WARNING: Using default JWT secret!');
    console.warn('   Change JWT_SECRET in production for security.');
  }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('='.repeat(60));
  console.error(`❌ Unhandled Promise Rejection:`);
  console.error(`   Message: ${err.message}`);
  console.error(`   Stack: ${err.stack}`);
  console.error('='.repeat(60));
  
  // Close server & exit process
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