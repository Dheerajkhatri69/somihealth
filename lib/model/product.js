import mongoose from 'mongoose';

const CtaSchema = new mongoose.Schema({
  label: { type: String, default: '' },
  href: { type: String, default: '' },
}, { _id: false });

const HowItWorksStepSchema = new mongoose.Schema({
  number: { type: Number, default: 1 },
  title: { type: String, default: '' },
  description: { type: String, default: '' },
}, { _id: false });

const ProductSchema = new mongoose.Schema({
  // ---- core ----
  category: { type: String, required: true, lowercase: true, trim: true },
  slug: { type: String, required: true, lowercase: true, trim: true, unique: false },
  label: { type: String, required: true, trim: true },
  shortLabel: { type: String, required: true, trim: true },
  heroImage: { type: String, required: true },
  price: { type: Number, required: true, default: 0 },
  unit: { type: String, required: true, default: '' },
  description: { type: String, required: true, default: '' },

  // ---- plans & status ----
  showInPlans: { type: Boolean, default: true },
  inStock: { type: Boolean, default: true },
  isActive: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 },

  // ---- UI niceties ----
  ratingLabel: { type: String, default: '' },
  trustpilot: { type: String, default: '' },

  // ---- NEW: Plans note text (shows above buttons in plans card) ----
  plansNote: { type: String, default: 'Price for purchase of 3 month supply' },

  // ---- CTAs (already used in your dashboard; keep using this) ----
  ctas: {
    primary: { type: CtaSchema, default: () => ({ label: 'Get Started', href: '/getstarted' }) },
    secondary: { type: CtaSchema, default: () => ({ label: 'Learn More', href: '/learn-more' }) },
  },

  // ---- bullets/features ----
  bullets: [{ icon: { type: String, default: '' }, text: { type: String, default: '' } }],

  // ---- product details ----
  productDetails: {
    title: { type: String, default: '' },
    introTitle: { type: String, default: '' },
    intro: { type: String, default: '' },
    breakdownHeading: { type: String, default: '' },
    ingredients: [{ name: { type: String, default: '' }, desc: { type: String, default: '' } }],
    benefitsHeading: { type: String, default: '' },
    benefits: [String],
    expectationsHeading: { type: String, default: '' },
    expectations: { type: String, default: '' },
    footnote: { type: String, default: '' },
    image: {
      src: { type: String, default: '' },
      alt: { type: String, default: '' },
    }
  },

  // ---- how it works (two shapes supported in your app) ----
  howItWorks: {
    heading: { type: String, default: '' },
    intro: { type: String, default: '' },
  },

  howItWorksSection: {
    title: { type: String, default: '' },
    steps: { type: [HowItWorksStepSchema], default: [] },
    cta: { type: CtaSchema, default: () => ({ label: '', href: '' }) },
    image: {
      src: { type: String, default: '' },
      alt: { type: String, default: '' },
    }
  },
}, { timestamps: true });

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
