import asyncHandler from '../utils/asyncHandler.js';
import User from '../models/User.js';
import Activity from '../models/Activity.js';
import generateToken from '../utils/generateToken.js';
import crypto from 'crypto';
import { 
  sendVerificationEmail, 
  sendPasswordResetEmail,
  sendWelcomeEmail,
  sendPaymentVerificationEmail 
} from '../services/emailService.js';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// ES module fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for registration uploads (national ID, profile image, receipt)
const registrationStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const basePath = path.join(__dirname, '../../uploads');
    const subdir = file.fieldname === 'receipt' ? 'receipts' : 'registration';
    const uploadPath = path.join(basePath, subdir);
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const prefix = file.fieldname === 'receipt' ? '' : file.fieldname + '-';
    cb(null, prefix + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only images and PDF files are allowed'), false);
  }
};

const uploadRegistration = multer({
  storage: registrationStorage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB per file
}).fields([
  { name: 'nationalId', maxCount: 1 },
  { name: 'profileImage', maxCount: 1 },
  { name: 'receipt', maxCount: 1 }
]);

// Configure multer for profile image update
const profileUpdateStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const basePath = path.join(__dirname, '../../uploads');
    const subdir = 'profile-photos';
    const uploadPath = path.join(basePath, subdir);
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const uploadProfileImage = multer({
  storage: profileUpdateStorage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
}).single('profileImage');

// Helper to clean up uploaded files
function cleanupUploadedFiles(req) {
  const files = req.files ? (Array.isArray(req.files) ? req.files : Object.values(req.files).flat()) : [];
  if (req.file) files.push(req.file);
  files.forEach(f => { if (f && f.path && fs.existsSync(f.path)) fs.unlinkSync(f.path); });
}

