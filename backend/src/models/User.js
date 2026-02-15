import mongoose from 'mongoose';
import validator from 'validator';

const professionEnum = [
  'medicine', 'computer_science', 'software_engineer', 'biomedical_engineer',
  'civil', 'mechanical', 'pharmacist', 'laboratory', 'midwifery', 'nursing',
  'health_officer', 'other'
];

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    fatherName: {
      type: String,
      trim: true,
      maxlength: [100, 'Father name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
    },
    role: {
      type: String,
      enum: ['member', 'woreda_admin', 'super_admin'],
      default: 'member',
    },
    woreda: {
      type: String,
      required: [true, 'Woreda is required'],
      enum: [
        'worabe',
        'hulbarag',
        'sankura',
        'alicho',
        'silti',
        'dalocha',
        'lanforo',
        'east-azernet-berbere',
        'west-azernet-berbere',
        'worabe-city-administration',
        'alem-gebeya-city-administration',
        'qbet-city-administration',
        'tora-city-administration',
        'dalocha-city-administration',
        'silti-woreda',
        'misraq-silti-woreda',
        'lanfro-woreda',
        'mitto-woreda',
        'dalocha-woreda',
        'sankura-woreda',
        'wulbarag-woreda',
        'mirab-azernet-berbere-woreda',
        'misraq-azernet-berbere-woreda',
        'alicho-woriro-woreda'
      ],
      default: 'worabe',
    },
    // UPDATED: Added membershipPlan field
    membershipPlan: {
      type: String,
      enum: ['basic', 'active', 'premium'],
      default: 'active',
    },
    membership: {
      type: {
        type: String,
        enum: ['general', 'gold', 'executive', null],
        default: null,
      },
      status: {
        type: String,
        enum: ['active', 'expired', 'pending', 'cancelled', 'pending_payment', 'pending_verification'],
        default: 'pending_payment',
      },
      membershipId: String,
      startDate: Date,
      endDate: Date,
      lastPaymentReminderSent: Date,
    },
    // NEW: Payment fields
    payment: {
      amount: {
        type: Number,
        default: 0,
      },
      currency: {
        type: String,
        default: 'ETB',
      },
      method: {
        type: String,
        enum: ['cbe', 'telebirr', 'bank_transfer', 'cash', null],
        default: null,
      },
      receipt: {
        filename: String,
        originalName: String,
        path: String,
        mimetype: String,
        size: Number,
      },
      transactionId: String,
      status: {
        type: String,
        enum: ['pending', 'verified', 'rejected', 'refunded'],
        default: 'pending',
      },
      verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      verifiedAt: Date,
      notes: String,
    },
    profile: {
      bio: String,
      photo: String,
      occupation: String,
      location: String,
    },
    // National ID document (uploaded at registration)
    nationalId: {
      filename: String,
      originalName: String,
      path: String,
      mimetype: String,
      size: Number,
    },
    maritalStatus: {
      type: String,
      enum: ['single', 'married'],
    },
    gender: {
      type: String,
      enum: ['male', 'female'],
    },
    age: {
      type: Number,
      min: 1,
      max: 120,
    },
    userType: {
      type: String,
      enum: ['student', 'employee'],
    },
    currentResident: {
      type: String,
      trim: true,
      maxlength: [200, 'Current resident cannot exceed 200 characters'],
    },
    profession: {
      type: String,
      enum: professionEnum,
    },
    language: {
      type: String,
      enum: ['en', 'am', 'silt'],
      default: 'en',
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: String,
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    lastLogin: Date,
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    // Disable validation on update
    validateBeforeSave: false,
  }
);

// Pre-save middleware to fix woreda and set payment info
userSchema.pre('save', function(next) {
  const validWoredas = [
    'worabe',
    'hulbarag',
    'sankura',
    'alicho',
    'silti',
    'dalocha',
    'lanforo',
    'east-azernet-berbere',
    'west-azernet-berbere',
    'worabe-city-administration',
    'alem-gebeya-city-administration',
    'qbet-city-administration',
    'tora-city-administration',
    'dalocha-city-administration',
    'silti-woreda',
    'misraq-silti-woreda',
    'lanfro-woreda',
    'mitto-woreda',
    'dalocha-woreda',
    'sankura-woreda',
    'wulbarag-woreda',
    'mirab-azernet-berbere-woreda',
    'misraq-azernet-berbere-woreda',
    'alicho-woriro-woreda'
  ];
  
  // Fix woreda if empty or invalid
  if (!this.woreda || this.woreda.trim() === '' || !validWoredas.includes(this.woreda)) {
    this.woreda = 'worabe';
  }
  
  // Set payment amount based on membership plan for new users
  if (this.isNew) {
    if (this.membershipPlan === 'basic') {
      this.payment.amount = 0;
      this.membership.status = 'active';
      this.payment.status = 'verified';
    } else if (this.membershipPlan === 'active') {
      this.payment.amount = 500;
      this.membership.status = 'pending_payment';
      this.payment.status = 'pending';
    } else if (this.membershipPlan === 'premium') {
      this.payment.amount = 1200;
      this.membership.status = 'pending_payment';
      this.payment.status = 'pending';
    }
  }
  
  next();
});

// Generate membership ID before saving
userSchema.pre('save', async function(next) {
  if (this.isNew && this.role === 'member') {
    try {
      const count = await mongoose.model('User').countDocuments();
      this.membership.membershipId = `SLMA-${new Date().getFullYear()}-${(count + 1).toString().padStart(4, '0')}`;
    } catch (error) {
      this.membership.membershipId = `SLMA-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
    }
  }
  next();
});

// Create indexes
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ woreda: 1 });
userSchema.index({ role: 1 });
userSchema.index({ 'membership.status': 1 });
userSchema.index({ emailVerified: 1 });
userSchema.index({ 'payment.status': 1 });

const User = mongoose.model('User', userSchema);

export default User;