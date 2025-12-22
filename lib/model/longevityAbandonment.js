import mongoose from 'mongoose';

const LongevityAbandonmentSchema = new mongoose.Schema({
    userSessionId: { type: String, required: true, unique: true },

    firstSegment: {
        firstName: String,
        lastName: String,
        phone: String,
        email: String,
    },

    lastSegmentReached: Number,
    state: Number,     // 1,2,3 or any step number
    timestamp: Date,

    // NEW FIELD 👇
    question: { type: String, default: "" },   // stores the specific question name/title/value

    seen: { type: Boolean, default: true },
}, { timestamps: true });

LongevityAbandonmentSchema.index({ state: 1, seen: 1 });

export const LongevityAbandonment =
    mongoose.models.LongevityAbandonment ||
    mongoose.model('LongevityAbandonment', LongevityAbandonmentSchema);
