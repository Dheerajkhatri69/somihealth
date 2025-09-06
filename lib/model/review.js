import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  quote: {
    type: String,
    required: true,
    trim: true
  },
  author: {
    type: String,
    required: true,
    trim: true
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
reviewSchema.index({ isActive: 1 });
reviewSchema.index({ sortOrder: 1 });

const Review = mongoose.models.Review || mongoose.model('Review', reviewSchema);

export default Review;
