import mongoose from "mongoose";

const longevityQuestionnaireSchema = new mongoose.Schema(
    {
        // ==== Primary Auth ID ====
        authid: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },

        // === Treatment Section ===
        treatmentChoose: String,
        treatmentGoal: [String], // Array to support multiple selections

        previousTreatment: String, // yes/no
        negativeReactions: String, // yes/no
        lastSatisfiedStop: String,

        clinicianToKnowAboutYourHealth: String, // yes/no
        disclinicianToKnowAboutYourHealth: String,

        cardiovascularHealth: String, // 1–5

        heightFeet: String,
        heightInches: String,
        currentWeight: String,
        bmi: Number,

        strength: String, // 1–5

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

        // === Sex ===
        sex: String,

        // === Allergies ===
        allergies: String, // yes/no
        desAllergies: String,

        // === Diagnoses ===
        diagnoses: [String],

        diagnosed: String, // yes/no
        desDiagnosed: String,

        // === Medications ===
        currentlyTakingAnyMedications: String, // yes/no
        desCurrentlyTakingAnyMedications: String,

        // === Surgeries ===
        surgeriesOrHospitalization: String, // yes/no
        desSurgeriesOrHospitalization: String,

        // === Pregnancy ===
        pregnantOrBreastfeeding: String, // yes/no

        // === Healthcare Provider ===
        healthcareProvider: String, // yes/no

        // === ID UPLOAD ===
        idPhoto: String,

        // === Heard About ===
        heardAbout: {
            type: String,
            enum: ["Instagram", "Facebook", "TikTok", "Other"],
        },
        heardAboutOther: String,

        // === Final Step Checkboxes ===
        consent: { type: Boolean, default: false },
        terms: { type: Boolean, default: false },
        treatment: { type: Boolean, default: false },

        // === System Fields ===
        questionnaire: { type: Boolean, default: true },
        status: { type: String, default: "submitted" },
        seen: { type: Boolean, default: false },
        //new field
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
longevityQuestionnaireSchema.index({ authid: 1 });
longevityQuestionnaireSchema.index({ status: 1 });

const LongevityQuestionnaire =
    mongoose.models.LongevityQuestionnaire ||
    mongoose.model("LongevityQuestionnaire", longevityQuestionnaireSchema);

export default LongevityQuestionnaire;
