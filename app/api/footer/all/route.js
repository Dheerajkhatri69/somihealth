import FooterPage from "@/lib/model/FooterPage";
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectionSrt } from "@/lib/db";

async function connectDB() {
    if (mongoose.connection.readyState === 0)
        await mongoose.connect(connectionSrt);
}

export async function GET() {
    await connectDB();
    const pages = await FooterPage.find().lean();
    return NextResponse.json({ success: true, result: pages });
}
