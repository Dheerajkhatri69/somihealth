import mongoose from 'mongoose';

const EDRefillAbandonmentSchema = new mongoose.Schema({
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

EDRefillAbandonmentSchema.index({ state: 1, seen: 1 });

export const EDRefillAbandonment =
    mongoose.models.EDRefillAbandonment ||
    mongoose.model('EDRefillAbandonment', EDRefillAbandonmentSchema);

