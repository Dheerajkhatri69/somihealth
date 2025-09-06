import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import ContactPageContent from '@/lib/model/contactPageContent';
import { connectionSrt } from '@/lib/db';

// Connect to MongoDB
async function connectDB() {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(connectionSrt);
  }
}

// GET - Fetch contact page content
export async function GET() {
  try {
    await connectDB();
    
    let content = await ContactPageContent.findOne({ 'config.isActive': true }).lean();
    
    // If no content exists, create default content
    if (!content) {
      content = new ContactPageContent({
        hero: {
          title: 'Contact Somi Health',
          subtitle: 'We\'re here to help at every step of your weight loss journey. Call, email, or send us a message—whatever works best for you.',
          backgroundImage: '/hero/somi-vials.png',
          copyImage: '/hero/hero-copy.png'
        },
        contactInfo: {
          phone: {
            number: '(704) 386-6871',
            display: '(704) 386-6871',
            link: 'tel:+17043866871'
          },
          email: {
            address: 'info@joinsomi.com',
            display: 'info@joinsomi.com',
            link: 'mailto:info@joinsomi.com'
          },
          address: {
            text: 'United States (Remote-first)',
            display: 'United States (Remote-first)'
          },
          hours: {
            text: 'Mon–Fri, 9am–6pm ET',
            display: 'Mon–Fri, 9am–6pm ET'
          }
        },
        sidebar: {
          title: 'What to expect',
          expectations: [
            { text: 'Replies within one business day.' },
            { text: 'Care from licensed clinicians.' },
            { text: 'No spam—just help when you need it.' }
          ],
          callToAction: {
            text: 'Prefer to call?',
            phone: '(704) 386-6871',
            link: 'tel:+17043866871'
          }
        },
        config: {
          isActive: true,
          showContactInfo: true,
          showSidebar: true,
          showForm: true
        }
      });
      await content.save();
    }
    
    return NextResponse.json({
      success: true,
      result: content
    });
  } catch (error) {
    console.error('Error fetching contact page content:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch contact page content' },
      { status: 500 }
    );
  }
}

// PUT - Update contact page content
export async function PUT(request) {
  try {
    await connectDB();
    
    const body = await request.json();
    
    // First, try to find existing content
    let content = await ContactPageContent.findOne({ 'config.isActive': true });
    
    if (content) {
      // Update existing content
      Object.keys(body).forEach(key => {
        if (typeof body[key] === 'object' && body[key] !== null && !Array.isArray(body[key])) {
          content[key] = { ...content[key], ...body[key] };
        } else {
          content[key] = body[key];
        }
      });
      
      // Ensure config.isActive is true
      if (!content.config) content.config = {};
      content.config.isActive = true;
      
      await content.save();
    } else {
      // Create new content
      content = new ContactPageContent({
        ...body,
        config: {
          ...body.config,
          isActive: true
        }
      });
      await content.save();
    }
    
    return NextResponse.json({
      success: true,
      result: content,
      message: 'Contact page content updated successfully'
    });
  } catch (error) {
    console.error('Error updating contact page content:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update contact page content' },
      { status: 500 }
    );
  }
}
