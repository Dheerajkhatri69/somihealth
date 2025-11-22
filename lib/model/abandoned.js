// lib/model/abandoned.js
import mongoose from 'mongoose';

const AbandonedSchema = new mongoose.Schema({
    userSessionId: { type: String, required: true, unique: true },
    firstSegment: {
        firstName: String,
        lastName: String,
        phone: String,
        email: String,
    },
    lastSegmentReached: Number,
    state: Number,         // 1,2,3 (your note)
    timestamp: Date,
    seen: { type: Boolean, default: true }, // NEW: new records start as "seen = true"
}, { timestamps: true });

AbandonedSchema.index({ state: 1, seen: 1 });

export const Abandoned =
    mongoose.models.Abandoned || mongoose.model('Abandoned', AbandonedSchema);
