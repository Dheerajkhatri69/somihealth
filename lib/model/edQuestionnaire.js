import mongoose from "mongoose";

const edQuestionnaireSchema = new mongoose.Schema(
    {
        // ==== Primary Auth ID ====
        authid: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },

        // === Personal Information ===
        firstName: String,
        lastName: String,
        phone: String,
        email: {
            type: String,
            lowercase: true,
            trim: true,
        },

        // === Age Verification ===
        isOver18: {
            type: String,
            enum: ["yes", "no"],
        },
        dateOfBirth: Date,

        // === Address ===
        address: String,
        address2: String,
        city: String,
        state: String,
        zip: String,
        country: String,

        // === Medical Questions ===
        nitratesMedication: {
            type: String,
            enum: ["yes", "no"],
        },
        substanceUse: [String],
        symptoms: [String],
        cardiovascularConditions: [String],
        urologicalConditions: [String],
        bloodConditions: [String],
        organConditions: [String],
        neurologicalConditions: {
            type: String,
            enum: ["yes", "no"],
        },
        cancerConditions: {
            type: String,
            enum: ["yes", "no"],
        },
        eyeConditions: {
            type: String,
            enum: ["yes", "no"],
        },

        // === Current Medications ===
        currentMedications: {
            type: String,
            enum: ["yes", "no"],
        },
        medicationsList: String,

        // === Allergies ===
        medicationAllergies: {
            type: String,
            enum: ["yes", "no"],
        },
        allergiesList: String,

        // === Additional Medical Conditions ===
        medicalConditions: {
            type: String,
            enum: ["yes", "no"],
        },
        medicalConditionsList: String,

        // === ED Symptoms ===
        erectionChallenges: {
            type: String,
            enum: ["yes", "no"],
        },
        erectionSustaining: {
            type: String,
            enum: ["yes", "no"],
        },
        erectionChange: {
            type: String,
            enum: ["Sudden Change", "Gradually Worsen"],
        },
        sexualEncounters: {
            type: String,
            enum: ["1-5", "5+"],
        },
        nonPrescriptionSupplements: {
            type: String,
            enum: ["yes", "no"],
        },

        // === Previous ED Treatment ===
        previousEDMeds: {
            type: String,
            enum: ["yes", "no"],
        },

        // === Uploads ===
        edMedicationPhoto: String,
        idPhoto: String,

        // === How did you hear about us ===
        heardAbout: {
            type: String,
            enum: ["Instagram", "Facebook", "TikTok", "Other"],
        },
        heardAboutOther: String,
        comments: String,

        // === Final Step Checkboxes ===
        consent: { type: Boolean, default: false },
        terms: { type: Boolean, default: false },
        treatment: { type: Boolean, default: false },
        agreetopay: { type: Boolean, default: false },

        // === System Fields ===
        questionnaire: { type: Boolean, default: true },
        status: { type: String, default: "submitted" },
        seen: { type: Boolean, default: false },
        patientId: String,
        createTimeDate: { type: Date, default: Date.now },

        closetickets: { type: Boolean, default: false },
        Reasonclosetickets: String,

        images: [String],

        approvalStatus: { type: String, default: "None" },
        providerNote: String,

        followUp: String,
        refillReminder: String,

        dose: String,
        unit: String,
        currentMedication: {
            type: String,
            enum: ['Sildenafil (Generic of Viagra)', 'Tadalafil (Generic of Cialis)', 'Fusion Mini Troches (Tadalafil/Sildenafil)'],
        },
        currentDose: String,
    },
    { timestamps: true }
);

// Indexes for performance
edQuestionnaireSchema.index({ authid: 1 });
edQuestionnaireSchema.index({ status: 1 });

const EDQuestionnaire =
    mongoose.models.EDQuestionnaire ||
    mongoose.model("EDQuestionnaire", edQuestionnaireSchema);

export default EDQuestionnaire;

