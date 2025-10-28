// /app/api/plan-categories/route.js
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import PricingLanding from '@/lib/model/pricingLanding';
import PricingWeightLoss from '@/lib/model/pricingWeightLoss'; // Import Weight Loss schema
import { connectionSrt } from '@/lib/db';

async function connectDB() {
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(connectionSrt);
    }
}

function dedupeByIdName(arr) {
    const seen = new Set();
    const out = [];
    for (const x of arr) {
        const key = String(x.idname || '').toLowerCase();
        if (!key) continue;
        if (!seen.has(key)) {
            seen.add(key);
            out.push({ idname: key, title: x.title || key, image: x.image || '' });
        }
    }
    return out;
}

export async function GET() {
    try {
        await connectDB();

        // Pull from PricingLanding.options (if present)
        const landingDoc = await PricingLanding.findOne({ 'config.isActive': true })
            .lean()
            .select({ options: 1 });

        const landingCats = (landingDoc?.options || []).map(o => ({
            idname: String(o.idname || '').toLowerCase(),
            title: o.title || o.idname || '',
            image: o.image || '',
        }));

        // Pull from PricingWeightLoss.options (Weight Loss schema)
        const weightLossDoc = await PricingWeightLoss.findOne({ 'config.isActive': true })
            .lean()
            .select({ options: 1 });

        const weightLossCats = (weightLossDoc?.options || []).map(o => ({
            idname: String(o.idname || '').toLowerCase(),
            title: o.title || o.idname || '',
            image: o.image || '',
        }));

        // Merge landing options + weight loss options, then dedupe by idname
        const merged = dedupeByIdName([...landingCats, ...weightLossCats]);

        // Optional: if you want to hide weightloss in the dashboard, filter here:
        // const filtered = merged.filter(c => c.idname !== 'weightloss');

        return NextResponse.json({ success: true, result: merged });
    } catch (err) {
        console.error('GET /plan-categories error:', err);
        return NextResponse.json(
            { success: false, message: 'Failed to load categories' },
            { status: 500 }
        );
    }
}