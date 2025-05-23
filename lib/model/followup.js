import mongoose from "mongoose";

const FollowUpSchema = new mongoose.Schema({
    Reasonclosetickets: String,
    address1: String,
    address2: String,
    anySideEffects: String,
    approvalStatus: String,
    authid: String,
    bmi: String,
    city: String,
    closetickets: Boolean,
    continueDosage: String,
    createTimeDate: Date,
    currentGlp1Medication: String,
    currentWeight: String,
    dob: Date,
    email: String,
    firstName: String,
    followUpRefills: Boolean,
    needLabafter3RxFills: Boolean,
    glp1: String,
    glp1ApprovalLast6Months: String,
    happyWithMedication: String,
    height: String,
    images: [String],
    increaseDosage: String,
    initialAuthId: String,
    lastName: String,
    listSideEffects: String,
    medicine: String,
    patientStatement: String,
    providerStatement: String,
    phone: String,
    semaglutideDose: String,
    semaglutideUnit: String,
    sex: String,
    state: String,
    switchMedication: String,
    tirzepatideDose: String,
    tirzepatideUnit: String,
    weight: String,
    zip: String,
    file1: String,
    file2: String,
    providerComments: String,
    providerNote: String
});

export const FollowUp = mongoose.models.FollowUp || mongoose.model("FollowUp", FollowUpSchema);