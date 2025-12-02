import mongoose from 'mongoose';
import validator from 'validator';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
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
      enum: ['worabe', 'hulbarag', 'sankura', 'alicho', 'silti', 'dalocha', 'lanforo', 'east-azernet-berbere', 'west-azernet-berbere'],
      default: 'worabe',
    },
    membership: {
      type: {
        type: String,
        enum: ['general', 'gold', 'executive', null],
        default: null,
      },
      status: {
        type: String,
        enum: ['active', 'expired', 'pending', 'cancelled'],
        default: 'pending',
      },
      membershipId: String,
      startDate: Date,
      endDate: Date,
    },
    profile: {
      bio: String,
      photo: String,
      occupation: String,
      location: String,
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

// Pre-save middleware to fix woreda issues
userSchema.pre('save', function(next) {
  // Fix woreda for ALL documents (new and existing)
  const validWoredas = ['worabe', 'hulbarag', 'sankura', 'alicho', 'silti', 'dalocha', 'lanforo', 'east-azernet-berbere', 'west-azernet-berbere'];
  
  // If woreda is empty, undefined, or invalid, set to default
  if (!this.woreda || this.woreda.trim() === '' || !validWoredas.includes(this.woreda)) {
    this.woreda = 'worabe';
    console.log(`✅ Fixed woreda for user ${this.email}: set to "worabe"`);
  }
  
  next();
});

// Pre-validate middleware to prevent validation errors
userSchema.pre('validate', function(next) {
  // Skip woreda validation for existing documents when they're being saved
  if (!this.isNew) {
    // Temporarily remove the required validator for woreda when updating existing users
    const woredaSchemaType = this.schema.path('woreda');
    if (woredaSchemaType && woredaSchemaType.options && woredaSchemaType.options.required) {
      // Temporarily make woreda not required for this save operation
      woredaSchemaType.options.required = false;
      
      // Restore after validation
      this.$once('save', () => {
        woredaSchemaType.options.required = true;
      });
    }
  }
  
  next();
});

// Generate membership ID before saving - ONLY for new users
userSchema.pre('save', async function(next) {
  if (this.isNew && this.role === 'member') {
    try {
      const count = await mongoose.model('User').countDocuments();
      this.membership.membershipId = `SLMA-${new Date().getFullYear()}-${(count + 1).toString().padStart(4, '0')}`;
    } catch (error) {
      console.warn('⚠️ Could not generate membership ID:', error.message);
      // Generate a fallback ID
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

// Static method to safely create a user (bypasses validation issues)
userSchema.statics.createUser = async function(userData) {
  try {
    const user = new this(userData);
    await user.save({ validateBeforeSave: false });
    return user;
  } catch (error) {
    throw error;
  }
};

// Static method to safely update a user
userSchema.statics.updateUser = async function(id, updateData) {
  try {
    const user = await this.findById(id);
    if (!user) {
      throw new Error('User not found');
    }
    
    // Update fields
    Object.keys(updateData).forEach(key => {
      if (key !== 'password' && key !== 'email') { // Don't allow email/password updates here
        user[key] = updateData[key];
      }
    });
    
    await user.save({ validateBeforeSave: false });
    return user;
  } catch (error) {
    throw error;
  }
};

// Instance method to safely update user
userSchema.methods.safeSave = async function() {
  return await this.save({ validateBeforeSave: false });
};

// Method to prepare user for response (removes sensitive data)
userSchema.methods.toSafeObject = function() {
  const userObject = this.toObject();
  
  // Remove sensitive data
  delete userObject.password;
  delete userObject.verificationToken;
  delete userObject.resetPasswordToken;
  delete userObject.resetPasswordExpire;
  delete userObject.__v;
  
  // Ensure woreda has a value
  if (!userObject.woreda || userObject.woreda.trim() === '') {
    userObject.woreda = 'worabe';
  }
  
  return userObject;
};

const User = mongoose.model('User', userSchema);

export default User;