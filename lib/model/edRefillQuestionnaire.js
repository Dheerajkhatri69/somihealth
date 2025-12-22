import mongoose from 'mongoose';

const edRefillQuestionnaireSchema = new mongoose.Schema({
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
    edApproved: {
        type: String,
        required: true,
        enum: ['yes', 'no'],
    },

    medicalChanges: {
        type: String,
        required: true,
        enum: ['yes', 'no'],
    },
    medicalChangesDetail: {
        type: String,
    },

    currentMedication: {
        type: String,
        required: true,
    },
    currentDose: {
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
    happyWithMedDetail: {
        type: String,
    },

    medicationDecision: {
        type: String,
        required: true,
    },
    changeSelection: {
        type: String,
    },

    providerNotes: {
        type: String,
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
const EDRefillQuestionnaire = mongoose.models.EDRefillQuestionnaire ||
    mongoose.model('EDRefillQuestionnaire', edRefillQuestionnaireSchema);

export default EDRefillQuestionnaire;

