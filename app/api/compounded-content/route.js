import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import CompoundedContent from '@/lib/model/compoundedContent';
import { connectionSrt } from '@/lib/db';

// Connect to MongoDB
async function connectDB() {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(connectionSrt);
  }
}

// GET: Fetch compounded content
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // If id is provided, return a single content
    if (id) {
      const content = await CompoundedContent.findById(id).lean();
      if (!content) {
        return NextResponse.json({ success: false, message: 'Compounded content not found' }, { status: 404 });
      }
      return NextResponse.json({ result: content, success: true });
    }

    // Return the active compounded content (there should only be one active)
    const content = await CompoundedContent.findOne({ isActive: true }).lean();

    if (!content) {
      // Return default values if no content exists
      return NextResponse.json({ 
        result: {
          title: 'What are Compounded GLP-1 Medications?',
          description: 'Compounded GLP-1 medications are personalized versions of treatments like Semaglutide or Tirzepatide. They\'re made by licensed compounding pharmacies based on a prescription from a qualified healthcare provider. They contain the same active ingredient as the branded medications, but are compounded to offer a more personalized and often more accessible option.',
          image: '/hero/bmilady.png',
          isActive: true
        }, 
        success: true 
      });
    }

    return NextResponse.json({ 
      result: content, 
      success: true 
    });
  } catch (error) {
    console.error('GET Compounded Content Error:', error);
    return NextResponse.json({ 
      result: 'error', 
      message: error.message, 
      success: false 
    }, { status: 500 });
  }
}

// POST: Create new compounded content
export async function POST(request) {
  try {
    await connectDB();
    
    const body = await request.json();
    
    // Validate required fields
    if (!body.title || !body.description || !body.image) {
      return NextResponse.json({ 
        success: false, 
        message: 'Title, description, and image are required' 
      }, { status: 400 });
    }

    // Deactivate any existing active content
    await CompoundedContent.updateMany({ isActive: true }, { isActive: false });

    const newContent = new CompoundedContent(body);
    const result = await newContent.save();

    return NextResponse.json({ 
      result, 
      success: true 
    }, { status: 201 });
  } catch (error) {
    console.error('POST Compounded Content Error:', error);
    return NextResponse.json({ 
      success: false, 
      message: error.message 
    }, { status: 500 });
  }
}

// PUT: Update compounded content
export async function PUT(request) {
  try {
    await connectDB();

    const body = await request.json();
    const { id, ...updateData } = body || {};
    
    if (!id) {
      return NextResponse.json({ success: false, message: 'Compounded content ID is required' }, { status: 400 });
    }

    // If setting as active, deactivate others first
    if (updateData.isActive === true) {
      await CompoundedContent.updateMany({ _id: { $ne: id }, isActive: true }, { isActive: false });
    }

    const result = await CompoundedContent.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    if (!result) {
      return NextResponse.json({ success: false, message: 'Compounded content not found' }, { status: 404 });
    }
    return NextResponse.json({ result, success: true });
  } catch (error) {
    console.error('PUT Compounded Content Error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// DELETE: Delete compounded content (soft delete)
export async function DELETE(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, message: 'Compounded content ID is required' }, { status: 400 });
    }

    const result = await CompoundedContent.findByIdAndUpdate(id, { isActive: false }, { new: true });
    if (!result) {
      return NextResponse.json({ success: false, message: 'Compounded content not found' }, { status: 404 });
    }
    return NextResponse.json({ result, success: true });
  } catch (error) {
    console.error('DELETE Compounded Content Error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
