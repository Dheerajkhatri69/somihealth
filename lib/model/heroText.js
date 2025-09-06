import mongoose from 'mongoose';

const heroTextSchema = new mongoose.Schema({
  mainTitle: {
    type: String,
    required: true,
    trim: true,
    default: 'Look Better, Feel Better, Live Better.'
  },
  rotatingLines: [{
    type: String,
    required: true,
    trim: true
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  sortOrder: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Add indexes
heroTextSchema.index({ isActive: 1 });
heroTextSchema.index({ sortOrder: 1 });

const HeroText = mongoose.models.HeroText || mongoose.model('HeroText', heroTextSchema);

export default HeroText;
