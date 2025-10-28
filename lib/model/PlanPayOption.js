// /lib/model/PlanPayOption.js
import mongoose, { Schema } from 'mongoose';

const PlanPayOptionSchema = new Schema(
    {
        // idname like "semaglutide", "tirzepatide", "weightloss", etc.
        name: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
            index: true,
        },
        sort: { type: Number, default: 0, index: true },
        label: { type: String, required: true },
        price: { type: String, required: true }, // keep string e.g. "$559"
        link: { type: String, default: '' },
        paypal: { type: String, default: '' },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

export default mongoose.models.PlanPayOption ||
    mongoose.model('PlanPayOption', PlanPayOptionSchema);