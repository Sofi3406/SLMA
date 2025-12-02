import asyncHandler from '../utils/asyncHandler.js';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import crypto from 'crypto';
import { 
  sendVerificationEmail, 
  sendPasswordResetEmail,
  sendWelcomeEmail 
} from '../services/emailService.js';
import bcrypt from 'bcryptjs';

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = asyncHandler(async (req, res, next) => {
  try {
    const { name, email, password, phone, woreda, language } = req.body;

    console.log('📝 Registration attempt received:', { 
      name: name ? `${name.substring(0, 10)}...` : 'missing', 
      email: email ? `${email.substring(0, 10)}...` : 'missing', 
      phone: phone ? `${phone.substring(0, 6)}...` : 'missing',
      woreda: woreda || 'missing'
    });

    // Check if all required fields are provided
    if (!name || !email || !password || !phone || !woreda) {
      const missingFields = [];
      if (!name) missingFields.push('name');
      if (!email) missingFields.push('email');
      if (!password) missingFields.push('password');
      if (!phone) missingFields.push('phone');
      if (!woreda) missingFields.push('woreda');
      
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`,
        errors: {
          name: !name ? 'Name is required' : undefined,
          email: !email ? 'Email is required' : undefined,
          password: !password ? 'Password is required' : undefined,
          phone: !phone ? 'Phone is required' : undefined,
          woreda: !woreda ? 'Woreda is required' : undefined,
        }
      });
    }

    // Validate email format
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format',
        errors: { email: 'Please enter a valid email address' }
      });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(409).json({
        success: false,
        message: 'User already exists',
        errors: { email: 'Email already registered' }
      });
    }

    // Validate password length
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters',
        errors: { password: 'Password must be at least 8 characters' }
      });
    }

    // Create verification token
    const verificationToken = crypto.randomBytes(20).toString('hex');

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user - Use save() instead of create() to bypass validation
    const user = new User({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone,
      woreda,
      language: language || 'en',
      verificationToken,
    });

    // Save without validation for new user
    await user.save({ validateBeforeSave: false });

    console.log('✅ User created successfully with ID:', user._id);

    // Generate token
    const token = generateToken(user._id, user.role);

    // Send verification email (if email service is set up)
    try {
      if (sendVerificationEmail) {
        await sendVerificationEmail(user.email, user.name, verificationToken);
        console.log('📧 Verification email sent to:', user.email);
      }
    } catch (emailError) {
      console.warn('⚠️ Failed to send verification email:', emailError.message);
      // Don't fail registration if email service fails
    }

    // Remove sensitive data from response
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      woreda: user.woreda,
      role: user.role,
      membership: user.membership,
      language: user.language,
      emailVerified: user.emailVerified,
    };

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please check your email for verification.',
      token,
      user: userResponse,
    });

  } catch (error) {
    console.error('🔥 Registration controller error:', error);
    
    // Handle specific errors
    if (error.code === 11000) {
      // MongoDB duplicate key error
      return res.status(409).json({
        success: false,
        message: 'Email already exists',
        errors: { email: 'Email already registered' }
      });
    }
    
    if (error.name === 'ValidationError') {
      // Mongoose validation error
      const errors = {};
      Object.keys(error.errors).forEach(key => {
        errors[key] = error.errors[key].message;
      });
      
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }
    
    // Pass to global error handler if not caught above
    next(error);
  }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
        errors: {
          email: !email ? 'Email is required' : undefined,
          password: !password ? 'Password is required' : undefined,
        }
      });
    }

    // Check for user - skip validation by using session(null)
    const user = await User.findOne({ email: email.toLowerCase() })
      .select('+password')
      .session(null);  // This skips validation for existing users

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated. Please contact support.',
      });
    }

    // Check password
    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Update last login - skip validation for existing users
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    // Generate token
    const token = generateToken(user._id, user.role);

    // Prepare user response (don't use toObject() which triggers validation)
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      woreda: user.woreda || 'worabe', // Ensure woreda has value
      role: user.role,
      membership: user.membership,
      language: user.language,
      emailVerified: user.emailVerified,
      isActive: user.isActive,
    };

    res.json({
      success: true,
      token,
      user: userResponse,
    });

  } catch (error) {
    console.error('🔥 Login controller error:', error);
    next(error);
  }
});

// @desc    Verify email
// @route   GET /api/auth/verify-email/:token
// @access  Public
export const verifyEmail = asyncHandler(async (req, res, next) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({ verificationToken: token }).session(null);

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token',
      });
    }

    user.emailVerified = true;
    user.verificationToken = undefined;
    
    // Save without validation for existing users
    await user.save({ validateBeforeSave: false });

    // Send welcome email
    try {
      if (sendWelcomeEmail && user.membership?.membershipId) {
        await sendWelcomeEmail(user.email, user.name, user.membership.membershipId);
      }
    } catch (emailError) {
      console.warn('⚠️ Failed to send welcome email:', emailError.message);
    }

    res.json({
      success: true,
      message: 'Email verified successfully',
    });

  } catch (error) {
    console.error('🔥 Verify email controller error:', error);
    next(error);
  }
});

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = asyncHandler(async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email address',
      });
    }

    // Find user without triggering validation
    const user = await User.findOne({ email: email.toLowerCase() }).session(null);

    if (!user) {
      // Don't reveal that user doesn't exist for security
      return res.json({
        success: true,
        message: 'If an account exists with this email, a password reset link has been sent.',
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex');
    
    // Hash token and set to resetPasswordToken field
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    
    // Set expire (1 hour)
    user.resetPasswordExpire = Date.now() + 3600000;

    // Save WITHOUT validation
    await user.save({ validateBeforeSave: false });

    // Send email
    try {
      if (sendPasswordResetEmail) {
        await sendPasswordResetEmail(user.email, user.name, resetToken);
        console.log(`✅ Password reset email sent to ${user.email}`);
      }
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
      // Don't fail the request if email fails
    }

    res.json({
      success: true,
      message: 'If an account exists with this email, a password reset link has been sent.',
    });

  } catch (error) {
    console.error('🔥 Forgot password controller error:', error);
    next(error);
  }
});

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:token
// @access  Public
export const resetPassword = asyncHandler(async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters',
      });
    }

    // Hash token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Find user without validation
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    }).session(null);

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token',
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Set new password and clear reset fields
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    // Save without validation
    await user.save({ validateBeforeSave: false });

    res.json({
      success: true,
      message: 'Password reset successful. You can now login with your new password.',
    });

  } catch (error) {
    console.error('🔥 Reset password controller error:', error);
    next(error);
  }
});

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = asyncHandler(async (req, res, next) => {
  try {
    // Find user without validation
    const user = await User.findById(req.user.id).session(null);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        woreda: user.woreda || 'worabe',
        role: user.role,
        membership: user.membership,
        language: user.language,
        emailVerified: user.emailVerified,
        isActive: user.isActive,
        profile: user.profile,
      },
    });

  } catch (error) {
    console.error('🔥 Get me controller error:', error);
    next(error);
  }
});

// @desc    Update user profile
// @route   PUT /api/auth/update-profile
// @access  Private
export const updateProfile = asyncHandler(async (req, res, next) => {
  try {
    const { name, phone, language, profile, woreda } = req.body;

    // Find user without validation
    const user = await User.findById(req.user.id).session(null);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Update fields
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (language) user.language = language;
    if (profile) user.profile = { ...user.profile, ...profile };
    if (woreda) user.woreda = woreda;

    // Save without validation
    const updatedUser = await user.save({ validateBeforeSave: false });

    // Prepare response without triggering validation
    const userResponse = {
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      woreda: updatedUser.woreda || 'worabe',
      role: updatedUser.role,
      membership: updatedUser.membership,
      language: updatedUser.language,
      emailVerified: updatedUser.emailVerified,
      isActive: updatedUser.isActive,
      profile: updatedUser.profile,
    };

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: userResponse,
    });

  } catch (error) {
    console.error('🔥 Update profile controller error:', error);
    
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Duplicate field value',
      });
    }
    
    next(error);
  }
});

// @desc    Resend verification email
// @route   POST /api/auth/resend-verification
// @access  Public
export const resendVerification = asyncHandler(async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email address',
      });
    }

    // Find user without validation
    const user = await User.findOne({ email: email.toLowerCase() }).session(null);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (user.emailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email already verified',
      });
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(20).toString('hex');
    user.verificationToken = verificationToken;
    
    // Save without validation
    await user.save({ validateBeforeSave: false });

    // Send verification email
    try {
      if (sendVerificationEmail) {
        await sendVerificationEmail(user.email, user.name, verificationToken);
      }
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
    }

    res.json({
      success: true,
      message: 'Verification email sent',
    });

  } catch (error) {
    console.error('🔥 Resend verification controller error:', error);
    next(error);
  }
});