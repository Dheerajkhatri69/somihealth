import { connectionSrt } from "@/lib/db";
import { user } from "@/lib/model/users";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

// GET: Fetch all users
export async function GET() {
    let data = [];
    let success = true;

    try {
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(connectionSrt);
        }
        data = await user.find();
    } catch (error) {
        data = { result: "error", message: error.message };
        success = false;
    }

    return NextResponse.json({ result: data, success });
}

export async function POST(request) {
    let success = true;
    let result;

    try {
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(connectionSrt);
        }

        const body = await request.json();

        const newUser = new user({
            id: body.id,
            fullname: body.fullName,
            email: body.email,
            accounttype: body.accounttype, // 'T' or 'C'
            password: body.password
        });

        result = await newUser.save();
    } catch (error) {
        result = { result: "error", message: error.message };
        success = false;
    }

    return NextResponse.json({ result, success });
}

export async function PUT(request) {
    let success = true;
    let result;

    try {
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(connectionSrt);
        }

        const body = await request.json();
        const { _id, ...updateData } = body;

        result = await user.findByIdAndUpdate(_id, updateData, { new: true });
    } catch (error) {
        result = { result: "error", message: error.message };
        success = false;
    }

    return NextResponse.json({ result, success });
}

// DELETE: Delete user by _id
export async function DELETE(request) {
    let success = true;
    let result;

    try {
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(connectionSrt);
        }

        const body = await request.json();
        const { _id } = body;

        result = await user.findByIdAndDelete(_id);
    } catch (error) {
        result = { result: "error", message: error.message };
        success = false;
    }

    return NextResponse.json({ result, success });
}