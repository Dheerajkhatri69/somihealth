import { NextResponse } from "next/server";
import mongoose from "mongoose";
import ContactForm from "@/lib/model/contactForm";
import { connectionSrt } from "@/lib/db";

async function connectDB() {
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(connectionSrt);
    }
}


export async function POST() {
    try {
        await connectDB();

        // mark ALL seen:true → false
        await ContactForm.updateMany(
            { seen: true },
            { $set: { seen: false } }
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error marking seen:", error);
        return NextResponse.json({ success: false }, { status: 500 });
    }
}
