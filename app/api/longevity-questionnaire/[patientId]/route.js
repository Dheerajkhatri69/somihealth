import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import LongevityQuestionnaire from "@/lib/model/longevityQuestionnaire";

export async function GET(req, { params }) {
    try {
        await connectMongoDB();
        const data = await LongevityQuestionnaire.findOne({ authid: params.patientId });

        if (!data) {
            return NextResponse.json(
                { success: false, message: "Questionnaire not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, result: data });
    } catch (error) {
        console.error("GET longevity questionnaire error:", error);
        return NextResponse.json(
            { success: false, message: "Server error" },
            { status: 500 }
        );
    }
}

export async function PUT(req, { params }) {
    try {
        const body = await req.json();
        await connectMongoDB();

        const updated = await LongevityQuestionnaire.findOneAndUpdate(
            { authid: params.patientId },
            { ...body, questionnaire: false },
            { new: true }
        );

        if (!updated) {
            return NextResponse.json(
                { success: false, message: "Questionnaire not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Questionnaire updated successfully",
            result: updated,
        });
    } catch (error) {
        console.error("PUT longevity questionnaire error:", error);
        return NextResponse.json(
            { success: false, message: "Server error" },
            { status: 500 }
        );
    }
}
// Add this DELETE handler to your /api/longevity-questionnaire/[patientId]/route.js

export async function DELETE(req, { params }) {
    try {
        await connectMongoDB();

        const deleted = await LongevityQuestionnaire.findOneAndDelete({
            authid: params.patientId
        });

        if (!deleted) {
            return NextResponse.json(
                { success: false, message: "Questionnaire not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Questionnaire deleted successfully"
        });
    } catch (error) {
        console.error("DELETE longevity questionnaire error:", error);
        return NextResponse.json(
            { success: false, message: "Server error" },
            { status: 500 }
        );
    }
}