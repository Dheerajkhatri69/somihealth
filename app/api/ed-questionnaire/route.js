import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { connectionSrt } from "@/lib/db";
import EDQuestionnaire from "@/lib/model/edQuestionnaire";

async function connectDB() {
    if (!connectionSrt) throw new Error("Database URL missing");

    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(connectionSrt);
    }
}

// GET ALL
export async function GET() {
    try {
        await connectDB();
        const data = await EDQuestionnaire.find().sort({ createdAt: -1 });
        return NextResponse.json({ success: true, result: data });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// CREATE NEW
export async function POST(request) {
    try {
        await connectDB();
        const body = await request.json();

        if (!body.authid) {
            return NextResponse.json(
                { success: false, error: "authid is required" },
                { status: 400 }
            );
        }

        const newDoc = new EDQuestionnaire(body);
        const saved = await newDoc.save();

        return NextResponse.json({ success: true, result: saved }, { status: 201 });
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                error: error.message.includes("duplicate key")
                    ? "authid already exists"
                    : error.message,
            },
            { status: 500 }
        );
    }
}

// DELETE SINGLE OR MULTIPLE
export async function DELETE(request) {
    try {
        await connectDB();
        const body = await request.json();
        const { authids } = body;

        if (!authids || !Array.isArray(authids) || authids.length === 0) {
            return NextResponse.json(
                { success: false, error: "authids array is required" },
                { status: 400 }
            );
        }

        // Delete the documents
        const result = await EDQuestionnaire.deleteMany({ authid: { $in: authids } });

        if (result.deletedCount === 0) {
            return NextResponse.json(
                { success: false, error: "No patients found to delete" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            result: { message: `${result.deletedCount} patient(s) deleted successfully` }
        });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

