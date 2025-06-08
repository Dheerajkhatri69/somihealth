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
        required: true,
        enum: ['yes', 'no']
    },

    // Personal Information
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
        type: String,
        required: true
    },
    heightInches: {
        type: String,
        required: true
    },
    currentWeight: {
        type: String,
        required: true
    },
    goalWeight: {
        type: String,
        required: true
    },
    bmi: {
        type: Number,
        required: true
    },

    // Medical Information
    allergies: {
        type: String,
        required: true,
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
        required: true,
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
        required: true,
        trim: true
    },
    otherConditions: {
        type: String,
        required: true,
        trim: true
    },
    currentMedications: {
        type: String,
        required: true,
        trim: true
    },
    surgeries: {
        type: String,
        required: true,
        trim: true
    },

    // Health Status
    pregnant: {
        type: String,
        required: true,
        trim: true
    },
    breastfeeding: {
        type: String,
        required: true,
        trim: true
    },
    healthcareProvider: {
        type: String,
        required: true,
        trim: true
    },
    eatingDisorders: {
        type: String,
        required: true,
        trim: true
    },
    labs: {
        type: String,
        required: true,
        trim: true
    },

    // GLP-1 Statement
    glp1Statement: {
        type: String,
        required: true,
        trim: true
    },
    glp1DoseInfo: {
        type: String,
        trim: true
    },
    agreeTerms: {
        type: Boolean,
        required: true,
        default: false
    },

    // File Uploads
    prescriptionPhoto: {
        type: String,
        required: false
    },
    idPhoto: String,
    // Additional Information
    comments: {
        type: String,
        trim: true
    },
    consent: {
        type: Boolean,
        required: true,
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
