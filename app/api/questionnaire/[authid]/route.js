import { connectionSrt } from "@/lib/db";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

// Initialize Questionnaire model
let Questionnaire;
try {
    Questionnaire = mongoose.models.Questionnaire || require("@/lib/model/questionnaire").Questionnaire;
} catch (error) {
    console.error("Error loading Questionnaire model:", error);
}

// GET single questionnaire by authid
export async function GET(request, { params }) {
    try {
        await mongoose.connect(connectionSrt);
        
        if (!Questionnaire) {
            throw new Error("Questionnaire model not initialized");
        }

        const questionnaire = await Questionnaire.findOne({ authid: params.authid });

        if (!questionnaire) {
            return NextResponse.json(
                { result: "Questionnaire not found", success: false },
                { status: 404 }
            );
        }

        return NextResponse.json({ result: questionnaire, success: true });
    } catch (error) {
        console.error("GET Error:", error);
        return NextResponse.json(
            { result: "Error fetching questionnaire", error: error.message, success: false },
            { status: 500 }
        );
    }
}

// Update questionnaire by authid
export async function PUT(request, { params }) {
    try {
        await mongoose.connect(connectionSrt);
        
        if (!Questionnaire) {
            throw new Error("Questionnaire model not initialized");
        }

        const body = await request.json();

        const updatedQuestionnaire = await Questionnaire.findOneAndUpdate(
            { authid: params.authid },
            { $set: body },
            { new: true }
        );

        if (!updatedQuestionnaire) {
            return NextResponse.json(
                { result: "Questionnaire not found", success: false },
                { status: 404 }
            );
        }

        return NextResponse.json({ result: updatedQuestionnaire, success: true });
    } catch (error) {
        console.error("PUT Error:", error);
        return NextResponse.json(
            { result: "Error updating questionnaire", error: error.message, success: false },
            { status: 500 }
        );
    }
}
