import mongoose from 'mongoose';

const questionnaireSchema = new mongoose.Schema({
    // Authentication
    authid: {
        type: String,
        required: true,
        unique: true
    },

    // Age Verification
    isOver18: {
        type: String,
        enum: ['yes', 'no']
    },

    // Personal Information
    PlanPurchased: {
        type: String,
    },
    firstName: {
        type: String,
        required: [true, 'First name is required'],
        trim: true
    },
    lastName: {
        type: String,
        required: [true, 'Last name is required'],
        trim: true
    },
    dateOfBirth: {
        type: Date,
        required: [true, 'Date of birth is required']
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
    },

    // Address Information
    address: {
        type: String,
        required: [true, 'Address is required'],
        trim: true
    },
    address2: {
        type: String,
        trim: true
    },
    city: {
        type: String,
        required: [true, 'City is required'],
        trim: true
    },
    state: {
        type: String,
        required: [true, 'State is required'],
        trim: true
    },
    zip: {
        type: String,
        required: [true, 'ZIP code is required'],
        trim: true
    },
    country: {
        type: String,
        trim: true
    },

    // GLP-1 Information
    glp1Preference: {
        type: String,
        required: true,
        trim: true
    },
    sex: {
        type: String,
        required: true,
        trim: true
    },

    // Physical Information
    heightFeet: {
        type: String
    },
    heightInches: {
        type: String
    },
    currentWeight: {
        type: String
    },
    goalWeight: {
        type: String
    },
    bmi: {
        type: Number
    },
    goalBmi: {
        type: Number
    },

    glp1StartingWeight: {
        type: String
    },
    bloodPressure: {
        type: String
    },
    heartRate: {
        type: String
    },
    // Medical Information
    allergies: {
        type: String,
        trim: true
    },
    conditions: [{
        type: String,
        trim: true
    }],
    familyConditions: [{
        type: String,
        trim: true
    }],
    diagnoses: [{
        type: String,
        trim: true
    }],
    weightLossSurgery: [{
        type: String,
        trim: true
    }],
    weightRelatedConditions: [{
        type: String,
        trim: true
    }],
    medications: [{
        type: String,
        trim: true
    }],
    kidneyDisease: {
        type: String,
        trim: true
    },

    // History
    pastWeightLossMeds: [{
        type: String,
        trim: true
    }],
    diets: [{
        type: String,
        trim: true
    }],
    glp1PastYear: {
        type: String,
        trim: true
    },
    lastInjectionDate: {
        type: String,
        trim: true
    },
    otherConditions: {
        type: String,
        trim: true
    },
    currentMedications: {
        type: String,
        trim: true
    },
    surgeries: {
        type: String,
        trim: true
    },

    // Health Status
    pregnant: {
        type: String,
        trim: true
    },
    breastfeeding: {
        type: String,
        trim: true
    },
    healthcareProvider: {
        type: String,
        trim: true
    },
    eatingDisorders: {
        type: String,
        trim: true
    },
    labs: {
        type: String,
        trim: true
    },

    // GLP-1 Statement
    glp1Statement: {
        type: String,
        trim: true
    },
    glp1DoseInfo: {
        type: String,
        trim: true
    },
    agreeTerms: {
        type: Boolean,
        default: false
    },

    // File Uploads
    prescriptionPhoto: {
        type: String,
        required: false
    },
    idPhoto: String,

    // Additional Information / Marketing source
    heardAbout: {
        type: String,
        enum: ['Instagram', 'Facebook', 'TikTok', 'Other'],
        trim: true
    },
    heardAboutOther: {
        type: String,
        trim: true
    },

    // Additional Information
    comments: {
        type: String,
        trim: true
    },
    consent: {
        type: Boolean,
        default: false
    },

    // Lipotropic Fields
    lipotropicAllergies: [{
        type: String,
        trim: true
    }],
    lipotropicAllergiesDrop: {
        type: String,
        trim: true
    },
    lipotropicGoals: [{
        type: String,
        trim: true
    }],
    lipotropicHistory: {
        type: String,
        trim: true
    },
    lipotropicLastTreatment: {
        type: String,
        trim: true
    },
    lipotropicSatisfaction: {
        type: String,
        trim: true
    },
    lipotropicStopReason: {
        type: String,
        trim: true
    },
    averageMood: {
        type: String,
        trim: true
    },
    lipotropicDiagnoses: [{
        type: String,
        trim: true
    }],
    lipotropicMedicalConditions: {
        type: String,
        trim: true
    },
    lipotropicMedicalConditionsDrop: {
        type: String,
        trim: true
    },
    lipotropicMeds: {
        type: String,
        trim: true
    },
    lipotropicMedsDrop: {
        type: String,
        trim: true
    },
    lipotropicPregnant: {
        type: String,
        trim: true
    },
    providerQuestions: {
        type: String,
        trim: true
    },
    providerQuestionsDrop: {
        type: String,
        trim: true
    },
    lipotropicConsent: {
        type: Boolean,
        default: false
    },
    lipotropicTerms: {
        type: Boolean,
        default: false
    },
    lipotropicTreatment: {
        type: Boolean,
        default: false
    },
    lipotropicElectronic: {
        type: Boolean,
        default: false
    },
    terms: {
        type: Boolean,
        default: false
    },
    treatment: {
        type: Boolean,
        default: false
    },
    agreetopay: {
        type: Boolean,
        default: false
    },
    bmiConsent: {
        type: Boolean,
        default: false
    },
    // Form Status
    questionnaire: {
        type: Boolean,
        default: true
    },
    status: {
        type: String,
        default: 'draft',
        trim: true
    },

    // Timestamps
    createTimeDate: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    seen: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Add indexes for frequently queried fields
questionnaireSchema.index({ authid: 1 });
questionnaireSchema.index({ status: 1 });
questionnaireSchema.index({ createTimeDate: -1 });

// Add validation methods
questionnaireSchema.methods.validateAge = function () {
    const age = new Date().getFullYear() - this.dateOfBirth.getFullYear();
    return age >= 18;
};

// Add pre-save middleware
questionnaireSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});

const Questionnaire = mongoose.models.Questionnaire || mongoose.model('Questionnaire', questionnaireSchema);

export default Questionnaire;
