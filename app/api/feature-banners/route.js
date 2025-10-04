import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectionSrt } from "@/lib/db";
import FeatureBannerItem from "@/lib/model/FeatureBannerItem";

async function connectDB() {
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(connectionSrt);
    }
}

// GET /api/feature-banners?key=global
export async function GET(req) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        const key = searchParams.get("key") || "global";

        const items = await FeatureBannerItem
            .find({ key, active: true })
            .sort({ order: 1, _id: 1 })
            .lean();

        // sensible defaults if empty
        const defaults = [
            { label: "Unlimited doctor support", icon: "Stethoscope" },
            { label: "Fast online approval", icon: "Globe" },
            { label: "Free expedited shipping", icon: "Package" },
            { label: "No hidden fees", icon: "Tag" },
        ].map((x, i) => ({ ...x, key, order: i, active: true }));

        return NextResponse.json({
            success: true,
            result: items?.length ? items : defaults,
            fromDB: !!items?.length,
        });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ success: false, message: e.message }, { status: 500 });
    }
}

// POST /api/feature-banners  body: { key?, label, icon, order?, active?, updatedBy? }
export async function POST(req) {
    try {
        await connectDB();
        const body = await req.json();
        const key = body?.key || "global";
        const label = String(body?.label || "").trim();
        const icon = String(body?.icon || "").trim();

        if (!label) return NextResponse.json({ success: false, message: "label is required" }, { status: 400 });
        if (!icon) return NextResponse.json({ success: false, message: "icon is required" }, { status: 400 });

        // if order not provided, append to end
        let order = typeof body?.order === "number" ? body.order : null;
        if (order === null) {
            const last = await FeatureBannerItem.findOne({ key }).sort({ order: -1 }).lean();
            order = last ? (Number(last.order) + 1) : 0;
        }

        const created = await FeatureBannerItem.create({
            key, label, icon, order,
            active: body?.active ?? true,
            updatedBy: body?.updatedBy
        });

        return NextResponse.json({ success: true, result: created });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ success: false, message: e.message }, { status: 500 });
    }
}

// PATCH /api/feature-banners  body: { key, orders: [{_id, order}] }  // bulk reorder
export async function PATCH(req) {
    try {
        await connectDB();
        const body = await req.json();
        const key = body?.key || "global";
        const orders = Array.isArray(body?.orders) ? body.orders : [];

        const bulk = orders.map(o => ({
            updateOne: {
                filter: { _id: o._id, key },
                update: { $set: { order: Number(o.order) } }
            }
        }));
        if (bulk.length) await FeatureBannerItem.bulkWrite(bulk);

        return NextResponse.json({ success: true });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ success: false, message: e.message }, { status: 500 });
    }
}
