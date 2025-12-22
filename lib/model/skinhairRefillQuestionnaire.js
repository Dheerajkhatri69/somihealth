import mongoose from 'mongoose';

const skinhairRefillQuestionnaireSchema = new mongoose.Schema({
    // Basic identification
    authid: {
        type: String,
        required: true,
    },

    // Personal information
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

    // Form fields
    skinhairApproved: {
        type: String,
        required: true,
        enum: ['yes', 'no'],
    },

    medicationChanges: {
        type: String,
        required: true,
        enum: ['yes', 'no'],
    },
    medicationChangesDetail: {
        type: String,
    },

    currentTreatment: {
        type: String,
        required: true,
        enum: ['Finasteride', 'Minoxidil', 'Rx Hair', 'Rx Skin'],
    },

    sideEffects: {
        type: String,
        required: true,
        enum: ['yes', 'no'],
    },
    sideEffectsDetail: {
        type: String,
    },

    happyWithTreatment: {
        type: String,
        required: true,
        enum: ['yes', 'no'],
    },
    happyWithTreatmentDetail: {
        type: String,
    },

    providerQuestions: {
        type: String,
    },

    treatmentType: {
        type: String,
        default: 'SkinHair Refill',
    },

    // System fields
    questionnaire: {
        type: Boolean,
        default: true,
    },

    seen: {
        type: Boolean,
        default: false,
    },

    createTimeDate: {
        type: Date,
        default: Date.now,
    },

    images: [{
        type: String,
    }],

    approvalStatus: {
        type: String,
        default: "None",
        enum: ["approved", "denied", "pending", "disqualified", "None"],
    },

    providerNote: {
        type: String,
    },

    followUp: {
        type: String,
    },

    refillReminder: {
        type: String,
    },

    dose: {
        type: String,
    },

    unit: {
        type: String,
    },

    closetickets: {
        type: Boolean,
        default: false
    },
    Reasonclosetickets: String,
    initialAuthId: String,      // Link to original patient record
    needLabafter3RxFills: {  // Lab requirement tracking
        type: Boolean,
        default: false
    },
    followUpRefills: {      // Automatic follow-up scheduling
        type: Boolean,
        default: true
    },
}, {
    timestamps: true, // This adds createdAt and updatedAt automatically
});

// Check if model already exists to prevent overwriting
const SkinHairRefillQuestionnaire = mongoose.models.SkinHairRefillQuestionnaire ||
    mongoose.model('SkinHairRefillQuestionnaire', skinhairRefillQuestionnaireSchema);

export default SkinHairRefillQuestionnaire;

