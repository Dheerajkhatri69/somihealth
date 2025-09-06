import mongoose from 'mongoose';

const aboutPageContentSchema = new mongoose.Schema({
  // Hero section
  hero: {
    badge: {
      type: String,
      default: 'Somi Health'
    },
    title: {
      type: String,
      default: 'Somi Health empowers you with real solutions and expert care.'
    },
    subtitle: {
      type: String,
      default: 'Weight Loss Isn\'t About Willpower—It\'s about getting the right support. We simplify the journey with expert-led care, personalized treatments, and transparent pricing.'
    },
    primaryButton: {
      text: { type: String, default: 'Talk to care team' },
      link: { type: String, default: '/contact' }
    },
    secondaryButton: {
      text: { type: String, default: 'Explore plans' },
      link: { type: String, default: '/find-your-plan' }
    },
    image: {
      type: String,
      default: '/hero/abouthero.jpg'
    },
    imageAlt: {
      type: String,
      default: 'Members of the Somi Health care team'
    }
  },

  // Our Story section
  ourStory: {
    title: {
      type: String,
      default: 'Weight loss built on trust, transparency, and connection.'
    },
    paragraph1: {
      type: String,
      default: 'At Somi Health, we believe that lasting weight loss starts with trust, transparency, and true connection. We\'re here to simplify your journey with expert-led care, personalized treatments, and clear, upfront pricing—no hidden fees, no confusion.'
    },
    paragraph2: {
      type: String,
      default: 'Our dedicated team, rooted in compassion and experience, works alongside you to create a healthier, more confident future. Whether you\'re just getting started or ready to take the next big step, we make medical weight loss easier, safer, and more accessible for everyone.'
    },
    image: {
      type: String,
      default: '/hero/aboutstory.png'
    },
    imageAlt: {
      type: String,
      default: 'Compassionate clinician consulting a patient'
    }
  },

  // Value cards
  valueCards: [{
    icon: { type: String, required: true }, // Will store icon name like 'HeartPulse'
    title: { type: String, required: true },
    text: { type: String, required: true }
  }],

  // Stats section
  stats: {
    title: {
      type: String,
      default: 'Care that actually supports you'
    },
    subtitle: {
      type: String,
      default: 'We blend medical expertise with human connection so your plan is doable—and sustainable.'
    },
    stats: [{
      label: { type: String, required: true },
      value: { type: Number, required: true },
      suffix: { type: String, default: '' }
    }]
  },

  // Page configuration
  config: {
    isActive: { type: Boolean, default: true },
    showHero: { type: Boolean, default: true },
    showOurStory: { type: Boolean, default: true },
    showValueCards: { type: Boolean, default: true },
    showStats: { type: Boolean, default: true },
    showHowItWorks: { type: Boolean, default: true }
  }
}, {
  timestamps: true
});

// Ensure only one active about page content exists
aboutPageContentSchema.index({ 'config.isActive': 1 }, { unique: true, partialFilterExpression: { 'config.isActive': true } });

const AboutPageContent = mongoose.models.AboutPageContent || mongoose.model('AboutPageContent', aboutPageContentSchema);

export default AboutPageContent;
