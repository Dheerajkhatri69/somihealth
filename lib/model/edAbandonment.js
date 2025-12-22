import mongoose from 'mongoose';

const EDAbandonmentSchema = new mongoose.Schema({
    userSessionId: { type: String, required: true, unique: true },

    firstSegment: {
        firstName: String,
        lastName: String,
        phone: String,
        email: String,
    },

    lastSegmentReached: Number,
    state: Number,     // 0 = in progress, 1 = ineligible, 2 = completed
    timestamp: Date,

    // NEW FIELD 👇
    question: { type: String, default: "" },   // stores the specific question name/title/value

    seen: { type: Boolean, default: true },
}, { timestamps: true });

EDAbandonmentSchema.index({ state: 1, seen: 1 });

export const EDAbandonment =
    mongoose.models.EDAbandonment ||
    mongoose.model('EDAbandonment', EDAbandonmentSchema);

