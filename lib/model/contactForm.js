import mongoose from 'mongoose';

const contactFormSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  interestedIn: {
    type: String,
    required: true,
    enum: ['Weight Loss', 'Longevity', 'Erectile Dysfunction','Skin+Hair','General Health','Other']
  },
  comments: {
    type: String,
    maxlength: 600,
    trim: true
  },
  status: {
    type: String,
    enum: ['new', 'contacted', 'in_progress', 'resolved', 'closed'],
    default: 'new'
  },
  notes: {
    type: String,
    trim: true
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for better query performance
contactFormSchema.index({ email: 1, submittedAt: -1 });
contactFormSchema.index({ status: 1, submittedAt: -1 });

const ContactForm = mongoose.models.ContactForm || mongoose.model('ContactForm', contactFormSchema);

export default ContactForm;
