import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: [
      'registration',
      'profile_update',
      'email_verification',
      'payment_submission',
      'payment_verification',
      'event_registration',
      'event_attendance',
      'community_join',
      'donation',
      'membership_renewal'
    ],
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for faster queries
activitySchema.index({ user: 1, createdAt: -1 });
activitySchema.index({ type: 1, createdAt: -1 });

const Activity = mongoose.model('Activity', activitySchema);

export default Activity;