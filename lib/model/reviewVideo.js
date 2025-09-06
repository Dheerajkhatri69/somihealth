import mongoose from 'mongoose';

const reviewVideoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  subtitle: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  poster: {
    type: String,
    required: true,
    trim: true
  },
  srcMp4: {
    type: String,
    required: true,
    trim: true
  },
  srcWebm: {
    type: String,
    trim: true,
    default: ''
  },
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
reviewVideoSchema.index({ isActive: 1 });
reviewVideoSchema.index({ sortOrder: 1 });

const ReviewVideo = mongoose.models.ReviewVideo || mongoose.model('ReviewVideo', reviewVideoSchema);

export default ReviewVideo;
