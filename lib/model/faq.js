import mongoose from 'mongoose';

const faqSchema = new mongoose.Schema({
  // Main section content
  heading: {
    type: String,
    required: true,
    default: 'Find clear, honest answers about our medical weight loss treatments'
  },
  subheading: {
    type: String,
    required: true,
    default: 'Your Questions, Answered— Every Step of the Way.'
  },
  
  // FAQ items array
  faqs: [{
    question: {
      type: String,
      required: true,
      trim: true
    },
    answer: {
      type: String,
      required: true,
      trim: true
    },
    sortOrder: {
      type: Number,
      default: 0
    }
  }],
  
  // Benefits list
  benefits: [{
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
  
  // Footer callout
  footerTitle: {
    type: String,
    required: true,
    default: 'Still have questions?'
  },
  footerDescription: {
    type: String,
    required: true,
    default: 'Cant find the answer youre looking for? Please chat to our friendly team.'
  },
  footerButtonText: {
    type: String,
    required: true,
    default: 'Get in touch'
  },
  footerButtonLink: {
    type: String,
    required: true,
    default: '/underdevelopmentmainpage/contact'
  },
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Ensure only one active record
faqSchema.index({ isActive: 1 }, { unique: true, partialFilterExpression: { isActive: true } });

const FAQ = mongoose.models.FAQ || mongoose.model('FAQ', faqSchema);

export default FAQ;
