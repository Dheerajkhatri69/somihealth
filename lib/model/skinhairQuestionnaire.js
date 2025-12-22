import mongoose from "mongoose";

const skinhairQuestionnaireSchema = new mongoose.Schema(
    {
        // ==== Primary Auth ID ====
        authid: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },

        // === Basic Information (from questions/page.jsx) ===
        treatmentChoose: {
            type: String,
            enum: ['Finasteride', 'Minoxidil', 'Rx Hair', 'Rx Skin'],
        },
        firstName: String,
        lastName: String,
        phone: String,
        email: {
            type: String,
            lowercase: true,
            trim: true,
        },
        isOver18: {
            type: String,
            enum: ["yes", "no"],
        },
        address: String,
        address2: String,
        city: String,
        state: String,
        zip: String,
        country: String,

        // === Skin-Specific Fields (from skin/page.jsx) ===
        skinAllergies: [String],
        acneSymptoms: {
            facialHairAcne: { type: String, enum: ["yes", "no"] },
            chestAcne: { type: String, enum: ["yes", "no"] },
            backAcne: { type: String, enum: ["yes", "no"] },
            painfulLesions: { type: String, enum: ["yes", "no"] },
            recurrentBreakouts: { type: String, enum: ["yes", "no"] },
        },
        triedAcneProductsNotWork: {
            type: String,
            enum: ["yes", "no"],
        },
        notWorkProductsDesc: String,
        triedAcneProductsWorked: {
            type: String,
            enum: ["yes", "no"],
        },
        workedProductsDesc: String,
        pregnantBreastfeeding: {
            type: String,
            enum: ["yes", "no"],
        },
        acnePhotos: String,

        // === Hair-Specific Fields (from hair/page.jsx) ===
        hairLossPattern: {
            type: String,
            enum: ['thinning_crown', 'uneven_thinning', 'receding_hairline', 'excessive_shedding', 'none'],
        },
        hairLossStart: {
            type: String,
            enum: ['rapid_onset', 'gradual_onset', 'preventive'],
        },
        scalpSymptoms: [String],
        medicalDiagnoses: [String],
        scalpPhotos: String,

        // === Common Medical Fields (used in both skin and hair) ===
        currentlyUsingMedication: {
            type: String,
            enum: ["yes", "no"],
        },
        currentMedications: String,
        medicationAllergies: {
            type: String,
            enum: ["yes", "no"],
        },
        allergiesList: String,

        // === ID Upload (common to both) ===
        idPhoto: String,

        // === Final Step Checkboxes ===
        consent: { type: Boolean, default: false },
        terms: { type: Boolean, default: false },
        treatment: { type: Boolean, default: false },

        // === Treatment Type ===
        treatmentType: String, // 'Rx Skin', 'Finasteride', 'Minoxidil', 'Rx Hair'

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
    },
    { timestamps: true }
);

// Indexes for performance
skinhairQuestionnaireSchema.index({ authid: 1 });
skinhairQuestionnaireSchema.index({ status: 1 });
skinhairQuestionnaireSchema.index({ treatmentType: 1 });

const SkinHairQuestionnaire =
    mongoose.models.SkinHairQuestionnaire ||
    mongoose.model("SkinHairQuestionnaire", skinhairQuestionnaireSchema);

export default SkinHairQuestionnaire;

