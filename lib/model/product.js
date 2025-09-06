import mongoose from 'mongoose';

const bulletSchema = new mongoose.Schema({
  icon: {
    type: String,
    required: true,
    trim: true
  },
  text: {
    type: String,
    required: true,
    trim: true
  }
});

const ctaSchema = new mongoose.Schema({
  label: {
    type: String,
    required: true,
    trim: true
  },
  href: {
    type: String,
    required: true,
    trim: true
  }
});

const howItWorksSchema = new mongoose.Schema({
  heading: {
    type: String,
    required: true,
    trim: true
  },
  intro: {
    type: String,
    required: true,
    trim: true
  }
});

const benefitCardSchema = new mongoose.Schema({
  icon: {
    type: String,
    required: true,
    trim: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  body: {
    type: String,
    required: true,
    trim: true
  }
});

const leftTileSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['image', 'text'],
    default: 'image'
  },
  src: {
    type: String,
    trim: true
  },
  alt: {
    type: String,
    trim: true
  },
  content: {
    type: String,
    trim: true
  }
});

const benefitsSchema = new mongoose.Schema({
  leftTiles: [leftTileSchema],
  rightCards: [benefitCardSchema]
});

const productSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    trim: true
  },
  showInPlans: {
    type: Boolean,
    default: true
  },
  label: {
    type: String,
    required: true,
    trim: true
  },
  shortLabel: {
    type: String,
    required: true,
    trim: true
  },
  heroImage: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  unit: {
    type: String,
    required: true,
    trim: true
  },
  inStock: {
    type: Boolean,
    default: true
  },
  ratingLabel: {
    type: String,
    trim: true
  },
  trustpilot: {
    type: String,
    trim: true
  },
  bullets: [bulletSchema],
  description: {
    type: String,
    required: true,
    trim: true
  },
  ctas: {
    primary: ctaSchema,
    secondary: ctaSchema
  },
  howItWorks: howItWorksSchema,
  benefits: benefitsSchema,
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
productSchema.index({ category: 1, slug: 1 });
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ showInPlans: 1 });
productSchema.index({ sortOrder: 1 });

// Compound index for efficient queries
productSchema.index({ category: 1, slug: 1, isActive: 1 });

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

export default Product;
