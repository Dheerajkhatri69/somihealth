import mongoose, { Schema } from 'mongoose';

const refillSchema = new Schema({
    authid: {
        type: String,
        required: true,
    },
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    glp1Approved: {
        type: String,
        required: true,
        enum: ['yes', 'no'],
    },
    currentWeight: {
        type: String,
        required: true,
    },
    medicationChanges: {
        type: String,
        required: true,
    },
    glp1Preference: {
        type: String,
        required: true,
    },
    sideEffects: {
        type: String,
        required: true,
        enum: ['yes', 'no'],
    },
    sideEffectsDetail: {
        type: String,
    },
    happyWithMed: {
        type: String,
        required: true,
        enum: ['yes', 'no'],
    },
    dosageDecision: {
        type: String,
    },
    dosageNote: {
        type: String,
    },
    seen: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });

const Refill = mongoose.models.Refill || mongoose.model('Refill', refillSchema);

export default Refill; 