import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { EDAbandonment } from '@/lib/model/edAbandonment';
import { connectionSrt } from '@/lib/db';

async function connectDB() {
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(connectionSrt);
    }
}

export async function POST(request) {
    await connectDB();
    try {
        const body = await request.json();
        const { userSessionId, firstSegment, lastSegmentReached, state, timestamp, question } = body;

        if (!userSessionId) {
            return NextResponse.json({ success: false, message: "Missing userSessionId" }, { status: 400 });
        }

        const updateFields = {
            firstSegment,
            lastSegmentReached,
            question, // NEW FIELD
            timestamp: timestamp ? new Date(timestamp) : new Date(),
            seen: true,
        };

        if (typeof state === "number") updateFields.state = state;

        const result = await EDAbandonment.findOneAndUpdate(
            { userSessionId },
            { $set: updateFields },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        return NextResponse.json({ success: true, result });
    } catch (err) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}

export async function GET() {
    await connectDB();
    try {
        const result = await EDAbandonment.find().sort({ updatedAt: -1 });
        return NextResponse.json({ success: true, result });
    } catch (err) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}

export async function DELETE(request) {
    await connectDB();
    try {
        const { searchParams } = new URL(request.url);
        const userSessionId = searchParams.get('userSessionId');

        if (!userSessionId) {
            return NextResponse.json({ success: false, message: "Missing userSessionId" }, { status: 400 });
        }

        const deleted = await EDAbandonment.findOneAndDelete({ userSessionId });

        return NextResponse.json({ success: true, deleted });
    } catch (err) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}

