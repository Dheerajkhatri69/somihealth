import mongoose from 'mongoose';

const planHeaderSchema = new mongoose.Schema({
    title: {
        type: String,
        default: 'Wellness Plan designed by clinicians to optimize your health.',
        trim: true,
    },
    subtitle: {
        type: String,
        default:
            'Your journey deserves more than one-size-fits-all. Find the tailored medication plan built to support your goals.',
        trim: true,
    },
    config: {
        isActive: { type: Boolean, default: true },
    },
}, { timestamps: true });

// enforce only one active header
planHeaderSchema.index(
    { 'config.isActive': 1 },
    { unique: true, partialFilterExpression: { 'config.isActive': true } }
);

export default mongoose.models.PlanHeader || mongoose.model('PlanHeader', planHeaderSchema);
