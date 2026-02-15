import mongoose from 'mongoose';

const ProjectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  status: { type: String, default: 'active' },
  location: { type: String },
  timeline: { type: String },
  participants: { type: Number, default: 0 },
  progress: { type: Number, default: 0 },
  impact: { type: String },
  image: { type: String },
  imagePublicId: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('Project', ProjectSchema);
