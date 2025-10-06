import mongoose from 'mongoose';

const planHeaderSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            default:
                'Wellness Plan designed by clinicians to optimize your health.',
            trim: true,
        },
        // NEW: rotating items list
        items: {
            type: [String],
            default: [
                'Speed',
                'Stability',
                'Style',
                'Somi ❤️',
            ],
            validate: {
                validator: (arr) => Array.isArray(arr) && arr.length > 0,
                message: 'items must contain at least one string',
            },
        },
        config: {
            isActive: { type: Boolean, default: true },
        },
    },
    { timestamps: true }
);

// normalize items: trim and drop empties
planHeaderSchema.pre('save', function (next) {
    if (Array.isArray(this.items)) {
        this.items = this.items
            .map((s) => (typeof s === 'string' ? s.trim() : ''))
            .filter(Boolean);
        if (this.items.length === 0) {
            this.items = [
                'Speed',
                'Stability',
                'Style',
                'Somi ❤️',
            ];
        }
    }
    next();
});

// enforce only one active header
planHeaderSchema.index(
    { 'config.isActive': 1 },
    { unique: true, partialFilterExpression: { 'config.isActive': true } }
);

export default mongoose.models.PlanHeader ||
    mongoose.model('PlanHeader', planHeaderSchema);
