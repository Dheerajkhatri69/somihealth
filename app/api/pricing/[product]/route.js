import { NextResponse } from "next/server";
import mongoose from "mongoose";
import MedicationPricing from "@/lib/model/medicationPricing";
import { connectionSrt } from "@/lib/db";

async function connectDB() {
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(connectionSrt);
    }
}

export async function GET(_req, { params }) {
    try {
        await connectDB();
        const product = params.product?.toLowerCase();
        const doc = await MedicationPricing.findOne({ product }).lean();
        if (!doc) {
            return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
        }
        doc.options = (doc.options || []).sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
        return NextResponse.json({ success: true, result: doc });
    } catch (e) {
        console.error(`GET /api/pricing/${params.product} error`, e);
        return NextResponse.json({ success: false, message: "Failed to fetch" }, { status: 500 });
    }
}

export async function PUT(req, { params }) {
    try {
        await connectDB();
        const product = params.product?.toLowerCase();
        const body = await req.json();

        const next = {
            name: body.name || "",
            image: body.image || "",
            isActive: typeof body.isActive === "boolean" ? body.isActive : true,
            sortOrder: Number(body.sortOrder) || 0,
            options: Array.isArray(body.options)
                ? body.options.map((o) => ({
                    label: (o.label || "").trim(),
                    price: Number(o.price) || 0,
                    link: o.link || "",
                    sortOrder: Number(o.sortOrder) || 0,
                }))
                : [],
        };

        const updated = await MedicationPricing.findOneAndUpdate(
            { product },
            { $set: next },
            { new: true, upsert: false }
        ).lean();

        if (!updated) {
            return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
        }

        updated.options = (updated.options || []).sort(
            (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
        );

        return NextResponse.json({ success: true, result: updated });
    } catch (e) {
        console.error(`PUT /api/pricing/${params.product} error`, e);
        return NextResponse.json({ success: false, message: "Failed to update" }, { status: 500 });
    }
}

export async function DELETE(_req, { params }) {
    try {
        await connectDB();
        const product = params.product?.toLowerCase();
        const out = await MedicationPricing.findOneAndDelete({ product }).lean();
        if (!out) {
            return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
        }
        return NextResponse.json({ success: true, result: out });
    } catch (e) {
        console.error(`DELETE /api/pricing/${params.product} error`, e);
        return NextResponse.json({ success: false, message: "Failed to delete" }, { status: 500 });
    }
}
