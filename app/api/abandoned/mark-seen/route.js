// app/api/abandoned/mark-seen/route.js
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { Abandoned } from '@/lib/model/abandoned';
import { connectionSrt } from '@/lib/db';

async function connectDB() {
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(connectionSrt);
    }
}

function parseStates(param) {
  // ✅ default now 0 and 1
  if (!param) return [0, 1];

  if (param.includes('-')) {
    const [a, b] = param.split('-').map(n => parseInt(n, 10));
    const lo = Math.min(a, b), hi = Math.max(a, b);
    return Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);
  }

  return param
    .split(',')
    .map(n => parseInt(n.trim(), 10))
    .filter(n => !Number.isNaN(n));
}


export async function POST(request) {
    await connectDB();
    try {
        const { searchParams } = new URL(request.url);
        const states = parseStates(searchParams.get('states'));  // default 1,2
        const seenParam = searchParams.get('seen');              // "true" | "false"
        const seen = seenParam === 'true';                       // default false if omitted
        const filter = { state: { $in: states } };

        const result = await Abandoned.updateMany(filter, { $set: { seen } });
        return NextResponse.json({
            success: true,
            matched: result.matchedCount ?? result.n,
            modified: result.modifiedCount ?? result.nModified,
            states, seen,
        });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
