import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectionSrt } from "@/lib/db";
import ReviewHeader from "@/lib/model/ReviewHeader";

async function connectDB() {
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(connectionSrt);
    }
}

// GET /api/review-header?key=client-reviews-header
export async function GET(req) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        const key = searchParams.get("key") || "client-reviews-header";

        const doc = await ReviewHeader.findOne({ key }).lean();
        if (!doc) {
            // return default if not set yet
            return NextResponse.json({
                success: true,
                result: { key, text: "From stuck to thriving." },
            });
        }
        return NextResponse.json({ success: true, result: doc });
    } catch (e) {
        console.error(e);
        return NextResponse.json(
            { success: false, message: e.message || "Failed" },
            { status: 500 }
        );
    }
}

// PUT /api/review-header
// body: { key?: string, text: string, updatedBy?: string }
export async function PUT(req) {
    try {
        await connectDB();
        const body = await req.json();
        const key = body?.key || "client-reviews-header";
        const text = String(body?.text || "").trim();

        if (!text) {
            return NextResponse.json(
                { success: false, message: "text is required" },
                { status: 400 }
            );
        }

        const updated = await ReviewHeader.findOneAndUpdate(
            { key },
            { $set: { text, updatedBy: body?.updatedBy } },
            { new: true, upsert: true }
        );

        return NextResponse.json({ success: true, result: updated });
    } catch (e) {
        console.error(e);
        return NextResponse.json(
            { success: false, message: e.message || "Failed" },
            { status: 500 }
        );
    }
}
