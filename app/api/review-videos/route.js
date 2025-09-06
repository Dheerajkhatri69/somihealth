import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import ReviewVideo from '@/lib/model/reviewVideo';
import { connectionSrt } from '@/lib/db';

// Connect to MongoDB
async function connectDB() {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(connectionSrt);
  }
}

// GET: Fetch review videos
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // If id is provided, return a single video
    if (id) {
      const video = await ReviewVideo.findById(id).lean();
      if (!video) {
        return NextResponse.json({ success: false, message: 'Video not found' }, { status: 404 });
      }
      return NextResponse.json({ result: video, success: true });
    }

    // Return all active videos sorted by sortOrder
    const videos = await ReviewVideo.find({ isActive: true })
      .sort({ sortOrder: 1, createdAt: -1 })
      .lean();

    return NextResponse.json({ 
      result: videos, 
      success: true 
    });
  } catch (error) {
    console.error('GET Review Videos Error:', error);
    return NextResponse.json({ 
      result: 'error', 
      message: error.message, 
      success: false 
    }, { status: 500 });
  }
}

// POST: Create new review video
export async function POST(request) {
  try {
    await connectDB();
    
    const body = await request.json();
    
    // Validate required fields
    if (!body.title || !body.subtitle || !body.description || !body.poster || !body.srcMp4) {
      return NextResponse.json({ 
        success: false, 
        message: 'Title, subtitle, description, poster, and video file are required' 
      }, { status: 400 });
    }

    const newVideo = new ReviewVideo(body);
    const result = await newVideo.save();

    return NextResponse.json({ 
      result, 
      success: true 
    }, { status: 201 });
  } catch (error) {
    console.error('POST Review Video Error:', error);
    return NextResponse.json({ 
      success: false, 
      message: error.message 
    }, { status: 500 });
  }
}

// PUT: Update review video
export async function PUT(request) {
  try {
    await connectDB();

    const body = await request.json();
    const { id, ...updateData } = body || {};
    
    if (!id) {
      return NextResponse.json({ success: false, message: 'Video ID is required' }, { status: 400 });
    }

    const result = await ReviewVideo.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    if (!result) {
      return NextResponse.json({ success: false, message: 'Video not found' }, { status: 404 });
    }
    return NextResponse.json({ result, success: true });
  } catch (error) {
    console.error('PUT Review Video Error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// DELETE: Delete review video (soft delete)
export async function DELETE(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, message: 'Video ID is required' }, { status: 400 });
    }

    const result = await ReviewVideo.findByIdAndUpdate(id, { isActive: false }, { new: true });
    if (!result) {
      return NextResponse.json({ success: false, message: 'Video not found' }, { status: 404 });
    }
    return NextResponse.json({ result, success: true });
  } catch (error) {
    console.error('DELETE Review Video Error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// PATCH: Batch update sort orders (reorder)
export async function PATCH(request) {
  try {
    await connectDB();

    const body = await request.json();
    const updates = Array.isArray(body?.updates) ? body.updates : null;
    if (!updates || updates.length === 0) {
      return NextResponse.json({ success: false, message: 'No updates provided' }, { status: 400 });
    }

    // Build bulk operations
    const ops = updates.map((u) => {
      const updateDoc = { $set: { sortOrder: Number(u.sortOrder) || 0 } };
      return { updateOne: { filter: { _id: u._id }, update: updateDoc } };
    }).filter(Boolean);

    if (ops.length === 0) {
      return NextResponse.json({ success: false, message: 'Invalid updates' }, { status: 400 });
    }

    await ReviewVideo.bulkWrite(ops);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PATCH Review Videos Error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
