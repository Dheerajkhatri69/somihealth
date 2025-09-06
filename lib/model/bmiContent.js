import mongoose from 'mongoose';

const bmiContentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  image: {
    type: String,
    required: true,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Add indexes
bmiContentSchema.index({ isActive: 1 });

const BMIContent = mongoose.models.BMIContent || mongoose.model('BMIContent', bmiContentSchema);

export default BMIContent;
