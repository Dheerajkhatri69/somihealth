import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { Abandoned } from '@/lib/model/abandoned';
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
        } = body;

        if (!userSessionId) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Missing userSessionId',
                },
                { status: 400 }
            );
        }

        // Build the update object dynamically
        const updateFields = {
            firstSegment,
            lastSegmentReached,
            timestamp: timestamp ? new Date(timestamp) : new Date(),
        };

        if (typeof state === 'number') {
            updateFields.state = state;
        }

        const result = await Abandoned.findOneAndUpdate(
            { userSessionId },
            { $set: updateFields },
            { new: true, upsert: true }
        );

        return NextResponse.json({ success: true, result });
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                message: error.message,
            },
            { status: 500 }
        );
    }
}

// GET: Fetch all abandoned sessions (optional)
export async function GET() {
    await connectDB();
    try {
        const all = await Abandoned.find().sort({ updatedAt: -1 });
        return NextResponse.json({ success: true, result: all });
    } catch (error) {
        return NextResponse.json({
            success: false,
            message: error.message,
        }, { status: 500 });
    }
}
// DELETE: Remove a session by userSessionId
export async function DELETE(request) {
    await connectDB();
    try {
        const { searchParams } = new URL(request.url);
        const userSessionId = searchParams.get("userSessionId");

        if (!userSessionId) {
            return NextResponse.json({
                success: false,
                message: "Missing userSessionId",
            }, { status: 400 });
        }

        const deleted = await Abandoned.findOneAndDelete({ userSessionId });

        if (!deleted) {
            return NextResponse.json({
                success: false,
                message: "No record found for given userSessionId",
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: "Deleted successfully",
            result: deleted,
        });
    } catch (error) {
        return NextResponse.json({
            success: false,
            message: error.message,
        }, { status: 500 });
    }
}
