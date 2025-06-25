import mongoose from 'mongoose';

const RefillsAbandonedSchema = new mongoose.Schema({
    userSessionId: { type: String, required: true, unique: true },
    firstSegment: {
        firstName: String,
        lastName: String,
        phone: String,
        email: String,
    },
    lastSegmentReached: Number,
    state: Number, // 0 = left, 1 = kicked, 2 = filled
    timestamp: Date,
}, { timestamps: true });

export const RefillsAbandoned = mongoose.models.RefillsAbandoned || mongoose.model('RefillsAbandoned', RefillsAbandonedSchema);
