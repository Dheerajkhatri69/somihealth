import { connectionSrt } from "@/lib/db";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

// Initialize mongoose connection
const connectDB = async () => {
    try {
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(connectionSrt);
        }
    } catch (error) {
        console.error('MongoDB connection error:', error);
        throw error;
    }
};

// GET: Fetch all questionnaires
export async function GET() {
    let data = [];
    let success = true;

    try {
        await connectDB();
        const Questionnaire = mongoose.models.Questionnaire || require('@/lib/model/questionnaire').default;
        data = await Questionnaire.find().sort({ createTimeDate: -1 });
    } catch (error) {
        data = { result: "error", message: error.message };
        success = false;
    }

    return NextResponse.json({ result: data, success });
}

// POST: Create new questionnaire
export async function POST(request) {
    let success = true;
    let result;

    try {
        await connectDB();
        const Questionnaire = mongoose.models.Questionnaire || require('@/lib/model/questionnaire').default;
        const body = await request.json();

        // Validate required fields
        if (!body.authid) {
            throw new Error("authid is required");
        }

        // Create new questionnaire with all form data
        const newQuestionnaire = new Questionnaire({
            authid: body.authid,
            isOver18: body.isOver18,
            firstName: body.firstName,
            lastName: body.lastName,
            dateOfBirth: body.dateOfBirth,
            phone: body.phone,
            email: body.email,
            address: body.address,
            address2: body.address2,
            city: body.city,
            state: body.state,
            zip: body.zip,
            country: body.country,
            glp1Preference: body.glp1Preference,
            sex: body.sex,
            heightFeet: body.heightFeet,
            heightInches: body.heightInches,
            currentWeight: body.currentWeight,
            goalWeight: body.goalWeight,
            bmi: body.bmi,
            allergies: body.allergies,
            conditions: body.conditions || [],
            familyConditions: body.familyConditions || [],
            diagnoses: body.diagnoses || [],
            weightLossSurgery: body.weightLossSurgery || [],
            weightRelatedConditions: body.weightRelatedConditions || [],
            medications: body.medications || [],
            kidneyDisease: body.kidneyDisease,
            pastWeightLossMeds: body.pastWeightLossMeds || [],
            diets: body.diets || [],
            glp1PastYear: body.glp1PastYear,
            otherConditions: body.otherConditions,
            currentMedications: body.currentMedications,
            surgeries: body.surgeries,
            pregnant: body.pregnant,
            breastfeeding: body.breastfeeding,
            healthcareProvider: body.healthcareProvider,
            eatingDisorders: body.eatingDisorders,
            labs: body.labs,
            glp1Statement: body.glp1Statement,
            agreeTerms: body.agreeTerms || false,
            prescriptionPhoto: body.prescriptionPhoto,
            idPhoto: body.idPhoto,
            comments: body.comments,
            consent: body.consent || false,
            questionnaire: true,
            status: body.status || 'draft',
            createTimeDate: new Date().toISOString()
        });

        result = await newQuestionnaire.save();
    } catch (error) {
        result = {
            result: "error",
            message: error.message.includes("duplicate key")
                ? "Questionnaire with this authid already exists"
                : error.message
        };
        success = false;
    }

    return NextResponse.json({ result, success });
}

// PUT: Update questionnaire by authid
export async function PUT(request) {
    let success = true;
    let result;

    try {
        await connectDB();
        const Questionnaire = mongoose.models.Questionnaire || require('@/lib/model/questionnaire').default;
        const body = await request.json();

        if (!body.authid) {
            throw new Error("authid is required for update");
        }

        const updatedQuestionnaire = await Questionnaire.findOneAndUpdate(
            { authid: body.authid },
            {
                $set: {
                    ...body,
                    updatedAt: new Date()
                }
            },
            { new: true }
        );

        if (!updatedQuestionnaire) {
            throw new Error("Questionnaire not found");
        }

        result = updatedQuestionnaire;
    } catch (error) {
        result = {
            result: "error",
            message: error.message
        };
        success = false;
    }

    return NextResponse.json({ result, success });
}

// DELETE: Permanently delete questionnaires by authid array
export async function DELETE(request) {
    let success = true;
    let result;

    try {
        await connectDB();
        const Questionnaire = mongoose.models.Questionnaire || require('@/lib/model/questionnaire').default;
        const body = await request.json();

        if (!body.authids || !Array.isArray(body.authids)) {
            throw new Error("authids (array) are required for deletion");
        }

        const deleteResult = await Questionnaire.deleteMany({
            authid: { $in: body.authids }
        });

        result = deleteResult;
    } catch (error) {
        result = {
            result: "error",
            message: error.message
        };
        success = false;
    }

    return NextResponse.json({ result, success });
}
