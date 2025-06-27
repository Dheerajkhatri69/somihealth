import mongoose from 'mongoose';

const referralSchema = new mongoose.Schema({
  referralSource: {
    type: String,
    enum: ['Friend/Family', 'Healthcare Provider', 'Pharmacy'],
    required: true,
  },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  refFirstName: { type: String, required: true },
  refLastName: { type: String, required: true },
  refPhone: { type: String, required: true },
  refEmail: { type: String, required: true },
  providerField: { type: String }, // NPI, only for Healthcare Provider
  seen: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const Referral = mongoose.models.Referral || mongoose.model('Referral', referralSchema);

export default Referral; 