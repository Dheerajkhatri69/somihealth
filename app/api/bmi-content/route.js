import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import BMIContent from '@/lib/model/bmiContent';
import { connectionSrt } from '@/lib/db';

// Connect to MongoDB
async function connectDB() {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(connectionSrt);
  }
}

// GET: Fetch BMI content
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // If id is provided, return a single content
    if (id) {
      const content = await BMIContent.findById(id).lean();
      if (!content) {
        return NextResponse.json({ success: false, message: 'BMI content not found' }, { status: 404 });
      }
      return NextResponse.json({ result: content, success: true });
    }

    // Return the active BMI content (there should only be one active)
    const content = await BMIContent.findOne({ isActive: true }).lean();

    if (!content) {
      // Return default values if no content exists
      return NextResponse.json({ 
        result: {
          title: 'See how much weight you could lose — how different life could feel.',
          description: 'Backed by real medicine and real results, somi helps you reach your goals without constant hunger or unsustainable plans. Just choose your starting point to see what\'s possible.',
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
    console.error('GET BMI Content Error:', error);
    return NextResponse.json({ 
      result: 'error', 
      message: error.message, 
      success: false 
    }, { status: 500 });
  }
}

// POST: Create new BMI content
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
    await BMIContent.updateMany({ isActive: true }, { isActive: false });

    const newContent = new BMIContent(body);
    const result = await newContent.save();

    return NextResponse.json({ 
      result, 
      success: true 
    }, { status: 201 });
  } catch (error) {
    console.error('POST BMI Content Error:', error);
    return NextResponse.json({ 
      success: false, 
      message: error.message 
    }, { status: 500 });
  }
}

// PUT: Update BMI content
export async function PUT(request) {
  try {
    await connectDB();

    const body = await request.json();
    const { id, ...updateData } = body || {};
    
    if (!id) {
      return NextResponse.json({ success: false, message: 'BMI content ID is required' }, { status: 400 });
    }

    // If setting as active, deactivate others first
    if (updateData.isActive === true) {
      await BMIContent.updateMany({ _id: { $ne: id }, isActive: true }, { isActive: false });
    }

    const result = await BMIContent.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    if (!result) {
      return NextResponse.json({ success: false, message: 'BMI content not found' }, { status: 404 });
    }
    return NextResponse.json({ result, success: true });
  } catch (error) {
    console.error('PUT BMI Content Error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// DELETE: Delete BMI content (soft delete)
export async function DELETE(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, message: 'BMI content ID is required' }, { status: 400 });
    }

    const result = await BMIContent.findByIdAndUpdate(id, { isActive: false }, { new: true });
    if (!result) {
      return NextResponse.json({ success: false, message: 'BMI content not found' }, { status: 404 });
    }
    return NextResponse.json({ result, success: true });
  } catch (error) {
    console.error('DELETE BMI Content Error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
