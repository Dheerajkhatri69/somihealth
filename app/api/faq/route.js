import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import FAQ from '@/lib/model/faq';
import { connectionSrt } from '@/lib/db';

// Connect to MongoDB
async function connectDB() {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(connectionSrt);
  }
}

// Helper to sort arrays by sortOrder if present
function sortArrays(payload) {
  if (!payload) return payload;
  const byOrder = (a, b) => (a?.sortOrder ?? 0) - (b?.sortOrder ?? 0);
  if (Array.isArray(payload.faqs)) payload.faqs = [...payload.faqs].sort(byOrder);
  if (Array.isArray(payload.benefits)) payload.benefits = [...payload.benefits].sort(byOrder);
  return payload;
}

// GET - Fetch FAQ data
export async function GET() {
  try {
    await connectDB();
    const faqData = await FAQ.findOne({ isActive: true }).lean();

    if (!faqData) {
      // Return default data if no FAQ exists
      const def = {
        heading: 'Find clear, honest answers about our medical weight loss treatments',
        subheading: 'Your Questions, Answered— Every Step of the Way.',
        faqs: [
          {
            question: "How do I get started with Somi Health's weight loss program?",
            answer:
              'You can begin by completing a quick 7-minute questionnaire, which gathers important information about your medical history, health status, and weight loss goals.',
            sortOrder: 0,
          },
          {
            question: 'What happens after I submit the questionnaire?',
            answer:
              'Once you complete the form, our licensed Nurse Practitioner will review your information to determine your eligibility for GLP-1 or GIP/GLP-1 treatment.',
            sortOrder: 1,
          },
          {
            question: 'How long does it take to receive my medication?',
            answer:
              'After approval, your prescription is sent to the pharmacy, and you will receive your medication within 2–5 days, along with complete usage instructions.',
            sortOrder: 2,
          },
          {
            question: 'Are the medications safe and effective?',
            answer:
              'Yes, the medications we use, including Compounded Semaglutide and Compounded Tirzepatide, are clinically proven to be safe and effective when prescribed and monitored by a healthcare provider.',
            sortOrder: 3,
          },
          {
            question: "What are the benefits of using Somi Health's medical weight loss services?",
            answer:
              'We provide regular health monitoring, personalized treatment plans, reduced risk of side effects, and continuous support from our healthcare team throughout your journey.',
            sortOrder: 4,
          },
          {
            question: 'How much weight can I expect to lose with Compounded Tirzepatide?',
            answer:
              'Studies show that patients using Compounded Tirzepatide can expect a weight loss of approximately 20%–30% of their starting body weight with consistent use and proper medical supervision.',
            sortOrder: 5,
          },
        ],
        benefits: [
          { text: 'Trusted clinical guidance', sortOrder: 0 },
          { text: 'Transparent process & pricing', sortOrder: 1 },
          { text: 'Fast 2–5 day delivery after approval', sortOrder: 2 },
        ],
        footerTitle: 'Still have questions?',
        footerDescription: "Can't find the answer you're looking for? Please chat to our friendly team.",
        footerButtonText: 'Get in touch',
        footerButtonLink: '/underdevelopmentmainpage/contact',
      };
      return NextResponse.json(def);
    }

    return NextResponse.json(sortArrays(faqData));
  } catch (error) {
    console.error('Error fetching FAQ data:', error);
    return NextResponse.json({ error: 'Failed to fetch FAQ data' }, { status: 500 });
  }
}

// POST - Create FAQ (deactivate previous active)
export async function POST(request) {
  try {
    await connectDB();
    const data = await request.json();

    await FAQ.updateMany({ isActive: true }, { isActive: false });

    const faqDoc = new FAQ({ ...data, isActive: true });
    const saved = await faqDoc.save();

    return NextResponse.json(saved.toObject(), { status: 201 });
  } catch (error) {
    console.error('Error saving FAQ data:', error);
    return NextResponse.json({ error: 'Failed to save FAQ data' }, { status: 500 });
  }
}

// PUT - Merge update existing FAQ (prevents wiping untouched fields)
export async function PUT(request) {
  try {
    await connectDB();
    const data = await request.json();

    const query = data?._id ? { _id: data._id } : { isActive: true };

    const updated = await FAQ.findOneAndUpdate(
      query,
      { $set: data },
      { new: true, runValidators: true, omitUndefined: true }
    ).lean();

    if (!updated) {
      return NextResponse.json({ error: 'No active FAQ found' }, { status: 404 });
    }

    return NextResponse.json(sortArrays(updated));
  } catch (error) {
    console.error('Error updating FAQ data:', error);
    return NextResponse.json({ error: 'Failed to update FAQ data' }, { status: 500 });
  }
}

