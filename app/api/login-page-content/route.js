// app/api/login-page-content/route.js
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import LoginPageContent from "@/lib/model/loginPageContent";
import { connectionSrt } from "@/lib/db";

async function connectDB() {
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(connectionSrt);
    }
}

// GET – fetch active login page content (or create default)
export async function GET() {
    try {
        await connectDB();

        let content = await LoginPageContent.findOne({
            "config.isActive": true,
        }).lean();

        if (!content) {
            content = new LoginPageContent({});
            await content.save();
            content = content.toObject();
        }

        return NextResponse.json({
            success: true,
            result: content,
        });
    } catch (error) {
        console.error("Error fetching login page content:", error);
        return NextResponse.json(
            { success: false, message: "Failed to fetch login page content" },
            { status: 500 }
        );
    }
}

// PUT – update login page content
export async function PUT(request) {
    try {
        await connectDB();

        const body = await request.json();

        let content = await LoginPageContent.findOne({
            "config.isActive": true,
        });

        if (content) {
            // shallow merge per top-level key (same style as your contact API)
            Object.keys(body).forEach((key) => {
                if (
                    typeof body[key] === "object" &&
                    body[key] !== null &&
                    !Array.isArray(body[key])
                ) {
                    content[key] = { ...content[key]?.toObject?.() ?? content[key], ...body[key] };
                } else {
                    content[key] = body[key];
                }
            });

            if (!content.config) content.config = {};
            content.config.isActive = true;

            await content.save();
        } else {
            content = new LoginPageContent({
                ...body,
                config: {
                    ...(body.config || {}),
                    isActive: true,
                },
            });
            await content.save();
        }

        return NextResponse.json({
            success: true,
            result: content,
            message: "Login page content updated successfully",
        });
    } catch (error) {
        console.error("Error updating login page content:", error);
        return NextResponse.json(
            { success: false, message: "Failed to update login page content" },
            { status: 500 }
        );
    }
}
