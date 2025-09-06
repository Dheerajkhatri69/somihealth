import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import HowItWorks from '@/lib/model/howItWorks';
import { connectionSrt } from '@/lib/db';

// Connect to MongoDB
async function connectDB() {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(connectionSrt);
  }
}
export async function GET() {
    try {
        await connectDB();
        
        const howItWorks = await HowItWorks.findOne({ isActive: true });
        
        if (!howItWorks) {
            // Return default values if no content exists
            return NextResponse.json({ 
                result: {
                    eyebrow: 'FEEL STRONGER, HEALTHIER, AND MORE CONFIDENT',
                    mainTitle: 'How it works with Somi Health',
                    mainTitleHighlight: 'with Somi Health',
                    steps: [
                        {
                            eyebrow: 'Unlock Your Best Self',
                            caption: 'You deserve this!',
                            title: '1. Take the Questionnaire',
                            description: 'Fill out a 7-minute questionnaire with your medical history, current health status, and weight-loss needs.',
                            icon: 'ClipboardList'
                        },
                        {
                            eyebrow: 'Virtual Help Available',
                            caption: 'Stay comfortable',
                            title: '2. Expert Guidance & Help',
                            description: 'Our licensed Nurse Practitioner reviews your form, confirms eligibility for GLP-1, and builds a safe, suitable plan.',
                            icon: 'Video'
                        },
                        {
                            eyebrow: 'Fast Shipping',
                            caption: 'Quick delivery',
                            title: '3. Receive Medication in 2–5 Days',
                            description: 'Once approved, your prescription is sent to the pharmacy. Expect your medication in 2–5 days with clear instructions.',
                            icon: 'Package'
                        }
                    ],
                    ctaText: 'Start your journey',
                    ctaLink: '/getstarted',
                    isActive: true
                }, 
                success: true 
            });
        }
        
        return NextResponse.json({
            success: true,
            result: howItWorks
        });
    } catch (error) {
        console.error('Error fetching How It Works content:', error);
        return NextResponse.json({
            success: false,
            message: 'Error fetching How It Works content'
        }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        await connectDB();
        
        const body = await request.json();
        
        // Validate required fields
        if (!body.eyebrow || !body.mainTitle || !body.steps || !Array.isArray(body.steps)) {
            return NextResponse.json({ 
                success: false, 
                message: 'Eyebrow, mainTitle, and steps array are required' 
            }, { status: 400 });
        }

        // Deactivate any existing active content
        await HowItWorks.updateMany({ isActive: true }, { isActive: false });
        
        // Create new content
        const howItWorks = new HowItWorks({
            ...body,
            isActive: true
        });
        
        await howItWorks.save();
        
        return NextResponse.json({
            success: true,
            result: howItWorks
        }, { status: 201 });
    } catch (error) {
        console.error('Error creating How It Works content:', error);
        return NextResponse.json({
            success: false,
            message: 'Error creating How It Works content'
        }, { status: 500 });
    }
}

export async function PUT(request) {
    try {
        await connectDB();
        
        const body = await request.json();
        const { id, ...updateData } = body;
        
        if (!id) {
            return NextResponse.json({
                success: false,
                message: 'ID is required for update'
            }, { status: 400 });
        }
        
        const howItWorks = await HowItWorks.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );
        
        if (!howItWorks) {
            return NextResponse.json({
                success: false,
                message: 'How It Works content not found'
            }, { status: 404 });
        }
        
        return NextResponse.json({
            success: true,
            result: howItWorks
        });
    } catch (error) {
        console.error('Error updating How It Works content:', error);
        return NextResponse.json({
            success: false,
            message: 'Error updating How It Works content'
        }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        await connectDB();
        
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        
        if (!id) {
            return NextResponse.json({
                success: false,
                message: 'ID is required for deletion'
            }, { status: 400 });
        }
        
        const howItWorks = await HowItWorks.findByIdAndDelete(id);
        
        if (!howItWorks) {
            return NextResponse.json({
                success: false,
                message: 'How It Works content not found'
            }, { status: 404 });
        }
        
        return NextResponse.json({
            success: true,
            message: 'How It Works content deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting How It Works content:', error);
        return NextResponse.json({
            success: false,
            message: 'Error deleting How It Works content'
        }, { status: 500 });
    }
}
