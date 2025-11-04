// /app/api/plan-pay-options/[id]/route.js
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import PlanPayOption from '@/lib/model/PlanPayOption';
import PricingLanding from '@/lib/model/pricingLanding';
import PricingWeightLoss from '@/lib/model/pricingWeightLoss';
import { connectionSrt } from '@/lib/db';

export const runtime = 'nodejs'; // ensure Node runtime (Mongoose)

// ---------- db ----------
async function connectDB() {
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(connectionSrt);
    }
}

// ---------- helpers ----------
async function getPlanCategories() {
    // Pricing Landing
    const landingDoc = await PricingLanding
        .findOne({ 'config.isActive': true })
        .lean()
        .select({ options: 1 });

    const landing = (landingDoc?.options || []).map(o => ({
        idname: String(o.idname || '').toLowerCase().trim(),
        title: o.title || o.idname || '',
        image: o.image || '',
    }));

    // Pricing Weight Loss
    const weightLossDoc = await PricingWeightLoss
        .findOne({ 'config.isActive': true })
        .lean()
        .select({ options: 1 });

    const weightLoss = (weightLossDoc?.options || []).map(o => ({
        idname: String(o.idname || '').toLowerCase().trim(),
        title: o.title || o.idname || '',
        image: o.image || '',
    }));

    // de-dupe by idname
    const seen = new Set();
    const merged = [];
    for (const c of [...landing, ...weightLoss]) {
        const key = c.idname;
        if (!key || seen.has(key)) continue;
        seen.add(key);
        merged.push(c);
    }
    return merged;
}

// ---------- GET /api/plan-pay-options/[id] ----------
export async function GET(_req, { params }) {
    try {
        await connectDB();
        const row = await PlanPayOption.findById(params.id).lean();
        if (!row) {
            return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true, result: row });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ success: false, message: e.message || 'Load failed' }, { status: 500 });
    }
}

// ---------- PUT /api/plan-pay-options/[id] ----------
export async function PUT(req, { params }) {
    try {
        await connectDB();
        const body = await req.json();

        // guard: field removed from model
        if (body.dragoption !== undefined) {
            return NextResponse.json(
                { success: false, message: '`dragoption` has been removed from PlanPayOption.' },
                { status: 400 }
            );
        }

        const update = {
            ...(body.name && { name: String(body.name).trim().toLowerCase() }),
            ...(body.sort !== undefined && { sort: Number(body.sort) }),
            ...(body.label !== undefined && { label: String(body.label) }),
            ...(body.price !== undefined && { price: String(body.price) }),
            ...(body.link !== undefined && { link: String(body.link || '') }),
            ...(body.paypal !== undefined && { paypal: String(body.paypal || '') }),
            ...(body.isActive !== undefined && { isActive: !!body.isActive }),

            // remaining new field
            ...(body.weekdes !== undefined && { weekdes: String(body.weekdes || '') }),
        };

        // Validate name against categories if changing
        if (update.name) {
            const cats = await getPlanCategories();
            const allowed = new Set(cats.map(c => c.idname));
            if (!allowed.has(update.name)) {
                const availableCategories = Array.from(allowed).join(', ');
                return NextResponse.json(
                    { success: false, message: `Invalid name (idname). Available: ${availableCategories}` },
                    { status: 400 }
                );
            }
        }

        const updated = await PlanPayOption.findByIdAndUpdate(
            params.id,
            { $set: update },
            { new: true }
        );

        if (!updated) {
            return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true, result: updated });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ success: false, message: e.message || 'Update failed' }, { status: 500 });
    }
}

// ---------- DELETE /api/plan-pay-options/[id] ----------
export async function DELETE(_req, { params }) {
    try {
        await connectDB();
        const r = await PlanPayOption.findByIdAndDelete(params.id);
        if (!r) {
            return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true, result: r._id });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ success: false, message: e.message || 'Delete failed' }, { status: 500 });
    }
}
