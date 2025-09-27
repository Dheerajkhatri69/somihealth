import { NextResponse } from "next/server";
import mongoose from "mongoose";
import GHEntry from "@/lib/model/ghEntry";
import { connectionSrt } from "@/lib/db";

export const runtime = "nodejs";
export const revalidate = 0;

async function connectDB() {
    if (mongoose.connection.readyState === 0) await mongoose.connect(connectionSrt);
}

// GET /api/gh-entries/[slug]
export async function GET(_req, { params }) {
    try {
        await connectDB();
        const { slug } = params;
        const row = await GHEntry.findOne({ slug, "config.isActive": true }).lean();
        if (!row) return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
        return NextResponse.json({ success: true, result: row });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ success: false, message: "Failed to fetch" }, { status: 500 });
    }
}

// PUT /api/gh-entries/[slug]
export async function PUT(req, { params }) {
    try {
        await connectDB();
        const { slug } = params;
        const body = await req.json();

        const doc = await GHEntry.findOne({ slug });
        if (!doc) {
            const created = await GHEntry.create({ slug, ...body });
            return NextResponse.json({ success: true, result: created });
        }

        // shallow merge for context, replace arrays when passed
        if (body.context?.subHero) doc.context.subHero = { ...doc.context.subHero?.toObject?.() ?? doc.context.subHero, ...body.context.subHero };
        if (body.context?.steps) doc.context.steps = { ...doc.context.steps?.toObject?.() ?? doc.context.steps, ...body.context.steps };
        if (Array.isArray(body.context?.steps?.steps)) doc.context.steps.steps = body.context.steps.steps;

        if (body.context?.treatment) doc.context.treatment = { ...doc.context.treatment?.toObject?.() ?? doc.context.treatment, ...body.context.treatment };
        if (Array.isArray(body.context?.treatment?.items)) doc.context.treatment.items = body.context.treatment.items;

        if (Array.isArray(body.context?.sections)) doc.context.sections = body.context.sections;

        if (body.config) doc.config = { ...doc.config?.toObject?.() ?? doc.config, ...body.config };

        await doc.save();
        return NextResponse.json({ success: true, result: doc });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ success: false, message: "Failed to update" }, { status: 500 });
    }
}

// DELETE /api/gh-entries/[slug]
export async function DELETE(_req, { params }) {
    try {
        await connectDB();
        const { slug } = params;
        await GHEntry.deleteOne({ slug });
        return NextResponse.json({ success: true });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ success: false, message: "Failed to delete" }, { status: 500 });
    }
}
