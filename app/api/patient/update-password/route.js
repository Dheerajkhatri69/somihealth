import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectionSrt } from "@/lib/db";
import { UserCredential } from "@/lib/model/userCredential";
import { getServerSession } from "next-auth/next";

// Import auth options - adjust path if needed
async function getAuthOptions() {
    const { user } = await import("@/lib/model/users");
    const { UserCredential: UC } = await import("@/lib/model/userCredential");
    const CredentialsProvider = (await import("next-auth/providers/credentials")).default;

    return {
        providers: [
            CredentialsProvider({
                id: "admin-credentials",
                name: "Admin Credentials",
                credentials: {
                    id: { label: "ID", type: "text" },
                    password: { label: "Password", type: "password" },
                },
                async authorize(credentials) {
                    const { id, password } = credentials;
                    const cleanId = id.trim();
                    const cleanPassword = password.trim();

                    if (mongoose.connection.readyState === 0) {
                        await mongoose.connect(connectionSrt);
                    }

                    const foundUser = await user.findOne({ id: cleanId });

                    if (!foundUser) {
                        throw new Error("Invalid ID");
                    }

                    if (foundUser.password !== cleanPassword) {
                        throw new Error("Invalid password");
                    }

                    return {
                        _id: foundUser._id.toString(),
                        id: foundUser.id,
                        fullname: foundUser.fullname,
                        email: foundUser.email,
                        accounttype: foundUser.accounttype,
                        role: "admin",
                    };
                },
            }),
            CredentialsProvider({
                id: "patient-credentials",
                name: "Patient Credentials",
                credentials: {
                    email: { label: "Email", type: "email" },
                    password: { label: "Password", type: "password" },
                },
                async authorize(credentials) {
                    const { email, password } = credentials;
                    const cleanEmail = email.trim();
                    const cleanPassword = password.trim();

                    if (mongoose.connection.readyState === 0) {
                        await mongoose.connect(connectionSrt);
                    }

                    const foundPatient = await UC.findOne({ email: cleanEmail });

                    if (!foundPatient) {
                        throw new Error("Invalid email or password");
                    }

                    if (foundPatient.password !== cleanPassword) {
                        throw new Error("Invalid email or password");
                    }

                    return {
                        _id: foundPatient._id.toString(),
                        id: foundPatient.userId,
                        email: foundPatient.email,
                        accounttype: "P",
                        role: "patient",
                    };
                },
            }),
        ],
        session: {
            strategy: "jwt",
        },
        secret: process.env.NEXTAUTH_SECRET,
        pages: {
            signIn: "/",
        },
        callbacks: {
            async jwt({ token, user }) {
                if (user) {
                    token._id = user._id;
                    token.id = user.id;
                    token.email = user.email;
                    token.fullname = user.fullname;
                    token.accounttype = user.accounttype;
                    token.role = user.role;
                }
                return token;
            },
            async session({ session, token }) {
                session.user._id = token._id;
                session.user.id = token.id;
                session.user.email = token.email;
                session.user.fullname = token.fullname;
                session.user.accounttype = token.accounttype;
                session.user.role = token.role;
                return session;
            },
            async redirect({ url, baseUrl }) {
                if (url === baseUrl || url.startsWith(baseUrl)) {
                    return baseUrl;
                }
                return url;
            },
        },
    };
}

// PUT: Update password for logged-in patient
export async function PUT(request) {
    try {
        // Get session to verify user
        const authOptions = await getAuthOptions();
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "patient") {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(connectionSrt);
        }

        const body = await request.json();
        const { currentPassword, newPassword } = body;

        // Find the user credential
        const credential = await UserCredential.findOne({ email: session.user.email });

        if (!credential) {
            return NextResponse.json(
                { success: false, error: "User not found" },
                { status: 404 }
            );
        }

        // Verify current password
        if (credential.password !== currentPassword) {
            return NextResponse.json(
                { success: false, error: "Current password is incorrect" },
                { status: 400 }
            );
        }

        // Update password
        credential.password = newPassword;
        await credential.save();

        return NextResponse.json({
            success: true,
            message: "Password updated successfully",
        });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
