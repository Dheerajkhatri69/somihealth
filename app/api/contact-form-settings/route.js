import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import ContactFormSettings from '@/lib/model/contactFormSettings';
import { connectionSrt } from '@/lib/db';

// Connect to MongoDB
async function connectDB() {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(connectionSrt);
  }
}

// GET - Fetch contact form settings
export async function GET() {
  try {
    await connectDB();
    
    let settings = await ContactFormSettings.findOne();
    
    // If no settings exist, create default settings
    if (!settings) {
      settings = new ContactFormSettings({
        fields: {
          interestedIn: {
            options: [
              { value: 'Medical Weight Loss', label: 'Medical Weight Loss' },
              { value: 'Hormone Therapy', label: 'Hormone Therapy' },
              { value: 'General Question', label: 'General Question' }
            ]
          }
        }
      });
      await settings.save();
    }
    
    return NextResponse.json({
      success: true,
      result: settings
    });
  } catch (error) {
    console.error('Error fetching contact form settings:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

// PUT - Update contact form settings
export async function PUT(request) {
  try {
    await connectDB();
    
    const body = await request.json();
    
    let settings = await ContactFormSettings.findOne();
    
    if (!settings) {
      settings = new ContactFormSettings(body);
    } else {
      // Merge with existing settings
      Object.keys(body).forEach(key => {
        if (typeof body[key] === 'object' && body[key] !== null && !Array.isArray(body[key])) {
          settings[key] = { ...settings[key], ...body[key] };
        } else {
          settings[key] = body[key];
        }
      });
    }
    
    await settings.save();
    
    return NextResponse.json({
      success: true,
      result: settings,
      message: 'Settings updated successfully'
    });
  } catch (error) {
    console.error('Error updating contact form settings:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
