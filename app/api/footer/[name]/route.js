import { NextResponse } from "next/server";
import mongoose from "mongoose";
import FooterPage from "@/lib/model/FooterPage";
import { footerPages } from "@/lib/footerContent";
import { connectionSrt } from "@/lib/db";

async function connectDB() {
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(connectionSrt);
    }
}

// Helper → Seed one page from footerContent.js
async function seedPage(name) {
    const source = footerPages.find(p => p.name === name);
    if (!source) return null;

    const created = new FooterPage({
        name: source.name,
        blocks: source.blocks,
        config: { isActive: true }
    });

    await created.save();
    return created;
}

// GET → Fetch + auto-create if not exist
export async function GET(req, { params }) {
    try {
        await connectDB();

        let page = await FooterPage.findOne({ name: params.name }).lean();

        if (!page) {
            page = await seedPage(params.name);
        }

        return NextResponse.json({ success: true, result: page });
    } catch (err) {
        console.log("Footer page GET error:", err);
        return NextResponse.json(
            { success: false, message: "Footer fetch error" },
            { status: 500 }
        );
    }
}

// PUT → Update
export async function PUT(req, { params }) {
    try {
        await connectDB();
        const body = await req.json();

        let page = await FooterPage.findOne({ name: params.name });

        if (!page) {
            page = await seedPage(params.name);
        }

        // Replace blocks entirely (you can customize)
        page.blocks = body.blocks || page.blocks;

        await page.save();

        return NextResponse.json({
            success: true,
            result: page,
            message: "Footer updated"
        });
    } catch (err) {
        console.log("Footer page PUT error:", err);
        return NextResponse.json(
            { success: false, message: "Footer update error" },
            { status: 500 }
        );
    }
}
