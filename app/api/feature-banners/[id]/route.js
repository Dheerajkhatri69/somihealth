import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectionSrt } from "@/lib/db";
import FeatureBannerItem from "@/lib/model/FeatureBannerItem";

async function connectDB() {
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(connectionSrt);
    }
}

export async function GET(_req, { params }) {
    try {
        await connectDB();
        const item = await FeatureBannerItem.findById(params.id).lean();
        if (!item) return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
        return NextResponse.json({ success: true, result: item });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ success: false, message: e.message }, { status: 500 });
    }
}

// PUT body: { label?, icon?, order?, active?, updatedBy? }
export async function PUT(req, { params }) {
    try {
        await connectDB();
        const body = await req.json();

        const update = {};
        ["label", "icon", "order", "active", "updatedBy"].forEach(k => {
            if (body[k] !== undefined) update[k] = body[k];
        });

        const updated = await FeatureBannerItem.findByIdAndUpdate(
            params.id, { $set: update }, { new: true }
        );
        if (!updated) return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });

        return NextResponse.json({ success: true, result: updated });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ success: false, message: e.message }, { status: 500 });
    }
}

export async function DELETE(_req, { params }) {
    try {
        await connectDB();
        await FeatureBannerItem.findByIdAndDelete(params.id);
        return NextResponse.json({ success: true });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ success: false, message: e.message }, { status: 500 });
    }
}
