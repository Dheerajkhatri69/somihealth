import mongoose from 'mongoose';

const longevityRefillQuestionnaireSchema = new mongoose.Schema({
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
    approved: {
        type: String,
        required: true,
        enum: ['yes', 'no'],
    },

    medicationChanges: {
        type: String,
        required: true,
        enum: ['yes', 'no'],
    },
    desmedicationChanges: {
        type: String,
    },

    preference: {
        type: String,
        required: true,
        enum: ['NAD+', 'Glutathione', 'Sermorelin'],
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
    deshappyWithMed: {
        type: String,
    },

    dosageNote: {
        type: String,
    },

    // System fields (your requested fields)
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
        enum: ["approved", "denied", "pending", "disqualified","None"],
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

    idPhoto: {
        type: String,
    },

    address1: String,      // Required for shipping
    address2: String,
    city: String,         // Required for shipping
    state: String,        // Required for shipping
    zip: String,          // Required for shipping
    country: String,
    dob: Date,           // Age verification for prescription
    sex: String,         // Medical records consistency
    height: String,      // For BMI calculation (could combine heightFeet+heightInches)
    weight: String,      // For BMI calculation (current weight)
    bmi: String,         // Health monitoring
    closetickets: {      // For admin to mark as resolved
        type: Boolean,
        default: false
    },
    Reasonclosetickets: String, // Why ticket was closed
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
const LongevityRefillQuestionnaire = mongoose.models.LongevityRefillQuestionnaire ||
    mongoose.model('LongevityRefillQuestionnaire', longevityRefillQuestionnaireSchema);

export default LongevityRefillQuestionnaire;