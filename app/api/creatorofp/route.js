import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { Creatorofp } from '@/lib/model/creatorofp'; // adjust path based on your structure
import { connectionSrt } from '@/lib/db'; // your MongoDB connection string

// Connect to MongoDB
async function connectDB() {
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(connectionSrt);
    }
}

// GET: Get all creator-patient relationships
// export async function GET() {
//     await connectDB();
//     try {
//         const data = await Creatorofp.find();
//         return NextResponse.json({ result: data, success: true });
//     } catch (error) {
//         return NextResponse.json({ result: 'error', message: error.message, success: false });
//     }
// }

// pages/api/creatorofp.js
export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const pid = searchParams.get('pid');
    
    try {
        const query = pid ? { pid } : {};
        const data = await Creatorofp.find(query);
        return NextResponse.json({ success: true, result: data });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message });
    }
}
// POST: Create new creator-patient relationship
export async function POST(request) {
    await connectDB();
    try {
        const body = await request.json();
        
        // Validate required fields
        if (!body.tid || !body.tname || !body.pid) {
            return NextResponse.json({ 
                result: 'error', 
                message: 'tid, tname, and pid are required fields', 
                success: false 
            }, { status: 400 });
        }

        const newRelation = new Creatorofp(body);
        const saved = await newRelation.save();
        return NextResponse.json({ result: saved, success: true });
    } catch (error) {
        return NextResponse.json({ result: 'error', message: error.message, success: false });
    }
}

// PUT: Update an existing relationship (by pid)
export async function PUT(request) {
    await connectDB();
    try {
        const body = await request.json();
        const { tid, tname, pid } = body;
        
        if (!pid) {
            return NextResponse.json({ 
                result: 'error', 
                message: 'pid is required to update', 
                success: false 
            }, { status: 400 });
        }

        const updated = await Creatorofp.findOneAndUpdate(
            { pid }, 
            { tid, tname }, 
            { new: true, upsert: false } // Don't create new if not found
        );
        
        if (!updated) {
            return NextResponse.json({ 
                result: 'error', 
                message: 'Relationship not found', 
                success: false 
            }, { status: 404 });
        }
        
        return NextResponse.json({ result: updated, success: true });
    } catch (error) {
        return NextResponse.json({ 
            result: 'error', 
            message: error.message, 
            success: false 
        }, { status: 500 });
    }
}

// DELETE: Delete a relationship (by pid or tid)
export async function DELETE(request) {
    await connectDB();
    try {
        const { searchParams } = new URL(request.url);
        const pid = searchParams.get('pid');
        const tid = searchParams.get('tid');
        
        if (!pid && !tid) {
            return NextResponse.json({ 
                result: 'error', 
                message: 'Either pid or tid must be provided', 
                success: false 
            }, { status: 400 });
        }
        
        const query = pid ? { pid } : { tid };
        const deleted = await Creatorofp.findOneAndDelete(query);
        
        if (!deleted) {
            return NextResponse.json({ 
                result: 'error', 
                message: 'Relationship not found', 
                success: false 
            }, { status: 404 });
        }
        
        return NextResponse.json({ result: deleted, success: true });
    } catch (error) {
        return NextResponse.json({ 
            result: 'error', 
            message: error.message, 
            success: false 
        }, { status: 500 });
    }
}