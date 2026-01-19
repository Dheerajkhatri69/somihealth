import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { connectionSrt } from "@/lib/db";
import { UserCredential } from "@/lib/model/userCredential";

async function connectDB() {
    if (!connectionSrt) throw new Error("Database URL missing");

    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(connectionSrt);
    }
}

// GET ALL USER CREDENTIALS
export async function GET() {
    try {
        await connectDB();
        const data = await UserCredential.find().sort({ createdAt: -1 });
        return NextResponse.json({ success: true, result: data });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
