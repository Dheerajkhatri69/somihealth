import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { EDAbandonment } from '@/lib/model/edAbandonment';
import { connectionSrt } from '@/lib/db';

async function connectDB() {
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(connectionSrt);
    }
}

function parseStates(param) {
    if (!param) return [0, 1];

    if (param.includes('-')) {
        const [a, b] = param.split('-').map(Number);
        return Array.from({ length: b - a + 1 }, (_, i) => a + i);
    }

    return param.split(',').map(n => Number(n.trim())).filter(n => !isNaN(n));
}

export async function POST(request) {
    await connectDB();
    try {
        const { searchParams } = new URL(request.url);
        const states = parseStates(searchParams.get("states"));
        const seenParam = searchParams.get("seen");
        const seen = seenParam === "true";

        const result = await EDAbandonment.updateMany(
            { state: { $in: states } },
            { $set: { seen } }
        );

        return NextResponse.json({
            success: true,
            matched: result.matchedCount ?? result.n,
            modified: result.modifiedCount ?? result.nModified,
            states,
            seen,
        });
    } catch (err) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}

