import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import ContactForm from '@/lib/model/contactForm';
import ContactFormSettings from '@/lib/model/contactFormSettings';
import { connectionSrt } from '@/lib/db';

// Connect to MongoDB
async function connectDB() {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(connectionSrt);
  }
}

// GET - Fetch contact form submissions
export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    
    const skip = (page - 1) * limit;
    
    // Build query
    let query = {};
    if (status && status !== 'all') {
      query.status = status;
    }
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }
    
    const submissions = await ContactForm.find(query)
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await ContactForm.countDocuments(query);
    
    return NextResponse.json({
      success: true,
      result: submissions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching contact submissions:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch submissions' },
      { status: 500 }
    );
  }
}

// POST - Create new contact form submission
export async function POST(request) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { firstName, lastName, email, phone, interestedIn, comments } = body;
    
    // Validate required fields
    if (!firstName || !email || !phone || !interestedIn) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Check if form is active
    const settings = await ContactFormSettings.findOne();
    if (settings && !settings.config.isActive) {
      return NextResponse.json(
        { success: false, message: 'Contact form is currently disabled' },
        { status: 403 }
      );
    }
    
    const submission = new ContactForm({
      firstName,
      lastName: lastName || '',
      email,
      phone,
      interestedIn,
      comments: comments || ''
    });
    
    await submission.save();
    
    // TODO: Send notification email if enabled
    if (settings?.config.enableNotifications && settings?.config.notificationEmail) {
      // Implement email notification here
    }
    
    return NextResponse.json({
      success: true,
      result: submission,
      message: 'Form submitted successfully'
    });
  } catch (error) {
    console.error('Error creating contact submission:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to submit form' },
      { status: 500 }
    );
  }
}

// PUT - Update contact form submission status
export async function PUT(request) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { id, status, notes } = body;
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Submission ID is required' },
        { status: 400 }
      );
    }
    
    const updateData = { lastUpdated: new Date() };
    if (status) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;
    
    const submission = await ContactForm.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );
    
    if (!submission) {
      return NextResponse.json(
        { success: false, message: 'Submission not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      result: submission,
      message: 'Submission updated successfully'
    });
  } catch (error) {
    console.error('Error updating contact submission:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update submission' },
      { status: 500 }
    );
  }
}

// DELETE - Delete contact form submission
export async function DELETE(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Submission ID is required' },
        { status: 400 }
      );
    }
    
    const submission = await ContactForm.findByIdAndDelete(id);
    
    if (!submission) {
      return NextResponse.json(
        { success: false, message: 'Submission not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Submission deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting contact submission:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete submission' },
      { status: 500 }
    );
  }
}
