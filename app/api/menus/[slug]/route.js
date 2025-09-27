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

    // Transform data to match the expected format and include product-type content
    const result = {
      key: menu.slug,
      menu: {
        _id: menu._id,
        name: menu.name,
        slug: menu.slug,
        showInNavbar: menu.showInNavbar,
        discover: menu.discover,
        treatments: menu.treatments || [],
        categories: menu.categories || [],
        cta: menu.cta,
        mainPanelImg: menu.mainPanelImg,
        type: menu.type,
        proTypeHero: menu.proTypeHero || { eyebrow: '', headingLine1: '', lines: [], body: '', ctaText: '', heroImage: '', heroAlt: '', disclaimer: '' },
        expectSection: menu.expectSection || { title: '', image: { src: '', alt: '', ratio: '' }, items: [] },
        banner: menu.banner || { image: { src: '', alt: '' }, headline: { line1: '', line2: '' }, cta: { text: '', href: '' }, footnote: '' },
        sortOrder: menu.sortOrder,
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
