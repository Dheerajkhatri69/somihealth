// /app/api/plan-pay-options/route.js
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import PlanPayOption from '@/lib/model/PlanPayOption';
import PricingLanding from '@/lib/model/pricingLanding';
import PricingWeightLoss from '@/lib/model/pricingWeightLoss'; // Add this import
import { connectionSrt } from '@/lib/db';

export const runtime = 'nodejs'; // ensure Node runtime (Mongoose)

// ---------- helpers ----------
function escapeRegExp(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

async function connectDB() {
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(connectionSrt);
    }
}

// Merge GLP-1 categories with PricingLanding.options AND PricingWeightLoss.options
async function getPlanCategories() {
    // Get Pricing Landing options
    const landingDoc = await PricingLanding
        .findOne({ 'config.isActive': true })
        .lean()
        .select({ options: 1 });

    const landing = (landingDoc?.options || []).map(o => ({
        idname: String(o.idname || '').toLowerCase().trim(),
        title: o.title || o.idname || '',
        image: o.image || '',
    }));

    // Get Weight Loss options
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

// ---------- GET /api/plan-pay-options?name=<idname or legacy label> ----------
export async function GET(req) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        const rawName = (searchParams.get('name') || '').trim();

        let filter = {};
        if (rawName) {
            const nameId = rawName.toLowerCase();
            const legacyCap =
                nameId === 'semaglutide' ? 'Semaglutide' :
                    nameId === 'tirzepatide' ? 'Tirzepatide' :
                        null;

            filter = {
                $or: [
                    { name: nameId },
                    ...(legacyCap ? [{ name: legacyCap }] : []),
                    { name: { $regex: new RegExp(`^${escapeRegExp(rawName)}$`, 'i') } },
                    { name: { $regex: new RegExp(`^\\s*${escapeRegExp(nameId)}\\s*$`, 'i') } },
                ],
            };
        }

        const result = await PlanPayOption
            .find(filter)
            .sort({ name: 1, sort: 1, createdAt: 1 })
            .lean();

        return NextResponse.json({ success: true, result });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ success: false, message: e.message || 'Failed to list' }, { status: 500 });
    }
}

// ---------- POST /api/plan-pay-options ----------
export async function POST(req) {
    try {
        await connectDB();
        const body = await req.json();

        const categories = await getPlanCategories();
        const allowed = new Set(categories.map(c => c.idname));

        const raw = String(body?.name || '').trim();
        const nameId = raw.toLowerCase();

        if (!raw || !allowed.has(nameId)) {
            const availableCategories = Array.from(allowed).join(', ');
            return NextResponse.json(
                {
                    success: false,
                    message: `Invalid or missing name (idname). Use one from /api/plan-categories. Available: ${availableCategories}`
                },
                { status: 400 }
            );
        }
        if (!body?.label || !body?.price) {
            return NextResponse.json(
                { success: false, message: 'label and price are required' },
                { status: 400 }
            );
        }

        const created = await PlanPayOption.create({
            name: nameId,
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

// ---------- PATCH /api/plan-pay-options  (bulk reorder) ----------
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