// @desc    Register user with national ID, profile image, and optional payment receipt
// @route   POST /api/auth/register
// @access  Public
export const register = asyncHandler(async (req, res, next) => {
  try {
    uploadRegistration(req, res, async function(err) {
      if (err instanceof multer.MulterError) {
        cleanupUploadedFiles(req);
        return res.status(400).json({ success: false, message: 'File upload error', error: err.message });
      }
      if (err) {
        cleanupUploadedFiles(req);
        return res.status(400).json({ success: false, message: err.message });
      }

      try {
        let userData;
        try {
          userData = JSON.parse(req.body.userData || '{}');
        } catch (parseError) {
          cleanupUploadedFiles(req);
          return res.status(400).json({ success: false, message: 'Invalid user data format' });
        }

        const {
          name, fatherName, email, password, phone, woreda, membershipPlan, language,
          maritalStatus, gender, age, userType, currentResident, profession
        } = userData;

        const nationalIdFile = req.files?.nationalId?.[0];
        const profileImageFile = req.files?.profileImage?.[0];
        const receiptFile = req.files?.receipt?.[0];

        // Validate required fields
        const missing = [];
        if (!name) missing.push('name');
        if (!fatherName) missing.push('fatherName');
        if (!email) missing.push('email');
        if (!password) missing.push('password');
        if (!phone) missing.push('phone');
        if (!woreda) missing.push('woreda');
        if (!membershipPlan) missing.push('membershipPlan');
        if (!maritalStatus) missing.push('maritalStatus');
        if (!gender) missing.push('gender');
        if (!age) missing.push('age');
        if (!userType) missing.push('userType');
        if (!profession) missing.push('profession');
        if (!nationalIdFile) missing.push('nationalId (upload required)');
        if (!profileImageFile) missing.push('profileImage (upload required)');

        if (missing.length) {
          cleanupUploadedFiles(req);
          return res.status(400).json({
            success: false,
            message: `Missing required: ${missing.join(', ')}`,
            errors: {
              name: !name ? 'Name is required' : undefined,
              fatherName: !fatherName ? 'Father name is required' : undefined,
              email: !email ? 'Email is required' : undefined,
              password: !password ? 'Password is required' : undefined,
              phone: !phone ? 'Phone is required' : undefined,
              woreda: !woreda ? 'Woreda is required' : undefined,
              membershipPlan: !membershipPlan ? 'Membership plan is required' : undefined,
              maritalStatus: !maritalStatus ? 'Marital status is required' : undefined,
              gender: !gender ? 'Gender is required' : undefined,
              age: !age ? 'Age is required' : undefined,
              userType: !userType ? 'Student or Employee is required' : undefined,
              profession: !profession ? 'Profession is required' : undefined,
              nationalId: !nationalIdFile ? 'National ID document is required' : undefined,
              profileImage: !profileImageFile ? 'Profile image is required' : undefined,
            }
          });
        }

        const emailRegex = /\S+@\S+\.\S+/;
        if (!emailRegex.test(email)) {
          cleanupUploadedFiles(req);
          return res.status(400).json({ success: false, message: 'Invalid email format', errors: { email: 'Please enter a valid email address' } });
        }

        const userExists = await User.findOne({ email: email.toLowerCase() }).session(null);
        if (userExists) {
          cleanupUploadedFiles(req);
          return res.status(409).json({ success: false, message: 'User already exists', errors: { email: 'Email already registered' } });
        }

        if (password.length < 8) {
          cleanupUploadedFiles(req);
          return res.status(400).json({ success: false, message: 'Password must be at least 8 characters', errors: { password: 'Password must be at least 8 characters' } });
        }

        const validPlans = ['basic', 'active', 'premium'];
        if (!validPlans.includes(membershipPlan)) {
          cleanupUploadedFiles(req);
          return res.status(400).json({ success: false, message: 'Invalid membership plan', errors: { membershipPlan: 'Please select a valid membership plan' } });
        }

        const validMarital = ['single', 'married'];
        if (!validMarital.includes(maritalStatus)) {
          cleanupUploadedFiles(req);
          return res.status(400).json({ success: false, message: 'Invalid marital status', errors: { maritalStatus: 'Select single or married' } });
        }

        const validGender = ['male', 'female'];
        if (!validGender.includes(gender)) {
          cleanupUploadedFiles(req);
          return res.status(400).json({ success: false, message: 'Invalid gender', errors: { gender: 'Select male or female' } });
        }

        const ageNumber = Number(age);
        if (!Number.isFinite(ageNumber) || ageNumber < 18 || ageNumber > 120) {
          cleanupUploadedFiles(req);
          return res.status(400).json({ success: false, message: 'Invalid age', errors: { age: 'Age must be between 18 and 120' } });
        }

        const validUserType = ['student', 'employee'];
        if (!validUserType.includes(userType)) {
          cleanupUploadedFiles(req);
          return res.status(400).json({ success: false, message: 'Invalid user type', errors: { userType: 'Select student or employee' } });
        }
        const validProfessions = ['medicine', 'computer_science', 'software_engineer', 'biomedical_engineer', 'civil', 'mechanical', 'pharmacist', 'laboratory', 'midwifery', 'nursing', 'health_officer', 'other'];
        if (!validProfessions.includes(profession)) {
          cleanupUploadedFiles(req);
          return res.status(400).json({ success: false, message: 'Invalid profession', errors: { profession: 'Please select a valid profession' } });
        }

        if ((membershipPlan === 'active' || membershipPlan === 'premium') && !receiptFile) {
          cleanupUploadedFiles(req);
          return res.status(400).json({ success: false, message: 'Payment receipt is required for paid membership', errors: { receipt: 'Please upload your payment receipt' } });
        }

        const verificationToken = crypto.randomBytes(20).toString('hex');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const userDataToSave = {
          name,
          fatherName: fatherName || undefined,
          email: email.toLowerCase(),
          password: hashedPassword,
          phone,
          woreda,
          membershipPlan,
          language: language || 'en',
          maritalStatus,
          gender,
          age: ageNumber,
          userType,
          currentResident: currentResident || undefined,
          profession,
          verificationToken,
          nationalId: {
            filename: nationalIdFile.filename,
            originalName: nationalIdFile.originalname,
            path: nationalIdFile.path,
            mimetype: nationalIdFile.mimetype,
            size: nationalIdFile.size,
          },
          profile: {
            photo: 'registration/' + profileImageFile.filename,
          },
        };

        if (receiptFile) {
          userDataToSave.payment = {
            receipt: {
              filename: receiptFile.filename,
              originalName: receiptFile.originalname,
              path: receiptFile.path,
              mimetype: receiptFile.mimetype,
              size: receiptFile.size,
            },
            method: 'cbe',
            status: 'pending',
          };
        }

        const user = new User(userDataToSave);
        await user.save({ validateBeforeSave: false });

        console.log('✅ User created successfully with ID:', user._id);

        const token = generateToken(user._id, user.role);

        // Optional: notify user that admin will verify (no self-verify link)
        try {
          if (sendVerificationEmail) {
            await sendVerificationEmail(user.email, user.name, verificationToken);
          }
        } catch (emailError) {
          console.warn('⚠️ Failed to send verification email:', emailError.message);
        }
        if ((membershipPlan === 'active' || membershipPlan === 'premium') && sendPaymentVerificationEmail) {
          try {
            await sendPaymentVerificationEmail(user.email, user.name, membershipPlan, user.membership.membershipId);
          } catch (emailError) {
            console.warn('⚠️ Failed to send payment verification email:', emailError.message);
          }
        }

        try {
          await Activity.create({
            user: user._id,
            type: 'registration',
            description: `User registered with plan ${membershipPlan}`,
            metadata: { membershipPlan }
          });
        } catch (actErr) {
          console.warn('Failed to create registration activity:', actErr.message);
        }

        const userResponse = {
          id: user._id,
          name: user.name,
          fatherName: user.fatherName,
          email: user.email,
          phone: user.phone,
          woreda: user.woreda,
          membershipPlan: user.membershipPlan,
          membership: user.membership,
          role: user.role,
          language: user.language,
          emailVerified: user.emailVerified,
          maritalStatus: user.maritalStatus,
          userType: user.userType,
          currentResident: user.currentResident,
          profession: user.profession,
        };

        res.status(201).json({
          success: true,
          message: 'Registration successful! Your account will be active after an admin verifies your email. You will not be able to use the system until then.',
          token,
          user: userResponse,
        });

      } catch (error) {
        cleanupUploadedFiles(req);
        console.error('🔥 Registration controller error:', error);
        if (error.code === 11000) {
          return res.status(409).json({ success: false, message: 'Email already exists', errors: { email: 'Email already registered' } });
        }
        if (error.name === 'ValidationError') {
          const errors = {};
          Object.keys(error.errors).forEach(key => { errors[key] = error.errors[key].message; });
          return res.status(400).json({ success: false, message: 'Validation failed', errors });
        }
        next(error);
      }
    });
  } catch (error) {
    console.error('🔥 Registration outer error:', error);
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

    // Check for user
    const user = await User.findOne({ email: email.toLowerCase() })
      .select('+password')
      .session(null);

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

    // Block access until admin has verified email
    if (!user.emailVerified) {
      return res.status(403).json({
        success: false,
        message: 'Your email has not been verified yet. Please wait for admin verification before you can use the system.',
        code: 'EMAIL_NOT_VERIFIED',
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

    // Update last login
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    // Generate token
    const token = generateToken(user._id, user.role);
    // Prepare user response
    const userResponse = {
      id: user._id,
      name: user.name,
      fatherName: user.fatherName,
      email: user.email,
      phone: user.phone,
      woreda: user.woreda || 'worabe',
      membershipPlan: user.membershipPlan,
      membership: user.membership,
      role: user.role,
      language: user.language,
      emailVerified: user.emailVerified,
      isActive: user.isActive,
      maritalStatus: user.maritalStatus,
      gender: user.gender,
      age: user.age,
      userType: user.userType,
      currentResident: user.currentResident,
      profession: user.profession,
      profile: user.profile,
      nationalId: user.nationalId,
      payment: {
        status: user.payment?.status || 'none',
        receipt: user.payment?.receipt,
      }
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
    
    // Update membership status if payment is verified
    if (user.payment?.status === 'verified') {
      user.membership.status = 'active';
    }
    
    await user.save({ validateBeforeSave: false });

    // Send welcome email
    try {
      if (sendWelcomeEmail && user.membership?.membershipId) {
        await sendWelcomeEmail(user.email, user.name, user.membership.membershipId);
      }
    } catch (emailError) {
      console.warn('⚠️ Failed to send welcome email:', emailError.message);
    }

    // Create activity for email verification
    try {
      await Activity.create({
        user: user._id,
        type: 'email_verification',
        description: 'Email verified successfully',
        metadata: { method: 'link' }
      });
    } catch (actErr) {
      console.warn('Failed to create email verification activity:', actErr.message);
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

    const user = await User.findOne({ email: email.toLowerCase() }).session(null);

    if (!user) {
      return res.json({
        success: true,
        message: 'If an account exists with this email, a password reset link has been sent.',
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex');
    
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    
    user.resetPasswordExpire = Date.now() + 3600000;

    await user.save({ validateBeforeSave: false });

    // Send email
    try {
      if (sendPasswordResetEmail) {
        await sendPasswordResetEmail(user.email, user.name, resetToken);
        console.log(`✅ Password reset email sent to ${user.email}`);
      }
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
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

    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

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

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

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
        fatherName: user.fatherName,
        email: user.email,
        phone: user.phone,
        woreda: user.woreda || 'worabe',
        membershipPlan: user.membershipPlan,
        membership: user.membership,
        role: user.role,
        language: user.language,
        emailVerified: user.emailVerified,
        isActive: user.isActive,
        profile: user.profile,
        maritalStatus: user.maritalStatus,
        gender: user.gender,
        age: user.age,
        userType: user.userType,
        currentResident: user.currentResident,
        profession: user.profession,
        nationalId: user.nationalId,
        payment: {
          status: user.payment?.status || 'none',
          receipt: user.payment?.receipt,
        }
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
    uploadProfileImage(req, res, async function(err) {
      if (err instanceof multer.MulterError) {
        cleanupUploadedFiles(req);
        return res.status(400).json({ success: false, message: 'File upload error', error: err.message });
      }
      if (err) {
        cleanupUploadedFiles(req);
        return res.status(400).json({ success: false, message: err.message });
      }

      try {
        const { name, fatherName, phone, language, woreda, maritalStatus, gender, age, userType, profession, currentResident } = req.body;
        let profile = req.body.profile;
        if (typeof profile === 'string') {
          try {
            profile = JSON.parse(profile);
          } catch (parseError) {
            cleanupUploadedFiles(req);
            return res.status(400).json({ success: false, message: 'Invalid profile data format' });
          }
        }

        const user = await User.findById(req.user.id).session(null);

        if (!user) {
          cleanupUploadedFiles(req);
          return res.status(404).json({
            success: false,
            message: 'User not found',
          });
        }

        const validWoredas = ['worabe', 'hulbarag', 'sankura', 'alicho', 'silti', 'dalocha', 'lanforo', 'east-azernet-berbere', 'west-azernet-berbere'];
        const toVal = (v) => (v === '' || v === null ? undefined : v);

        if (name !== undefined && String(name).trim()) user.name = String(name).trim();
        if (fatherName !== undefined) {
          const val = toVal(fatherName);
          user.fatherName = val !== undefined ? String(val).trim() : undefined;
        }
        if (phone !== undefined && String(phone).trim()) user.phone = String(phone).trim();
        if (language !== undefined) user.language = ['en', 'am', 'silt'].includes(language) ? language : user.language;
        if (woreda !== undefined) {
          const val = toVal(woreda);
          if (val !== undefined && validWoredas.includes(val)) user.woreda = val;
        }
        if (maritalStatus !== undefined) {
          const val = toVal(maritalStatus);
          if (val === undefined) user.maritalStatus = undefined;
          else if (['single', 'married'].includes(val)) user.maritalStatus = val;
          else {
            cleanupUploadedFiles(req);
            return res.status(400).json({ success: false, message: 'Invalid marital status' });
          }
        }
        if (gender !== undefined) {
          const val = toVal(gender);
          if (val === undefined) user.gender = undefined;
          else if (['male', 'female'].includes(val)) user.gender = val;
          else {
            cleanupUploadedFiles(req);
            return res.status(400).json({ success: false, message: 'Invalid gender' });
          }
        }
        if (age !== undefined) {
          const val = toVal(age);
          if (val === undefined) {
            user.age = undefined;
          } else {
            const ageNumber = Number(val);
            if (!Number.isFinite(ageNumber) || ageNumber < 18 || ageNumber > 120) {
              cleanupUploadedFiles(req);
              return res.status(400).json({ success: false, message: 'Invalid age' });
            }
            user.age = ageNumber;
          }
        }
        if (userType !== undefined) {
          const val = toVal(userType);
          if (val === undefined) user.userType = undefined;
          else if (['student', 'employee'].includes(val)) user.userType = val;
          else {
            cleanupUploadedFiles(req);
            return res.status(400).json({ success: false, message: 'Invalid user type' });
          }
        }
        if (profession !== undefined) user.profession = String(profession || '').trim() || user.profession;
        if (currentResident !== undefined) user.currentResident = String(currentResident || '').trim() || user.currentResident;
        if (profile && typeof profile === 'object') user.profile = { ...user.profile, ...profile };

        if (req.file) {
          user.profile = { ...user.profile, photo: `profile-photos/${req.file.filename}` };
        }

        await user.save({ validateBeforeSave: false });

        const userResponse = {
          id: user._id,
          name: user.name,
          fatherName: user.fatherName,
          email: user.email,
          phone: user.phone,
          woreda: user.woreda || 'worabe',
          membershipPlan: user.membershipPlan,
          membership: user.membership,
          role: user.role,
          language: user.language,
          emailVerified: user.emailVerified,
          isActive: user.isActive,
          profile: user.profile,
          maritalStatus: user.maritalStatus,
          gender: user.gender,
          age: user.age,
          userType: user.userType,
          profession: user.profession,
          currentResident: user.currentResident,
        };

        // Create activity for profile update
        try {
          const updatedFields = Object.keys(req.body || {});
          if (req.file) updatedFields.push('profileImage');
          await Activity.create({
            user: user._id,
            type: 'profile_update',
            description: 'User updated profile information',
            metadata: {
              updatedFields
            }
          });
        } catch (actErr) {
          console.warn('Failed to create profile update activity:', actErr.message);
        }
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
  } catch (error) {
    console.error('🔥 Update profile controller error:', error);
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

    const verificationToken = crypto.randomBytes(20).toString('hex');
    user.verificationToken = verificationToken;
    
    await user.save({ validateBeforeSave: false });

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