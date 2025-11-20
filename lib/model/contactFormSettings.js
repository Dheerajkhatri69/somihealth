import mongoose from 'mongoose';

const contactFormSettingsSchema = new mongoose.Schema({
  // Form header
  title: {
    type: String,
    default: 'Contact Us Form'
  },
  
  // Form fields labels and placeholders
  fields: {
    firstName: {
      label: { type: String, default: 'Name' },
      placeholder: { type: String, default: 'First' }
    },
    lastName: {
      label: { type: String, default: 'Last' },
      placeholder: { type: String, default: 'Last' }
    },
    email: {
      label: { type: String, default: 'Email' },
      placeholder: { type: String, default: 'you@example.com' }
    },
    phone: {
      label: { type: String, default: 'Phone' },
      placeholder: { type: String, default: '(000) 000-0000' }
    },
    interestedIn: {
      label: { type: String, default: 'I am interested in:' },
      options: [{
        value: { type: String, required: true },
        label: { type: String, required: true }
      }]
    },
    comments: {
      label: { type: String, default: 'Comments' },
      placeholder: { type: String, default: '' },
      description: { type: String, default: 'Please let us know what\'s on your mind. Have a question for us? Ask away.' },
      maxLength: { type: Number, default: 600 }
    }
  },
  
  // Form styling and images
  styling: {
    backgroundColor: { type: String, default: '#ffffff' },
    borderColor: { type: String, default: '#e2e8f0' },
    textColor: { type: String, default: '#0f172a' },
    primaryColor: { type: String, default: '#3b82f6' }
  },
  
  // Background image
  backgroundImage: {
    type: String,
    default: ''
  },
  
  // Submit button
  submitButton: {
    text: { type: String, default: 'Send message' },
    loadingText: { type: String, default: 'Sending…' }
  },
  
  // Success/Error messages
  messages: {
    success: { type: String, default: 'Thanks! We\'ll get back to you shortly.' },
    error: { type: String, default: 'Something went wrong. Please try again.' }
  },
  
  // Form configuration
  config: {
    isActive: { type: Boolean, default: true },
    requireLastName: { type: Boolean, default: false },
    requireComments: { type: Boolean, default: false },
    enableNotifications: { type: Boolean, default: true },
    notificationEmail: { type: String, default: '' }
  }
}, {
  timestamps: true
});

// Ensure only one settings document exists
contactFormSettingsSchema.index({}, { unique: true });

const ContactFormSettings = mongoose.models.ContactFormSettings || mongoose.model('ContactFormSettings', contactFormSettingsSchema);

export default ContactFormSettings;
