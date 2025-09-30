import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import PlanHeader from '@/lib/model/planHeader';
import { connectionSrt } from '@/lib/db';

async function connectDB() {
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(connectionSrt);
    }
}

const DEFAULTS = {
    title: 'Wellness Plan designed by clinicians to optimize your health.',
    subtitle:
        'Your journey deserves more than one-size-fits-all. Find the tailored medication plan built to support your goals.',
    config: { isActive: true },
};

// GET: fetch active plan header (seed if missing)
export async function GET() {
    try {
        await connectDB();

        let doc = await PlanHeader.findOne({ 'config.isActive': true }).lean();
        if (!doc) {
            const seeded = new PlanHeader(DEFAULTS);
            doc = await seeded.save();
        }

        return NextResponse.json({ success: true, result: doc });
    } catch (err) {
        console.error('GET /api/planheader error', err);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch plan header' },
            { status: 500 }
        );
    }
}

// PUT: upsert/merge active header
export async function PUT(req) {
    try {
        await connectDB();
        const body = await req.json();

        let doc = await PlanHeader.findOne({ 'config.isActive': true });
        if (!doc) {
            doc = new PlanHeader({ ...DEFAULTS, ...body, config: { isActive: true } });
        } else {
            if (typeof body.title === 'string') doc.title = body.title;
            if (typeof body.subtitle === 'string') doc.subtitle = body.subtitle;
            if (body.config) {
                doc.config = { ...doc.config.toObject?.() ?? doc.config, ...body.config, isActive: true };
            } else {
                // always keep active for the single source-of-truth document
                doc.config.isActive = true;
            }
        }

        await doc.save();
        return NextResponse.json({ success: true, result: doc, message: 'Plan header updated' });
    } catch (err) {
        if (err?.code === 11000) {
            return NextResponse.json(
                { success: false, message: 'Only one active plan header is allowed' },
                { status: 409 }
            );
        }
        console.error('PUT /api/planheader error', err);
        return NextResponse.json(
            { success: false, message: 'Failed to update plan header' },
            { status: 500 }
        );
    }
}
