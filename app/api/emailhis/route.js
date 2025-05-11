import { connectionSrt } from "@/lib/db";
import { Emailhis } from "@/lib/model/emailhis";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

// GET: Fetch all email history records
export async function GET() {
    let data = [];
    let success = true;

    try {
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(connectionSrt);
        }
        data = await Emailhis.find();
    } catch (error) {
        data = { result: "error", message: error.message };
        success = false;
    }

    return NextResponse.json({ result: data, success });
}

// POST: Create a new email history record
export async function POST(request) {
    let success = true;
    let result;

    try {
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(connectionSrt);
        }

        const body = await request.json();
        console.log("📥 Incoming POST data:", body); // ✅ add this line

        const newHistory = new Emailhis({
            pid: body.pid,
            pname: body.pname,
            cid: body.cid,
            cname: body.cname,
            email: body.email,
            date: body.date,
            message: body.message
        });

        result = await newHistory.save();
        console.log("✅ Saved to DB:", result); // ✅ add this line
    } catch (error) {
        console.error("❌ Error saving email history:", error); // ✅ add this
        result = { result: "error", message: error.message };
        success = false;
    }

    return NextResponse.json({ result, success });
}

// PUT: Update an email history record by _id
export async function PUT(request) {
    let success = true;
    let result;

    try {
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(connectionSrt);
        }

        const body = await request.json();
        const { _id, ...updateData } = body;

        result = await Emailhis.findByIdAndUpdate(_id, updateData, { new: true });
    } catch (error) {
        result = { result: "error", message: error.message };
        success = false;
    }

    return NextResponse.json({ result, success });
}

// DELETE: Delete a record by _id
export async function DELETE(request) {
    let success = true;
    let result;

    try {
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(connectionSrt);
        }

        const body = await request.json();
        const { _id } = body;

        result = await Emailhis.findByIdAndDelete(_id);
    } catch (error) {
        result = { result: "error", message: error.message };
        success = false;
    }

    return NextResponse.json({ result, success });
}
