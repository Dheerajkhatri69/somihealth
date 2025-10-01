import { NextResponse } from "next/server";
import mongoose from "mongoose";
import MedicationPricing from "@/lib/model/medicationPricing";
import { connectionSrt } from "@/lib/db";

async function connectDB() {
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(connectionSrt);
    }
}

// GET /api/pricing — list products (sorted) and their options (sorted)
export async function GET() {
    try {
        await connectDB();
        const list = await MedicationPricing.find()
            .sort({ sortOrder: 1, product: 1 })
            .lean();

        list.forEach((p) => {
            p.options = (p.options || []).sort(
                (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
            );
        });

        return NextResponse.json({ success: true, result: list });
    } catch (e) {
        console.error("GET /api/pricing error", e);
        return NextResponse.json(
            { success: false, message: "Failed to fetch pricing" },
            { status: 500 }
        );
    }
}

// POST /api/pricing — create product
export async function POST(req) {
    try {
        await connectDB();
        const body = await req.json();

        const doc = new MedicationPricing({
            product: (body.product || "").toLowerCase().trim(),
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
        });

        await doc.save();

        const saved = doc.toObject();
        saved.options = (saved.options || []).sort(
            (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
        );

        return NextResponse.json({ success: true, result: saved });
    } catch (e) {
        if (e?.code === 11000) {
            return NextResponse.json(
                { success: false, message: "Product key already exists" },
                { status: 409 }
            );
        }
        console.error("POST /api/pricing error", e);
        return NextResponse.json(
            { success: false, message: "Failed to create product" },
            { status: 500 }
        );
    }
}
