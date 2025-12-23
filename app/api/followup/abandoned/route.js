// app/api/followup/abandoned/route.js
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { RefillsAbandoned } from '@/lib/model/refillsaAbandoned';
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
        const {
            userSessionId,
            firstSegment,
            lastSegmentReached,
            state,
            timestamp,
            question,
        } = body;

        if (!userSessionId) {
            return NextResponse.json(
                { success: false, message: 'Missing userSessionId' },
                { status: 400 }
            );
        }

        // In app/api/followup/abandoned/route.js POST handler
        const updateFields = {
            firstSegment: {
                firstName: firstSegment?.firstName || "",
                lastName: firstSegment?.lastName || "",
                phone: firstSegment?.phone || "",
                email: firstSegment?.email || "",
            },
            lastSegmentReached: lastSegmentReached || 0,
            timestamp: timestamp ? new Date(timestamp) : new Date(),
            seen: true,
        };

        if (question !== undefined) updateFields.question = question;

        if (typeof state === 'number') updateFields.state = state;

        const result = await RefillsAbandoned.findOneAndUpdate(
            { userSessionId },
            { $set: updateFields },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        return NextResponse.json({ success: true, result });
    } catch (error) {
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}

export async function GET() {
    await connectDB();
    try {
        const all = await RefillsAbandoned.find().sort({ updatedAt: -1 });
        return NextResponse.json({ success: true, result: all });
    } catch (error) {
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}

export async function DELETE(request) {
    await connectDB();
    try {
        const { searchParams } = new URL(request.url);
        const userSessionId = searchParams.get('userSessionId');

        if (!userSessionId) {
            return NextResponse.json(
                { success: false, message: 'Missing userSessionId' },
                { status: 400 }
            );
        }

        const deleted = await RefillsAbandoned.findOneAndDelete({ userSessionId });

        if (!deleted) {
            return NextResponse.json(
                { success: false, message: 'No record found for given userSessionId' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Deleted successfully',
            result: deleted,
        });
    } catch (error) {
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}
