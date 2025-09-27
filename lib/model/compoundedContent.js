import mongoose from 'mongoose';

const compoundedContentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  // Replace single description with dynamic tabs
  tabs: [{
    icon: { type: String, required: false, trim: true },
    subtitle: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true }
  }],
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
compoundedContentSchema.index({ isActive: 1 });

const CompoundedContent = mongoose.models.CompoundedContent || mongoose.model('CompoundedContent', compoundedContentSchema);

export default CompoundedContent;
