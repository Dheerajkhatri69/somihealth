import mongoose from 'mongoose';

const SkinHairAbandonmentSchema = new mongoose.Schema({
    userSessionId: { type: String, required: true, unique: true },

    firstSegment: {
        firstName: String,
        lastName: String,
        phone: String,
        email: String,
    },

    lastSegmentReached: Number,
    state: Number,     // 0=in-progress, 1=ineligible, 2=completed
    timestamp: Date,

    question: { type: String, default: "" },   // stores the specific question name/title

    seen: { type: Boolean, default: true },
}, { timestamps: true });

SkinHairAbandonmentSchema.index({ state: 1, seen: 1 });

export const SkinHairAbandonment =
    mongoose.models.SkinHairAbandonment ||
    mongoose.model('SkinHairAbandonment', SkinHairAbandonmentSchema);

