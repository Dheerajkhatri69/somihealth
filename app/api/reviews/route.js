import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Review from '@/lib/model/review';
import { connectionSrt } from '@/lib/db';

// Connect to MongoDB
async function connectDB() {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(connectionSrt);
  }
}

// GET: Fetch reviews
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // If id is provided, return a single review
    if (id) {
      const review = await Review.findById(id).lean();
      if (!review) {
        return NextResponse.json({ success: false, message: 'Review not found' }, { status: 404 });
      }
      return NextResponse.json({ result: review, success: true });
    }

    // Return all active reviews sorted by sortOrder
    const reviews = await Review.find({ isActive: true })
      .sort({ sortOrder: 1, createdAt: -1 })
      .lean();

    return NextResponse.json({ 
      result: reviews, 
      success: true 
    });
  } catch (error) {
    console.error('GET Reviews Error:', error);
    return NextResponse.json({ 
      result: 'error', 
      message: error.message, 
      success: false 
    }, { status: 500 });
  }
}

// POST: Create new review
export async function POST(request) {
  try {
    await connectDB();
    
    const body = await request.json();
    
    // Validate required fields
    if (!body.quote || !body.author) {
      return NextResponse.json({ 
        success: false, 
        message: 'Quote and author are required' 
      }, { status: 400 });
    }

    const newReview = new Review(body);
    const result = await newReview.save();

    return NextResponse.json({ 
      result, 
      success: true 
    }, { status: 201 });
  } catch (error) {
    console.error('POST Review Error:', error);
    return NextResponse.json({ 
      success: false, 
      message: error.message 
    }, { status: 500 });
  }
}

// PUT: Update review
export async function PUT(request) {
  try {
    await connectDB();

    const body = await request.json();
    const { id, ...updateData } = body || {};
    
    if (!id) {
      return NextResponse.json({ success: false, message: 'Review ID is required' }, { status: 400 });
    }

    const result = await Review.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    if (!result) {
      return NextResponse.json({ success: false, message: 'Review not found' }, { status: 404 });
    }
    return NextResponse.json({ result, success: true });
  } catch (error) {
    console.error('PUT Review Error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// DELETE: Delete review (soft delete)
export async function DELETE(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, message: 'Review ID is required' }, { status: 400 });
    }

    const result = await Review.findByIdAndUpdate(id, { isActive: false }, { new: true });
    if (!result) {
      return NextResponse.json({ success: false, message: 'Review not found' }, { status: 404 });
    }
    return NextResponse.json({ result, success: true });
  } catch (error) {
    console.error('DELETE Review Error:', error);
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

    await Review.bulkWrite(ops);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PATCH Reviews Error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
