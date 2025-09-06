import mongoose from 'mongoose';

const menuItemSchema = new mongoose.Schema({
  label: {
    type: String,
    required: true,
    trim: true
  },
  href: {
    type: String,
    required: true,
    trim: true
  },
  img: {
    type: String,
    trim: true
  },
  badge: {
    type: String,
    trim: true
  },
  isLink: {
    type: Boolean,
    default: false
  }
});

const categorySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  items: [menuItemSchema]
});

const ctaSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  button: {
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
  },
  img: {
    type: String,
    trim: true
  }
});

const menuSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  showInNavbar: {
    type: Boolean,
    default: true
  },
  type: {
    type: String,
    enum: ['simple', 'categorized'],
    default: 'simple'
  },
  discover: {
    label: {
      type: String,
      required: false,
      trim: true,
      default: ''
    },
    href: {
      type: String,
      required: false,
      trim: true,
      default: ''
    }
  },
  treatments: [menuItemSchema],
  categories: [categorySchema],
  cta: ctaSchema,
  mainPanelImg: {
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
menuSchema.index({ slug: 1 });
menuSchema.index({ showInNavbar: 1 });
menuSchema.index({ isActive: 1 });
menuSchema.index({ sortOrder: 1 });

// Pre-save middleware to generate slug if not provided
menuSchema.pre('save', function(next) {
  if (!this.slug) {
    this.slug = this.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
  }
  next();
});

const Menu = mongoose.models.Menu || mongoose.model('Menu', menuSchema);

export default Menu;
