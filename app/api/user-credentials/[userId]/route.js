import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { connectionSrt } from "@/lib/db";
import { UserCredential } from "@/lib/model/userCredential";

async function connectDB() {
    if (!connectionSrt) throw new Error("Database URL missing");

    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(connectionSrt);
    }
}

// GET: Get single user credential by userId
export async function GET(req, { params }) {
    try {
        await connectDB();
        const credential = await UserCredential.findOne({ userId: params.userId });

        if (!credential) {
            return NextResponse.json(
                { success: false, error: "Credential not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, result: credential });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// PUT: Update user credential
export async function PUT(req, { params }) {
    try {
        await connectDB();
        const body = await req.json();

        const updated = await UserCredential.findOneAndUpdate(
            { userId: params.userId },
            {
                email: body.email,
                password: body.password,
            },
            { new: true }
        );

        if (!updated) {
            return NextResponse.json(
                { success: false, error: "Credential not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Credential updated successfully",
            result: updated
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// DELETE: Delete user credential
export async function DELETE(req, { params }) {
    try {
        await connectDB();

        const deleted = await UserCredential.findOneAndDelete({ userId: params.userId });

        if (!deleted) {
            return NextResponse.json(
                { success: false, error: "Credential not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Credential deleted successfully"
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
