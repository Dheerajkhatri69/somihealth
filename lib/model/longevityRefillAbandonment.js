import mongoose from 'mongoose';

const LongevityRefillAbandonmentSchema = new mongoose.Schema({
    userSessionId: { type: String, required: true, unique: true },

    firstSegment: {
        firstName: String,
        lastName: String,
        phone: String,
        email: String,
    },

    lastSegmentReached: Number,
    state: Number,     // 0=in-progress, 1=ineligible, 2=completed, 3=submitted
    timestamp: Date,

    question: { type: String, default: "" },   // stores the specific question name/title

    seen: { type: Boolean, default: true },
}, { timestamps: true });

LongevityRefillAbandonmentSchema.index({ state: 1, seen: 1 });

export const LongevityRefillAbandonment =
    mongoose.models.LongevityRefillAbandonment ||
    mongoose.model('LongevityRefillAbandonment', LongevityRefillAbandonmentSchema);