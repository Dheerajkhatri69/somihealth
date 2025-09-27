import { NextResponse } from "next/server";
import mongoose from "mongoose";
import GHEntry from "@/lib/model/ghEntry";
import { connectionSrt } from "@/lib/db";

export const runtime = "nodejs";
export const revalidate = 0;

async function connectDB() {
    if (mongoose.connection.readyState === 0) await mongoose.connect(connectionSrt);
}

// GET /api/gh-entries  -> list all entries (slugs + titles for dashboard)
export async function GET() {
    try {
        await connectDB();
        const rows = await GHEntry.find({}, { slug: 1, "context.subHero.heading": 1, updatedAt: 1 })
            .sort({ updatedAt: -1 })
            .lean();
        return NextResponse.json({ success: true, result: rows });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ success: false, message: "Failed to list entries" }, { status: 500 });
    }
}

// POST /api/gh-entries  -> create new entry
export async function POST(req) {
    try {
        await connectDB();
        const body = await req.json();
        if (!body?.slug) return NextResponse.json({ success: false, message: "slug is required" }, { status: 400 });
        const created = await GHEntry.create(body);
        return NextResponse.json({ success: true, result: created });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ success: false, message: "Failed to create entry" }, { status: 500 });
    }
}
