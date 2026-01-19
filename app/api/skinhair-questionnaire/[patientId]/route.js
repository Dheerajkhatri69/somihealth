import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import SkinHairQuestionnaire from "@/lib/model/skinhairQuestionnaire";
import { ensureUserCredential } from "@/lib/userCredentialService";

export async function GET(req, { params }) {
    try {
        await connectMongoDB();
        const data = await SkinHairQuestionnaire.findOne({ authid: params.patientId });

        if (!data) {
            return NextResponse.json(
                { success: false, message: "Questionnaire not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, result: data });
    } catch (error) {
        console.error("GET skinhair questionnaire error:", error);
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

        // Create user credential if questionnaire is being set to false
        if (body.questionnaire === false && body.email) {
            await ensureUserCredential(body.email);
        }

        const updated = await SkinHairQuestionnaire.findOneAndUpdate(
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
        console.error("PUT skinhair questionnaire error:", error);
        return NextResponse.json(
            { success: false, message: "Server error" },
            { status: 500 }
        );
    }
}

export async function DELETE(req, { params }) {
    try {
        await connectMongoDB();

        const deleted = await SkinHairQuestionnaire.findOneAndDelete({
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
        console.error("DELETE skinhair questionnaire error:", error);
        return NextResponse.json(
            { success: false, message: "Server error" },
            { status: 500 }
        );
    }
}

