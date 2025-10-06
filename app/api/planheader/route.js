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
    items: ['Speed', 'Stability', 'Style', 'Somi ❤️'],
    config: { isActive: true },
};

// GET: fetch active plan header (seed if missing)
export async function GET() {
    try {
        await connectDB();

        let doc = await PlanHeader.findOne({ 'config.isActive': true });
        // migrate old doc shape (if any): add items from old subtitle or defaults
        if (doc && (!Array.isArray(doc.items) || doc.items.length === 0)) {
            const maybeItems = [];
            // @ts-ignore: in case an old subtitle exists in DB
            if (doc.subtitle && typeof doc.subtitle === 'string' && doc.subtitle.trim()) {
                maybeItems.push(doc.subtitle.trim());
            }
            doc.items = maybeItems.length ? maybeItems : DEFAULTS.items;
            await doc.save();
        }

        if (!doc) {
            const seeded = new PlanHeader(DEFAULTS);
            doc = await seeded.save();
        }

        // return lean data
        return NextResponse.json({ success: true, result: doc.toObject() });
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
            const base = { ...DEFAULTS, ...body, config: { isActive: true } };
            // normalize items if body provided items as comma/lines
            if (typeof base.items === 'string') {
                base.items = base.items.split(/\r?\n|,/).map(s => s.trim()).filter(Boolean);
            }
            doc = new PlanHeader(base);
        } else {
            if (typeof body.title === 'string') doc.title = body.title;

            // accept array OR newline/comma string for items
            if (Array.isArray(body.items)) {
                doc.items = body.items;
            } else if (typeof body.items === 'string') {
                doc.items = body.items.split(/\r?\n|,/).map(s => s.trim()).filter(Boolean);
            }

            if (body.config) {
                doc.config = {
                    ...(doc.config?.toObject?.() ?? doc.config),
                    ...body.config,
                    isActive: true, // keep single active
                };
            } else {
                doc.config.isActive = true;
            }
        }

        await doc.save();
        return NextResponse.json({
            success: true,
            result: doc.toObject(),
            message: 'Plan header updated',
        });
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
