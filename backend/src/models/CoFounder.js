import mongoose from 'mongoose';

const CoFounderSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, required: true },
  expertise: { type: String },
  currentActivity: { type: String },
  background: { type: String },
  slmaContribution: { type: String },
  funFact: { type: String },
  availability: { type: String, default: 'available' },
  image: { type: String },
  imagePublicId: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('CoFounder', CoFounderSchema);
