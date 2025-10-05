import mongoose from 'mongoose';

const featureSchema = new mongoose.Schema(
  {
    icon: { type: String, trim: true, default: 'Handshake' }, // lucide icon name
    text: { type: String, required: true, trim: true },
    sortOrder: { type: Number, default: 0 },
  },
  { _id: false }
);

const heroTextSchema = new mongoose.Schema(
  {
    mainTitle: {
      type: String,
      required: true,
      trim: true,
      default: 'Look Better, Feel Better, Live Better.',
    },
    rotatingLines: [
      {
        type: String,
        required: true,
        trim: true,
      },
    ],
    features: {
      type: [featureSchema],
      default: [
        { icon: 'Handshake', text: 'Free consultation, fast approval', sortOrder: 0 },
        { icon: 'CreditCard', text: 'No insurance required', sortOrder: 1 },
        { icon: 'Stethoscope', text: 'Doctor-led treatment plans', sortOrder: 2 },
      ],
    },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Indexes
heroTextSchema.index({ isActive: 1 });
heroTextSchema.index({ sortOrder: 1 });

export default mongoose.models.HeroText || mongoose.model('HeroText', heroTextSchema);
