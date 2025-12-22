import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectionSrt } from "@/lib/db";
import LongevityQuestionnaire from "@/lib/model/longevityQuestionnaire";

async function connectDB() {
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(connectionSrt);
    }
}

export async function GET() {
    try {
        await connectDB();
        const count = await LongevityQuestionnaire.countDocuments({ seen: false });

        return NextResponse.json({ success: true, count });
    } catch (error) {
        console.error("Error fetching unseen count:", error);
        return NextResponse.json(
            {
                success: false,
                message: "An error occurred while fetching unseen questionnaire count.",
            },
            { status: 500 }
        );
    }
}
