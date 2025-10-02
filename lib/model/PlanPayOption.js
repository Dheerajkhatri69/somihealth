import mongoose, { Schema } from 'mongoose';

const PlanPayOptionSchema = new Schema(
    {
        // "Semaglutide" | "Tirzepatide"
        name: {
            type: String,
            required: true,
            enum: ['Semaglutide', 'Tirzepatide'],
            index: true,
        },
        sort: {
            type: Number,
            default: 0,
            index: true,
        },
        label: { type: String, required: true },
        price: { type: String, required: true }, // keep as string since UI shows "$559"
        link: { type: String, default: '' },     // Stripe
        paypal: { type: String, default: '' },   // PayPal
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

// Prevent model re-compilation in dev
export default mongoose.models.PlanPayOption ||
    mongoose.model('PlanPayOption', PlanPayOptionSchema);
