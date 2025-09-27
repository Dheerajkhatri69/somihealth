import mongoose from 'mongoose';

const resultsSchema = new mongoose.Schema({
    // Tabs array
    tabs: [{
        title: {
            type: String,
            required: true
        },
        value: {
            type: String,
            required: true
        },
        color: {
            type: String,
            required: true
        },
        bg: {
            type: String,
            required: true
        },
        bgActive: {
            type: String,
            required: true
        },
        bullets: [{
            type: String,
            required: true
        }],
        body: {
            type: String,
            required: true
        },
        icon: {
            type: String,
            required: true,
            enum: ['Beaker', 'BadgeDollarSign', 'ShieldCheck']
        }
    }],
    
    // Optional header content
    header: {
        eyebrow: {
            type: String,
            default: ''
        },
        headlineLeft: {
            type: String,
            default: ''
        },
        headlineRight: {
            type: String,
            default: ''
        }
    },

    // Optional main image
    image: {
        type: String,
        default: ''
    },

    // Watermark settings
    watermark: {
        text: {
            type: String,
            default: 'somi'
        },
        size: {
            type: String,
            default: '160px'
        },
        strokeColor: {
            type: String,
            default: '#364c781d'
        },
        strokeWidth: {
            type: String,
            default: '2px'
        },
        fill: {
            type: String,
            default: 'transparent'
        },
        font: {
            type: String,
            default: '"Sofia Sans", ui-sans-serif'
        },
        weight: {
            type: Number,
            default: 700
        },
        tracking: {
            type: String,
            default: '0em'
        },
        opacity: {
            type: Number,
            default: 1
        },
        left: {
            type: String,
            default: '0rem'
        },
        top: {
            type: String,
            default: '8rem'
        },
        rotate: {
            type: String,
            default: '0deg'
        }
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
resultsSchema.index({ isActive: 1 }, { unique: true, partialFilterExpression: { isActive: true } });

export default mongoose.models.Results || mongoose.model('Results', resultsSchema);
