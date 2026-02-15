import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  // Updated: Added short description for cards
  shortDescription: {
    type: String,
    maxlength: 150,
  },
  date: {
    type: Date,
    required: true,
  },
  // Updated: Added endDate for multi-day events
  endDate: {
    type: Date,
  },
  location: {
    type: String,
    required: true,
  },
  // Updated: Added detailed address
  address: {
    type: String,
  },
  type: {
    type: String,
    enum: ['cultural', 'networking', 'educational', 'social', 'religious'],
    default: 'cultural',
  },
  // NEW: Added category for better filtering
  category: {
    type: String,
    enum: ['cultural', 'educational', 'community', 'sports', 'youth', 'religious'],
    default: 'cultural',
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  attendees: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  maxAttendees: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'upcoming',
  },
  image: {
    type: String,
    default: '',
  },
  // NEW: Cloudinary image support for better management
  imagePublicId: {
    type: String,
  },
  registrationDeadline: Date,
  
  // NEW: Silte/Islamic specific fields
  isIslamicEvent: {
    type: Boolean,
    default: false,
  },
  prayerTiming: {
    type: String,
  },
  suitableFor: {
    type: [String],
    enum: ['men', 'women', 'children', 'families', 'youth', 'elders'],
    default: ['families'],
  },
  // NEW: Time string for display (e.g., "2:00 PM - 5:00 PM")
  time: {
    type: String,
  },
  // NEW: Event visibility and management
  isActive: {
    type: Boolean,
    default: true,
  },
  // NEW: Registration details
  registrationRequired: {
    type: Boolean,
    default: false,
  },
  registrationUrl: {
    type: String,
  },
  // NEW: Virtual event support
  isVirtual: {
    type: Boolean,
    default: false,
  },
  googleMeetingLink: {
    type: String,
    validate: {
      validator: function(v) {
        if (!v) return true; // Optional field
        return /^https?:\/\/(meet\.google\.com|.*\.zoom\.us|.*\.teams\.microsoft\.com)/i.test(v);
      },
      message: 'Please provide a valid Google Meet, Zoom, or Teams link'
    }
  },
  // NEW: Admin notes
  adminNotes: {
    type: String,
  },
  
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update updatedAt on save
eventSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Set short description if not provided
  if (!this.shortDescription && this.description) {
    this.shortDescription = this.description.length > 150 
      ? this.description.substring(0, 147) + '...' 
      : this.description;
  }
  
  next();
});

// Virtual field for attendees count
eventSchema.virtual('attendeesCount').get(function() {
  return this.attendees ? this.attendees.length : 0;
});

// Method to check if event is full
eventSchema.methods.isFull = function() {
  return this.maxAttendees > 0 && this.attendees.length >= this.maxAttendees;
};

// Method to check if registration is open
eventSchema.methods.isRegistrationOpen = function() {
  if (this.status !== 'upcoming') return false;
  if (this.registrationDeadline && new Date() > this.registrationDeadline) return false;
  if (this.isFull()) return false;
  return true;
};

// Indexes
eventSchema.index({ date: 1, status: 1 });
eventSchema.index({ type: 1, date: -1 });
eventSchema.index({ category: 1, date: -1 });
eventSchema.index({ organizer: 1, date: -1 });
eventSchema.index({ isActive: 1, status: 1 });
eventSchema.index({ isIslamicEvent: 1, date: -1 });
eventSchema.index({ createdAt: -1 });

const Event = mongoose.model('Event', eventSchema);

export default Event;