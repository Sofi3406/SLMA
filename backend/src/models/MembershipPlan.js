import mongoose from 'mongoose';

const membershipPlanSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Plan name is required'],
      unique: true,
    },
    nameAmharic: {
      type: String,
      required: [true, 'Amharic plan name is required'],
    },
    nameSiltigna: {
      type: String,
      required: [true, 'Silte plan name is required'],
    },
    description: String,
    descriptionAmharic: String,
    descriptionSiltigna: String,
    fee: {
      type: Number,
      required: [true, 'Membership fee is required'],
      min: [0, 'Fee cannot be negative'],
    },
    duration: {
      type: Number,
      required: [true, 'Duration is required'],
      min: [1, 'Duration must be at least 1 month'],
      default: 12,
    },
    benefits: [String],
    benefitsAmharic: [String],
    benefitsSiltigna: [String],
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const MembershipPlan = mongoose.model('MembershipPlan', membershipPlanSchema);
export default MembershipPlan;