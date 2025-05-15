import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { Followupcreatorofp } from '@/lib/model/followupcreatorofp';
import { connectionSrt } from '@/lib/db';

// Connect to MongoDB
async function connectDB() {
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(connectionSrt);
    }
}

// GET: Get all records
// export async function GET() {
//     await connectDB();
//     try {
//         const data = await Followupcreatorofp.find();
//         return NextResponse.json({ result: data, success: true });
//     } catch (error) {
//         return NextResponse.json({ result: 'error', message: error.message, success: false });
//     }
// }

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const pid = searchParams.get('pid');
    
    try {
        const query = pid ? { pid } : {};
        const data = await Followupcreatorofp.find(query);
        return NextResponse.json({ success: true, result: data });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message });
    }
}

// POST: Create new record
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

        const newRecord = new Followupcreatorofp(body);
        const saved = await newRecord.save();
        return NextResponse.json({ result: saved, success: true });
    } catch (error) {
        return NextResponse.json({ result: 'error', message: error.message, success: false });
    }
}

// PUT: Update an existing record (by pid)
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

        const updated = await Followupcreatorofp.findOneAndUpdate(
            { pid }, 
            { tid, tname }, 
            { new: true }
        );
        
        if (!updated) {
            return NextResponse.json({ 
                result: 'error', 
                message: 'Record not found', 
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

// DELETE: Delete a record (by pid or tid)
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
        const deleted = await Followupcreatorofp.findOneAndDelete(query);
        
        if (!deleted) {
            return NextResponse.json({ 
                result: 'error', 
                message: 'Record not found', 
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