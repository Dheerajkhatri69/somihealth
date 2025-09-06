import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import AboutPageContent from '@/lib/model/aboutPageContent';
import { connectionSrt } from '@/lib/db';

// Connect to MongoDB
async function connectDB() {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(connectionSrt);
  }
}

// GET - Fetch about page content
export async function GET() {
  try {
    await connectDB();
    
    let content = await AboutPageContent.findOne({ 'config.isActive': true }).lean();
    
    // If no content exists, create default content
    if (!content) {
      content = new AboutPageContent({
        hero: {
          badge: 'Somi Health',
          title: 'Somi Health empowers you with real solutions and expert care.',
          subtitle: 'Weight Loss Isn\'t About Willpower—It\'s about getting the right support. We simplify the journey with expert-led care, personalized treatments, and transparent pricing.',
          primaryButton: {
            text: 'Talk to care team',
            link: '/contact'
          },
          secondaryButton: {
            text: 'Explore plans',
            link: '/find-your-plan'
          },
          image: '/hero/abouthero.jpg',
          imageAlt: 'Members of the Somi Health care team'
        },
        ourStory: {
          title: 'Weight loss built on trust, transparency, and connection.',
          paragraph1: 'At Somi Health, we believe that lasting weight loss starts with trust, transparency, and true connection. We\'re here to simplify your journey with expert-led care, personalized treatments, and clear, upfront pricing—no hidden fees, no confusion.',
          paragraph2: 'Our dedicated team, rooted in compassion and experience, works alongside you to create a healthier, more confident future. Whether you\'re just getting started or ready to take the next big step, we make medical weight loss easier, safer, and more accessible for everyone.',
          image: '/hero/aboutstory.png',
          imageAlt: 'Compassionate clinician consulting a patient'
        },
        valueCards: [
          {
            icon: 'HeartPulse',
            title: 'Expert-led Care',
            text: 'Clinicians who listen, personalize, and guide you through every step.'
          },
          {
            icon: 'ShieldCheck',
            title: 'Safe & Transparent',
            text: 'Clear dosing, clear expectations, and pricing you can trust.'
          },
          {
            icon: 'Sparkles',
            title: 'Personalized Plans',
            text: 'Treatments tailored to your biology and your goals.'
          },
          {
            icon: 'Wallet',
            title: 'No Hidden Fees',
            text: 'Upfront pricing—no surprises, no confusion.'
          }
        ],
        stats: {
          title: 'Care that actually supports you',
          subtitle: 'We blend medical expertise with human connection so your plan is doable—and sustainable.',
          stats: [
            {
              label: 'Avg. care response time (min)',
              value: 12,
              suffix: 'm'
            },
            {
              label: 'Personalized plans delivered',
              value: 2500,
              suffix: ''
            },
            {
              label: 'Patient satisfaction',
              value: 98,
              suffix: '%'
            }
          ]
        },
        config: {
          isActive: true,
          showHero: true,
          showOurStory: true,
          showValueCards: true,
          showStats: true,
          showHowItWorks: true
        }
      });
      await content.save();
    }
    
    return NextResponse.json({
      success: true,
      result: content
    });
  } catch (error) {
    console.error('Error fetching about page content:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch about page content' },
      { status: 500 }
    );
  }
}

// PUT - Update about page content
export async function PUT(request) {
  try {
    await connectDB();
    
    const body = await request.json();
    
    // First, try to find existing content
    let content = await AboutPageContent.findOne({ 'config.isActive': true });
    
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
      content = new AboutPageContent({
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
      message: 'About page content updated successfully'
    });
  } catch (error) {
    console.error('Error updating about page content:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update about page content' },
      { status: 500 }
    );
  }
}
