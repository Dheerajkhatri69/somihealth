import mongoose from 'mongoose';

const howItWorksSchema = new mongoose.Schema({
    // Main heading
    eyebrow: {
        type: String,
        required: true,
        default: 'FEEL STRONGER, HEALTHIER, AND MORE CONFIDENT'
    },
    mainTitle: {
        type: String,
        required: true,
        default: 'How it works with Somi Health'
    },
    mainTitleHighlight: {
        type: String,
        required: true,
        default: 'with Somi Health'
    },
    
    // Steps array
    steps: [{
        eyebrow: {
            type: String,
            required: true
        },
        caption: {
            type: String,
            required: true
        },
        title: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        icon: {
            type: String,
            required: true,
            enum: ['ClipboardList', 'Video', 'Package']
        }
    }],
    
    // CTA button
    ctaText: {
        type: String,
        required: true,
        default: 'Start your journey'
    },
    ctaLink: {
        type: String,
        required: true,
        default: '/getstarted'
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
howItWorksSchema.index({ isActive: 1 }, { unique: true, partialFilterExpression: { isActive: true } });

export default mongoose.models.HowItWorks || mongoose.model('HowItWorks', howItWorksSchema);
