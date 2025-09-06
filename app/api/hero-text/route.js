import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import HeroText from '@/lib/model/heroText';
import { connectionSrt } from '@/lib/db';

// Connect to MongoDB
async function connectDB() {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(connectionSrt);
  }
}

// GET: Fetch hero text
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // If id is provided, return a single hero text document
    if (id) {
      const heroText = await HeroText.findById(id).lean();
      if (!heroText) {
        return NextResponse.json({ success: false, message: 'Hero text not found' }, { status: 404 });
      }
      return NextResponse.json({ result: heroText, success: true });
    }

    // Return the active hero text (there should only be one active)
    const heroText = await HeroText.findOne({ isActive: true })
      .sort({ sortOrder: 1, createdAt: -1 })
      .lean();

    if (!heroText) {
      // Return default values if no hero text exists
      return NextResponse.json({ 
        result: {
          mainTitle: 'Look Better, Feel Better, Live Better.',
          rotatingLines: [
            'No hidden fees. No hassle. Just results.',
            'Custom plans. Real help. Real care.'
          ],
          isActive: true,
          sortOrder: 0
        }, 
        success: true 
      });
    }

    return NextResponse.json({ 
      result: heroText, 
      success: true 
    });
  } catch (error) {
    console.error('GET Hero Text Error:', error);
    return NextResponse.json({ 
      result: 'error', 
      message: error.message, 
      success: false 
    }, { status: 500 });
  }
}

// POST: Create new hero text
export async function POST(request) {
  try {
    await connectDB();
    
    const body = await request.json();
    
    // Validate required fields
    if (!body.mainTitle) {
      return NextResponse.json({ 
        success: false, 
        message: 'Main title is required' 
      }, { status: 400 });
    }

    if (!body.rotatingLines || !Array.isArray(body.rotatingLines) || body.rotatingLines.length === 0) {
      return NextResponse.json({ 
        success: false, 
        message: 'At least one rotating line is required' 
      }, { status: 400 });
    }

    // Deactivate any existing active hero text
    await HeroText.updateMany({ isActive: true }, { isActive: false });

    const newHeroText = new HeroText(body);
    const result = await newHeroText.save();

    return NextResponse.json({ 
      result, 
      success: true 
    }, { status: 201 });
  } catch (error) {
    console.error('POST Hero Text Error:', error);
    return NextResponse.json({ 
      success: false, 
      message: error.message 
    }, { status: 500 });
  }
}

// PUT: Update hero text
export async function PUT(request) {
  try {
    await connectDB();

    const body = await request.json();
    const { id, ...updateData } = body || {};
    
    if (!id) {
      return NextResponse.json({ success: false, message: 'Hero text ID is required' }, { status: 400 });
    }

    // If setting as active, deactivate others first
    if (updateData.isActive === true) {
      await HeroText.updateMany({ _id: { $ne: id }, isActive: true }, { isActive: false });
    }

    const result = await HeroText.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    if (!result) {
      return NextResponse.json({ success: false, message: 'Hero text not found' }, { status: 404 });
    }
    return NextResponse.json({ result, success: true });
  } catch (error) {
    console.error('PUT Hero Text Error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// DELETE: Delete hero text (soft delete)
export async function DELETE(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, message: 'Hero text ID is required' }, { status: 400 });
    }

    const result = await HeroText.findByIdAndUpdate(id, { isActive: false }, { new: true });
    if (!result) {
      return NextResponse.json({ success: false, message: 'Hero text not found' }, { status: 404 });
    }
    return NextResponse.json({ result, success: true });
  } catch (error) {
    console.error('DELETE Hero Text Error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
