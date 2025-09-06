import mongoose from 'mongoose';

const contactPageContentSchema = new mongoose.Schema({
  // Hero section
  hero: {
    title: {
      type: String,
      default: 'Contact Somi Health'
    },
    subtitle: {
      type: String,
      default: 'We\'re here to help at every step of your weight loss journey. Call, email, or send us a message—whatever works best for you.'
    },
    backgroundImage: {
      type: String,
      default: '/hero/somi-vials.png'
    },
    copyImage: {
      type: String,
      default: '/hero/hero-copy.png'
    }
  },

  // Contact information
  contactInfo: {
    phone: {
      number: { type: String, default: '(704) 386-6871' },
      display: { type: String, default: '(704) 386-6871' },
      link: { type: String, default: 'tel:+17043866871' }
    },
    email: {
      address: { type: String, default: 'info@joinsomi.com' },
      display: { type: String, default: 'info@joinsomi.com' },
      link: { type: String, default: 'mailto:info@joinsomi.com' }
    },
    address: {
      text: { type: String, default: 'United States (Remote-first)' },
      display: { type: String, default: 'United States (Remote-first)' }
    },
    hours: {
      text: { type: String, default: 'Mon–Fri, 9am–6pm ET' },
      display: { type: String, default: 'Mon–Fri, 9am–6pm ET' }
    }
  },

  // Sidebar content
  sidebar: {
    title: {
      type: String,
      default: 'What to expect'
    },
    expectations: [{
      text: { type: String, required: true }
    }],
    callToAction: {
      text: { type: String, default: 'Prefer to call?' },
      phone: { type: String, default: '(704) 386-6871' },
      link: { type: String, default: 'tel:+17043866871' }
    }
  },

  // Page configuration
  config: {
    isActive: { type: Boolean, default: true },
    showContactInfo: { type: Boolean, default: true },
    showSidebar: { type: Boolean, default: true },
    showForm: { type: Boolean, default: true }
  }
}, {
  timestamps: true
});

// Ensure only one active contact page content exists
contactPageContentSchema.index({ isActive: 1 }, { unique: true, partialFilterExpression: { isActive: true } });

const ContactPageContent = mongoose.models.ContactPageContent || mongoose.model('ContactPageContent', contactPageContentSchema);

export default ContactPageContent;
