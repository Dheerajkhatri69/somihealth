import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Product from '@/lib/model/product';
import { connectionSrt } from '@/lib/db';

// Connect to MongoDB
async function connectDB() {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(connectionSrt);
  }
}

// GET: Fetch product by category and slug
export async function GET(request, { params }) {
  try {
    await connectDB();
    
    const { category, slug } = params;
    
    if (!category || !slug) {
      return NextResponse.json({ 
        success: false, 
        message: 'Category and slug are required' 
      }, { status: 400 });
    }

    const product = await Product.findOne({ 
      category: category.toLowerCase(), 
      slug: slug.toLowerCase(), 
      isActive: true 
    }).lean();

    if (!product) {
      return NextResponse.json({ 
        success: false, 
        message: 'Product not found' 
      }, { status: 404 });
    }

    return NextResponse.json({ 
      result: product, 
      success: true 
    });
  } catch (error) {
    console.error('GET Product by Category/Slug Error:', error);
    return NextResponse.json({ 
      success: false, 
      message: error.message 
    }, { status: 500 });
  }
}
