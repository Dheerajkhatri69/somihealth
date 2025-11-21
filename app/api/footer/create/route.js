import FooterPage from "@/lib/model/FooterPage";
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectionSrt } from "@/lib/db";

async function connectDB() {
    if (mongoose.connection.readyState === 0)
        await mongoose.connect(connectionSrt);
}

export async function POST(req) {
    await connectDB();
    const body = await req.json();

    const page = new FooterPage({
        name: body.name,
        blocks: [],
        config: { isActive: true },
    });

    await page.save();

    return NextResponse.json({
        success: true,
        result: page,
    });
}
