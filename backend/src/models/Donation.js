import mongoose from 'mongoose';
import validator from 'validator';

const donationSchema = new mongoose.Schema(
  {
    // Donor Information (could be registered user or guest)
    donor: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
      },
      fullName: {
        type: String,
        required: [true, 'Full name is required'],
        trim: true,
        maxlength: [100, 'Name cannot exceed 100 characters']
      },
      email: {
        type: String,
        required: [true, 'Email is required'],
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a valid email']
      },
      phone: {
        type: String,
        required: [true, 'Phone number is required']
      },
      isAnonymous: {
        type: Boolean,
        default: false
      }
    },
    
    // Donation Details
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [1, 'Amount must be at least 1 ETB']
    },
    currency: {
      type: String,
      default: 'ETB',
      enum: ['ETB', 'USD']
    },
    donationType: {
      type: String,
      enum: ['one-time', 'monthly'],
      default: 'one-time'
    },
    project: {
      type: String,
      enum: [
        'Silte Language Archive',
        'Youth Leadership Program', 
        'Cultural Festival 2025',
        'Community Development',
        'Education Support',
        'General Fund'
      ],
      default: 'General Fund'
    },
    comment: {
      type: String,
      maxlength: [500, 'Comment cannot exceed 500 characters']
    },
    
    // Payment Details
    paymentMethod: {
      type: String,
      required: [true, 'Payment method is required'],
      enum: ['cbe', 'telebirr', 'bank-transfer', 'card']
    },
    
    // Payment Instructions
    paymentInstructions: {
      cbeAccount: {
        type: String,
        default: '1000212203746'
      },
      cbeAccountName: {
        type: String,
        default: 'SOFIYA YASIN'
      },
      telebirrPhone: {
        type: String,
        default: '+251930670088'
      },
      bankName: {
        type: String,
        default: 'Commercial Bank of Ethiopia'
      }
    },
    
    // Payment Status
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'verified', 'rejected', 'failed', 'refunded'],
      default: 'pending'
    },
    transactionId: {
      type: String,
      unique: true,
      sparse: true
    },
    referenceNumber: String, // Bank/TeleBirr reference
    paidAt: Date,
    
    // Receipt Upload
    receipt: {
      uploaded: {
        type: Boolean,
        default: false
      },
      filename: String,
      originalName: String,
      path: String,
      mimetype: String,
      size: Number,
      uploadedAt: Date
    },
    
    // Verification
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    verifiedAt: Date,
    verificationNotes: String,
    
    // Metadata
    ipAddress: String,
    userAgent: String,
    country: String,
    source: {
      type: String,
      enum: ['website', 'mobile', 'admin'],
      default: 'website'
    },
    
    // Woreda Information
    woreda: {
      type: String,
      enum: [
        'worabe', 'hulbarag', 'sankura', 'alicho', 
        'silti', 'dalocha', 'lanforo', 
        'east-azernet-berbere', 'west-azernet-berbere'
      ]
    }
  },
  {
    timestamps: true
  }
);

// Generate transaction ID before saving
donationSchema.pre('save', function(next) {
  if (!this.transactionId) {
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.random().toString(36).substr(2, 6).toUpperCase();
    this.transactionId = `DON-${timestamp}-${random}`;
  }
  
  // If user is registered, fetch woreda from user
  if (this.donor.userId && !this.woreda) {
    mongoose.model('User').findById(this.donor.userId)
      .then(user => {
        if (user && user.woreda) {
          this.woreda = user.woreda;
        }
        next();
      })
      .catch(() => next());
  } else {
    next();
  }
});

// Indexes for performance
donationSchema.index({ transactionId: 1 }, { unique: true, sparse: true });
donationSchema.index({ 'donor.email': 1 });
donationSchema.index({ paymentStatus: 1 });
donationSchema.index({ createdAt: -1 });
donationSchema.index({ woreda: 1 });
donationSchema.index({ project: 1 });

const Donation = mongoose.model('Donation', donationSchema);

export default Donation;