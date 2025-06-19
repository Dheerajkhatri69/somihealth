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
    timestamp: Date,
}, { timestamps: true });

export const Abandoned = mongoose.models.Abandoned || mongoose.model('Abandoned', AbandonedSchema);
