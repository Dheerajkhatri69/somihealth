import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectionSrt } from "@/lib/db";
import { FollowUp } from "@/lib/model/followup";

export async function GET(request, { params }) {
    try {
        const { initialAuthId } = params;
        
        if (!initialAuthId) {
            return NextResponse.json(
                { success: false, error: "Initial Auth ID is required" },
                { status: 400 }
            );
        }

        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(connectionSrt);
        }

        const count = await FollowUp.countDocuments({ initialAuthId });

        return NextResponse.json({
            success: true,
            count: count,
            initialAuthId: initialAuthId
        });

    } catch (error) {
        return NextResponse.json(
            { 
                success: false, 
                error: error.message,
                initialAuthId: params.initialAuthId 
            },
            { status: 500 }
        );
    }
}