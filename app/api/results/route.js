import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Results from '@/lib/model/results';
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
        
        const results = await Results.findOne({ isActive: true });
        
        if (!results) {
            // Return default values if no content exists
            return NextResponse.json({ 
                result: {
                    tabs: [
                        {
                            title: "Research",
                            value: "research",
                            color: "#3B82F6",
                            bg: "#EAF2FF",
                            bgActive: "#DCEAFF",
                            bullets: ["Years Of Research", "Reliable Medications", "Science-Backed Treatments"],
                            body: "At Somi Health, we offer GLP-1 and GIP/GLP-1 therapies, including compounded Semaglutide and Tirzepatide, supporting safe and effective weight management.",
                            icon: "Beaker"
                        },
                        {
                            title: "Pricing",
                            value: "pricing",
                            color: "#10B981",
                            bg: "#EAF7F1",
                            bgActive: "#D7F2E6",
                            bullets: ["No Hidden Fees.", "No Gimmicks.", "Transparent Pricing"],
                            body: "Our pricing is clear, straightforward, and free from hidden costs, giving you full confidence in knowing exactly what you're paying for and what to expect throughout your journey.",
                            icon: "BadgeDollarSign"
                        },
                        {
                            title: "Safety",
                            value: "safety",
                            color: "#EC4899",
                            bg: "#FCE7F3",
                            bgActive: "#FBCFE8",
                            bullets: ["FDA Approved", "Safe & Effective", "Safety & Quality Guaranteed"],
                            body: "All medications are sourced from FDA-overseen, 503(a) pharmacies and undergo strict third-party testing to ensure your safety and the highest quality standards.",
                            icon: "ShieldCheck"
                        }
                    ],
                    header: {
                        eyebrow: 'Feel stronger, healthier, and more confident',
                        headlineLeft: 'How it works',
                        headlineRight: 'at Somi Health'
                    },
                    image: '/hero/bmilady.png',
                    watermark: {
                        text: 'somi',
                        size: '160px',
                        strokeColor: '#364c781d',
                        strokeWidth: '2px',
                        fill: 'transparent',
                        font: '"Sofia Sans", ui-sans-serif',
                        weight: 700,
                        tracking: '0em',
                        opacity: 1,
                        left: '0rem',
                        top: '8rem',
                        rotate: '0deg'
                    },
                    isActive: true
                }, 
                success: true 
            });
        }
        
        return NextResponse.json({
            success: true,
            result: results
        });
    } catch (error) {
        console.error('Error fetching Results content:', error);
        return NextResponse.json({
            success: false,
            message: 'Error fetching Results content'
        }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        await connectDB();
        
        const body = await request.json();
        
        // Validate required fields
        if (!body.tabs || !Array.isArray(body.tabs)) {
            return NextResponse.json({ 
                success: false, 
                message: 'Tabs array is required' 
            }, { status: 400 });
        }

        // Deactivate any existing active content
        await Results.updateMany({ isActive: true }, { isActive: false });
        
        // Create new content
        const results = new Results({
            ...body,
            isActive: true
        });
        
        await results.save();
        
        return NextResponse.json({
            success: true,
            result: results
        }, { status: 201 });
    } catch (error) {
        console.error('Error creating Results content:', error);
        return NextResponse.json({
            success: false,
            message: 'Error creating Results content'
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
        
        const results = await Results.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );
        
        if (!results) {
            return NextResponse.json({
                success: false,
                message: 'Results content not found'
            }, { status: 404 });
        }
        
        return NextResponse.json({
            success: true,
            result: results
        });
    } catch (error) {
        console.error('Error updating Results content:', error);
        return NextResponse.json({
            success: false,
            message: 'Error updating Results content'
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
        
        const results = await Results.findByIdAndDelete(id);
        
        if (!results) {
            return NextResponse.json({
                success: false,
                message: 'Results content not found'
            }, { status: 404 });
        }
        
        return NextResponse.json({
            success: true,
            message: 'Results content deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting Results content:', error);
        return NextResponse.json({
            success: false,
            message: 'Error deleting Results content'
        }, { status: 500 });
    }
}
