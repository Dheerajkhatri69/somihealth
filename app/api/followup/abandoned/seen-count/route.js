// app/api/followup/abandoned/seen-count/route.js
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { RefillsAbandoned } from '@/lib/model/refillsaAbandoned';
import { connectionSrt } from '@/lib/db';

async function connectDB() {
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(connectionSrt);
    }
}

function parseStates(param) {
    if (!param) return [0, 1]; // default

    if (param.includes('-')) {
        const [a, b] = param.split('-').map(Number);
        const lo = Math.min(a, b), hi = Math.max(a, b);
        return Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);
    }

    return param.split(',').map(n => parseInt(n.trim(), 10));
}

export async function GET(request) {
    await connectDB();
    try {
        const { searchParams } = new URL(request.url);
        const states = parseStates(searchParams.get('states'));

        const count = await RefillsAbandoned.countDocuments({
            state: { $in: states },
            seen: true,
        });

        return NextResponse.json({ success: true, count, states });
    } catch (error) {
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}
