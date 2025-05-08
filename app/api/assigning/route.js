import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
// import { Assigning } from '@/models/Assigning'; // adjust path based on your structure
import { connectionSrt } from '@/lib/db'; // your MongoDB connection string
import { Assigning } from '@/lib/model/assigning';

// Connect to MongoDB
async function connectDB() {
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(connectionSrt);
    }
}

// GET: Get all assignments
export async function GET() {
    await connectDB();
    try {
        const data = await Assigning.find();
        return NextResponse.json({ result: data, success: true });
    } catch (error) {
        return NextResponse.json({ result: 'error', message: error.message, success: false });
    }
}

// POST: Create new assignment
export async function POST(request) {
    await connectDB();
    try {
        const body = await request.json();
        const newAssign = new Assigning(body);
        const saved = await newAssign.save();
        return NextResponse.json({ result: saved, success: true });
    } catch (error) {
        return NextResponse.json({ result: 'error', message: error.message, success: false });
    }
}

// PUT: Update an existing assignment (by pid)
export async function PUT(request) {
    await connectDB();
    try {
        const body = await request.json();
        const { cid, pid } = body;
        
        // Find and update by pid
        const updated = await Assigning.findOneAndUpdate(
            { pid }, 
            { cid }, 
            { new: true }
        );
        
        if (!updated) {
            return NextResponse.json({ 
                result: 'error', 
                message: 'Assignment not found', 
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

// DELETE: Delete an assignment (by pid)
export async function DELETE(request) {
    await connectDB();
    try {
        const { searchParams } = new URL(request.url);
        const pid = searchParams.get('pid');
        
        if (!pid) {
            return NextResponse.json({ 
                result: 'error', 
                message: 'Patient ID (pid) is required', 
                success: false 
            }, { status: 400 });
        }
        
        const deleted = await Assigning.findOneAndDelete({ pid });
        
        if (!deleted) {
            return NextResponse.json({ 
                result: 'error', 
                message: 'Assignment not found', 
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