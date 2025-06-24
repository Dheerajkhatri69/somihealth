import { connectionSrt } from "@/lib/db";
import { Patient } from "@/lib/model/patient";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export async function POST(request) {
    let success = true;
    let result;

    try {
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(connectionSrt);
        }

        const { email, phone } = await request.json();

        if (!email && !phone) {
            throw new Error("Email or phone number is required");
        }

        // Check if either email or phone exists (OR condition)
        const orQuery = [];
        if (email) orQuery.push({ email });
        if (phone) orQuery.push({ phone });

        const existing = await Patient.findOne({ $or: orQuery }).select("email phone authid");

        if (existing) {
            result = { exists: true, patient: existing };
        } else {
            result = { exists: false };
        }
    } catch (error) {
        result = { result: "error", message: error.message };
        success = false;
    }

    return NextResponse.json({ result, success });
}
