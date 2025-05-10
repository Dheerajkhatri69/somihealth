import { connectionSrt } from "@/lib/db";
import { FollowUp } from "@/lib/model/followup";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

// GET single follow-up by authid
export async function GET(request, { params }) {
    try {
        await mongoose.connect(connectionSrt);
        const followUp = await FollowUp.findOne({ authid: params.authid });

        if (!followUp) {
            return NextResponse.json(
                { result: "Follow-up not found", success: false },
                { status: 404 }
            );
        }

        return NextResponse.json({ result: followUp, success: true });
    } catch (error) {
        return NextResponse.json(
            { result: "Error fetching follow-up", error: error.message, success: false },
            { status: 500 }
        );
    }
}

// Update follow-up by authid
export async function PUT(request, { params }) {
    try {
        await mongoose.connect(connectionSrt);
        const body = await request.json();

        const updatedFollowUp = await FollowUp.findOneAndUpdate(
            { authid: params.authid },
            { $set: body },
            { new: true }
        );

        if (!updatedFollowUp) {
            return NextResponse.json(
                { result: "Follow-up not found", success: false },
                { status: 404 }
            );
        }

        return NextResponse.json({ result: updatedFollowUp, success: true });
    } catch (error) {
        return NextResponse.json(
            { result: "Error updating follow-up", error: error.message, success: false },
            { status: 500 }
        );
    }
}