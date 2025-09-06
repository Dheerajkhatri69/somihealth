import mongoose from 'mongoose';

const footerSchema = new mongoose.Schema({
  // Top CTA Card content
  ctaTitle: {
    type: String,
    required: true,
    default: 'Start your health journey now'
  },
  ctaDescription: {
    type: String,
    required: true,
    default: 'Somi Health offers personalized, clinically guided weight loss solutions to help you achieve lasting results and feel your best.'
  },
  ctaBenefits: [{
    text: {
      type: String,
      required: true,
      trim: true
    },
    sortOrder: {
      type: Number,
      default: 0
    }
  }],
  ctaLearnMoreText: {
    type: String,
    required: true,
    default: 'Learn More'
  },
  ctaLearnMoreLink: {
    type: String,
    required: true,
    default: '/learn-more'
  },
  ctaStartJourneyText: {
    type: String,
    required: true,
    default: 'Start Your Journey'
  },
  ctaStartJourneyLink: {
    type: String,
    required: true,
    default: '/getstarted'
  },
  ctaImage: {
    type: String,
    required: true,
    default: '/hero/footer.png'
  },

  // Brand section
  brandName: {
    type: String,
    required: true,
    default: 'somi'
  },
  brandTagline: {
    type: String,
    required: true,
    default: 'Look Better, Feel Better, Live Better.'
  },

  // Social media links
  socialLinks: [{
    platform: {
      type: String,
      required: true,
      enum: ['instagram', 'facebook', 'tiktok', 'indeed']
    },
    url: {
      type: String,
      required: true
    },
    ariaLabel: {
      type: String,
      required: true
    }
  }],

  // Contact information
  contactInfo: {
    phone: {
      type: String,
      required: true,
      default: '(704) 386-6871'
    },
    address: {
      type: String,
      required: true,
      default: '4111 E. Rose Lake Dr. Charlotte, NC 28217'
    },
    email: {
      type: String,
      required: true,
      default: 'info@joinsomi.com'
    }
  },

  // Badges
  badges: [{
    name: {
      type: String,
      required: true
    },
    image: {
      type: String,
      required: true
    },
    alt: {
      type: String,
      required: true
    },
    sortOrder: {
      type: Number,
      default: 0
    }
  }],

  // Navigation links
  navigationLinks: [{
    text: {
      type: String,
      required: true,
      trim: true
    },
    href: {
      type: String,
      required: true
    },
    target: {
      type: String,
      default: '_self'
    },
    rel: {
      type: String,
      default: ''
    },
    sortOrder: {
      type: Number,
      default: 0
    }
  }],

  // Legal links
  legalLinks: [{
    text: {
      type: String,
      required: true,
      trim: true
    },
    href: {
      type: String,
      required: true
    },
    sortOrder: {
      type: Number,
      default: 0
    }
  }],

  // Status
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Ensure only one active record
footerSchema.index({ isActive: 1 }, { unique: true, partialFilterExpression: { isActive: true } });

const Footer = mongoose.models.Footer || mongoose.model('Footer', footerSchema);

export default Footer;
