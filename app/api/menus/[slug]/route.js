import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Menu from '@/lib/model/menu';
import { connectionSrt } from '@/lib/db';

// Connect to MongoDB
async function connectDB() {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(connectionSrt);
  }
}

// GET: Fetch menu by slug
export async function GET(request, { params }) {
  try {
    await connectDB();
    
    const { slug } = params;
    
    if (!slug) {
      return NextResponse.json({ 
        success: false, 
        message: 'Slug is required' 
      }, { status: 400 });
    }

    const menu = await Menu.findOne({ 
      slug: slug.toLowerCase(), 
      isActive: true 
    }).lean();

    if (!menu) {
      return NextResponse.json({ 
        success: false, 
        message: 'Menu not found' 
      }, { status: 404 });
    }

    // Transform data to match the expected format
    const result = {
      key: menu.name,
      menu: {
        showInNavbar: menu.showInNavbar,
        discover: menu.discover,
        treatments: menu.treatments || [],
        categories: menu.categories || [],
        cta: menu.cta,
        type: menu.type
      }
    };

    return NextResponse.json({ 
      result, 
      success: true 
    });
  } catch (error) {
    console.error('GET Menu by Slug Error:', error);
    return NextResponse.json({ 
      success: false, 
      message: error.message 
    }, { status: 500 });
  }
}
