import { NextResponse } from 'next/server';
import PlanPayOption from '@/lib/model/PlanPayOption';
import mongoose from "mongoose";
import { connectionSrt } from "@/lib/db";

async function connectDB() {
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(connectionSrt);
    }
}

export async function GET(_req, { params }) {
    try {
        await connectDB();
        const row = await PlanPayOption.findById(params.id).lean();
        if (!row) return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
        return NextResponse.json({ success: true, result: row });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ success: false, message: e.message || 'Load failed' }, { status: 500 });
    }
}

export async function PUT(req, { params }) {
    try {
        await connectDB();
        const body = await req.json();

        const update = {
            ...(body.name && { name: body.name }),
            ...(body.sort !== undefined && { sort: Number(body.sort) }),
            ...(body.label !== undefined && { label: String(body.label) }),
            ...(body.price !== undefined && { price: String(body.price) }),
            ...(body.link !== undefined && { link: String(body.link || '') }),
            ...(body.paypal !== undefined && { paypal: String(body.paypal || '') }),
            ...(body.isActive !== undefined && { isActive: !!body.isActive }),
        };

        const updated = await PlanPayOption.findByIdAndUpdate(params.id, { $set: update }, { new: true });
        if (!updated) return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });

        return NextResponse.json({ success: true, result: updated });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ success: false, message: e.message || 'Update failed' }, { status: 500 });
    }
}

export async function DELETE(_req, { params }) {
    try {
        await connectDB();
        const r = await PlanPayOption.findByIdAndDelete(params.id);
        if (!r) return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
        return NextResponse.json({ success: true, result: r._id });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ success: false, message: e.message || 'Delete failed' }, { status: 500 });
    }
}
