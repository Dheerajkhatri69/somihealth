// lib/model/contactForm.js
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
    enum: ['Weight Loss', 'Longevity', 'Erectile Dysfunction', 'Skin+Hair', 'General Health', 'Other', 'Support']
  },
  comments: {
    type: String,
    maxlength: 600,
    trim: true
  },

  // 👇 NEW FIELD
  seen: {
    type: Boolean,
    default: true, // new submission = unseen/new
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
contactFormSchema.index({ seen: 1, submittedAt: -1 }); // optional but useful

const ContactForm = mongoose.models.ContactForm || mongoose.model('ContactForm', contactFormSchema);

export default ContactForm;
