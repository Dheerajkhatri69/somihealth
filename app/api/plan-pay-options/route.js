import { NextResponse } from 'next/server';
import PlanPayOption from '@/lib/model/PlanPayOption';
import mongoose from "mongoose";
import { connectionSrt } from "@/lib/db";

async function connectDB() {
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(connectionSrt);
    }
}

// GET /api/plan-pay-options?name=Semaglutide (optional filter)
export async function GET(req) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        const name = searchParams.get('name');

        const filter = {};
        if (name) filter.name = name;

        const result = await PlanPayOption.find(filter).sort({ name: 1, sort: 1, createdAt: 1 }).lean();
        return NextResponse.json({ success: true, result });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ success: false, message: e.message || 'Failed to list' }, { status: 500 });
    }
}

// POST /api/plan-pay-options
// body: { name, sort, label, price, link, paypal, isActive }
export async function POST(req) {
    try {
        await connectDB();
        const body = await req.json();

        // minimal validation
        if (!body?.name || !['Semaglutide', 'Tirzepatide'].includes(body.name)) {
            return NextResponse.json({ success: false, message: 'Invalid or missing name' }, { status: 400 });
        }
        if (!body?.label || !body?.price) {
            return NextResponse.json({ success: false, message: 'label and price are required' }, { status: 400 });
        }

        const created = await PlanPayOption.create({
            name: body.name,
            sort: Number(body.sort ?? 0),
            label: String(body.label),
            price: String(body.price),
            link: String(body.link || ''),
            paypal: String(body.paypal || ''),
            isActive: body.isActive !== false,
        });

        return NextResponse.json({ success: true, result: created });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ success: false, message: e.message || 'Create failed' }, { status: 500 });
    }
}

// Optional: PATCH bulk reorder [{_id, sort}]
export async function PATCH(req) {
    try {
        await connectDB();
        const body = await req.json();
        const updates = Array.isArray(body?.updates) ? body.updates : [];
        const ops = updates.map(u => ({
            updateOne: {
                filter: { _id: u._id },
                update: { $set: { sort: Number(u.sort || 0) } },
            },
        }));
        if (!ops.length) return NextResponse.json({ success: true, result: [] });

        const r = await PlanPayOption.bulkWrite(ops);
        return NextResponse.json({ success: true, result: r });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ success: false, message: e.message || 'Bulk update failed' }, { status: 500 });
    }
}
