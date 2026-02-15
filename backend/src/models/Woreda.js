import mongoose from 'mongoose';

const woredaSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Woreda name is required'],
      unique: true,
      trim: true,
    },
    nameAmharic: {
      type: String,
      required: [true, 'Amharic name is required'],
    },
    nameSiltigna: {
      type: String,
      required: [true, 'Silte name is required'],
    },
    description: {
      type: String,
      default: '',
    },
    descriptionAmharic: {
      type: String,
      default: '',
    },
    descriptionSiltigna: {
      type: String,
      default: '',
    },
    coordinator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    population: Number,
    area: String,
    coordinates: {
      lat: Number,
      lng: Number,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Woreda = mongoose.model('Woreda', woredaSchema);
export default Woreda;