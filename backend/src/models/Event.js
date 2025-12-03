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
  date: {
    type: Date,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['cultural', 'networking', 'educational', 'social', 'religious'],
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
  image: String,
  registrationDeadline: Date,
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
  next();
});

// Indexes
eventSchema.index({ date: 1, status: 1 });
eventSchema.index({ type: 1, date: -1 });
eventSchema.index({ organizer: 1, date: -1 });

const Event = mongoose.model('Event', eventSchema);

export default Event;