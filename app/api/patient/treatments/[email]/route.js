import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectionSrt } from "@/lib/db";
import { Patient } from "@/lib/model/patient";
import LongevityQuestionnaire from "@/lib/model/longevityQuestionnaire";
import EDQuestionnaire from "@/lib/model/edQuestionnaire";
import SkinHairQuestionnaire from "@/lib/model/skinhairQuestionnaire";
import { FollowUp } from "@/lib/model/followup";
import LongevityRefillQuestionnaire from "@/lib/model/longevityRefillQuestionnaire";
import EDRefillQuestionnaire from "@/lib/model/edRefillQuestionnaire";
import SkinHairRefillQuestionnaire from "@/lib/model/skinhairRefillQuestionnaire";

// GET: Fetch all treatments for a patient by email
export async function GET(request, { params }) {
    try {
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(connectionSrt);
        }

        const { email } = params;

        if (!email) {
            return NextResponse.json(
                { success: false, error: "Email parameter is required" },
                { status: 400 }
            );
        }

        const treatments = [];

        // Helper function to format refill reminder date
        const formatRefillDate = (refillReminder) => {
            if (!refillReminder) return null;
            try {
                // Format: "2025-08-30T00:27:44.386Z_14d"
                const datePart = refillReminder.split('_')[0];
                return new Date(datePart).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                });
            } catch (error) {
                return null;
            }
        };

        // 0. Patient Records (Weight Loss)
        const patientRecords = await Patient.find({
            email: email.toLowerCase().trim(),
            questionnaire: false
        }).select('medicine semaglutideDose semaglutideUnit tirzepatideDose tirzepatideUnit lipotropicDose lipotropicUnit approvalStatus refillReminder');

        patientRecords.forEach(record => {
            let treatment = record.medicine || 'Weight Loss';
            let dose = 'N/A';
            let unit = '';

            // Match treatment name to correct dose/unit fields
            if (treatment.toLowerCase().includes('semaglutide')) {
                dose = record.semaglutideDose || 'N/A';
                unit = record.semaglutideUnit || 'mg';
            } else if (treatment.toLowerCase().includes('tirzepatide')) {
                dose = record.tirzepatideDose || 'N/A';
                unit = record.tirzepatideUnit || 'mg';
            } else if (treatment.toLowerCase().includes('lipotropic')) {
                dose = record.lipotropicDose || 'N/A';
                unit = record.lipotropicUnit || 'ml';
            } else {
                // If medicine name doesn't match, check which dose is available
                if (record.semaglutideDose) {
                    dose = record.semaglutideDose;
                    unit = record.semaglutideUnit || 'mg';
                    treatment = 'Semaglutide';
                } else if (record.tirzepatideDose) {
                    dose = record.tirzepatideDose;
                    unit = record.tirzepatideUnit || 'mg';
                    treatment = 'Tirzepatide';
                } else if (record.lipotropicDose) {
                    dose = record.lipotropicDose;
                    unit = record.lipotropicUnit || 'ml';
                    treatment = 'Lipotropic MIC + B12';
                }
            }

            treatments.push({
                id: record._id.toString(),
                treatment: treatment,
                dose: dose,
                unit: unit,
                status: record.approvalStatus || 'None',
                refillDate: formatRefillDate(record.refillReminder),
                source: 'patient'
            });
        });

        // 1. Longevity Questionnaire
        const longevityRecords = await LongevityQuestionnaire.find({
            email: email.toLowerCase().trim(),
            questionnaire: false
        }).select('treatmentChoose dose unit approvalStatus refillReminder');

        longevityRecords.forEach(record => {
            treatments.push({
                id: record._id.toString(),
                treatment: record.treatmentChoose || 'Longevity Treatment',
                dose: record.dose || 'N/A',
                unit: record.unit || '',
                status: record.approvalStatus || 'None',
                refillDate: formatRefillDate(record.refillReminder),
                source: 'longevity'
            });
        });

        // 2. ED Questionnaire
        const edRecords = await EDQuestionnaire.find({
            email: email.toLowerCase().trim(),
            questionnaire: false
        }).select('currentMedication dose unit approvalStatus refillReminder');

        edRecords.forEach(record => {
            treatments.push({
                id: record._id.toString(),
                treatment: record.currentMedication || 'ED Treatment',
                dose: record.dose || 'N/A',
                unit: record.unit || '',
                status: record.approvalStatus || 'None',
                refillDate: formatRefillDate(record.refillReminder),
                source: 'ed'
            });
        });

        // 3. Skin & Hair Questionnaire
        const skinhairRecords = await SkinHairQuestionnaire.find({
            email: email.toLowerCase().trim(),
            questionnaire: false
        }).select('treatmentChoose treatmentType dose unit approvalStatus refillReminder');

        skinhairRecords.forEach(record => {
            const treatment = record.treatmentChoose || record.treatmentType || 'Skin & Hair Treatment';
            treatments.push({
                id: record._id.toString(),
                treatment: treatment,
                dose: record.dose || 'N/A',
                unit: record.unit || '',
                status: record.approvalStatus || 'None',
                refillDate: formatRefillDate(record.refillReminder),
                source: 'skinhair'
            });
        });

        // 4. Follow-Up Records (Weight Loss)
        const followUpRecords = await FollowUp.find({
            email: email.toLowerCase().trim(),
            followUpRefills: false // Indicates completed follow-up
        }).select('medicine glp1 semaglutideDose semaglutideUnit tirzepatideDose tirzepatideUnit lipotropicDose lipotropicUnit approvalStatus refillReminder');

        followUpRecords.forEach(record => {
            // Use medicine or glp1 field as treatment name
            let treatment = record.medicine || record.glp1 || 'Weight Loss';
            let dose = 'N/A';
            let unit = '';

            // Match treatment name to correct dose/unit fields
            if (treatment.toLowerCase().includes('semaglutide')) {
                dose = record.semaglutideDose || 'N/A';
                unit = record.semaglutideUnit || 'mg';
            } else if (treatment.toLowerCase().includes('tirzepatide')) {
                dose = record.tirzepatideDose || 'N/A';
                unit = record.tirzepatideUnit || 'mg';
            } else if (treatment.toLowerCase().includes('lipotropic')) {
                dose = record.lipotropicDose || 'N/A';
                unit = record.lipotropicUnit || 'ml';
            } else {
                // If medicine/glp1 name doesn't match, check which dose is available
                if (record.semaglutideDose) {
                    dose = record.semaglutideDose;
                    unit = record.semaglutideUnit || 'mg';
                    treatment = 'Semaglutide';
                } else if (record.tirzepatideDose) {
                    dose = record.tirzepatideDose;
                    unit = record.tirzepatideUnit || 'mg';
                    treatment = 'Tirzepatide';
                } else if (record.lipotropicDose) {
                    dose = record.lipotropicDose;
                    unit = record.lipotropicUnit || 'ml';
                    treatment = 'Lipotropic MIC + B12';
                }
            }

            treatments.push({
                id: record._id.toString(),
                treatment: treatment,
                dose: dose,
                unit: unit,
                status: record.approvalStatus || 'None',
                refillDate: formatRefillDate(record.refillReminder),
                source: 'followup'
            });
        });

        // 5. Longevity Refill Questionnaire
        const longevityRefills = await LongevityRefillQuestionnaire.find({
            email: email.toLowerCase().trim(),
            questionnaire: false
        }).select('preference dose unit approvalStatus refillReminder');

        longevityRefills.forEach(record => {
            treatments.push({
                id: record._id.toString(),
                treatment: record.preference || 'Longevity Refill',
                dose: record.dose || 'N/A',
                unit: record.unit || '',
                status: record.approvalStatus || 'None',
                refillDate: formatRefillDate(record.refillReminder),
                source: 'longevity-refill'
            });
        });

        // 6. ED Refill Questionnaire
        const edRefills = await EDRefillQuestionnaire.find({
            email: email.toLowerCase().trim(),
            questionnaire: false
        }).select('currentMedication currentDose dose unit approvalStatus refillReminder');

        edRefills.forEach(record => {
            treatments.push({
                id: record._id.toString(),
                treatment: record.currentMedication || 'ED Refill',
                dose: record.currentDose || record.dose || 'N/A',
                unit: record.unit || '',
                status: record.approvalStatus || 'None',
                refillDate: formatRefillDate(record.refillReminder),
                source: 'ed-refill'
            });
        });

        // 7. Skin & Hair Refill Questionnaire  
        const skinhairRefills = await SkinHairRefillQuestionnaire.find({
            email: email.toLowerCase().trim(),
            questionnaire: false
        }).select('treatmentChoose currentTreatment dose unit approvalStatus refillReminder');

        skinhairRefills.forEach(record => {
            treatments.push({
                id: record._id.toString(),
                treatment: record.treatmentChoose || record.currentTreatment || 'Skin & Hair Refill',
                dose: record.dose || 'N/A',
                unit: record.unit || '',
                status: record.approvalStatus || 'None',
                refillDate: formatRefillDate(record.refillReminder),
                source: 'skinhair-refill'
            });
        });

        return NextResponse.json({
            success: true,
            email: email,
            count: treatments.length,
            treatments: treatments
        });

    } catch (error) {
        console.error("Error fetching patient treatments:", error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

