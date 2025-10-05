import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import HeroText from '@/lib/model/heroText';
import { connectionSrt } from '@/lib/db';

async function connectDB() {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(connectionSrt);
  }
}

// sanitize helper
function cleanFeatures(features) {
  if (!Array.isArray(features)) return undefined;
  return features
    .map((f, i) => ({
      icon: (f?.icon || 'Handshake').trim(),
      text: (f?.text || '').trim(),
      sortOrder: Number.isFinite(f?.sortOrder) ? f.sortOrder : i,
    }))
    .filter(f => f.text); // must have text
}

/* -------- GET -------- */
export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      const heroText = await HeroText.findById(id).lean();
      if (!heroText) {
        return NextResponse.json({ success: false, message: 'Hero text not found' }, { status: 404 });
      }
      return NextResponse.json({ result: heroText, success: true });
    }

    const heroText = await HeroText.findOne({ isActive: true })
      .sort({ sortOrder: 1, createdAt: -1 })
      .lean();

    if (!heroText) {
      return NextResponse.json({
        result: {
          mainTitle: 'Look Better, Feel Better, Live Better.',
          rotatingLines: [
            'No hidden fees. No hassle. Just results.',
            'Custom plans. Real help. Real care.',
          ],
          features: [
            { icon: 'Handshake', text: 'Free consultation, fast approval', sortOrder: 0 },
            { icon: 'CreditCard', text: 'No insurance required', sortOrder: 1 },
            { icon: 'Stethoscope', text: 'Doctor-led treatment plans', sortOrder: 2 },
          ],
          isActive: true,
          sortOrder: 0,
        },
        success: true,
      });
    }

    return NextResponse.json({ result: heroText, success: true });
  } catch (error) {
    console.error('GET Hero Text Error:', error);
    return NextResponse.json({ result: 'error', message: error.message, success: false }, { status: 500 });
  }
}

/* -------- POST (create new active snapshot) -------- */
export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();

    if (!body.mainTitle) {
      return NextResponse.json({ success: false, message: 'Main title is required' }, { status: 400 });
    }
    if (!body.rotatingLines || !Array.isArray(body.rotatingLines) || body.rotatingLines.length === 0) {
      return NextResponse.json({ success: false, message: 'At least one rotating line is required' }, { status: 400 });
    }

    const cleaned = {
      mainTitle: String(body.mainTitle).trim(),
      rotatingLines: body.rotatingLines.map(s => String(s).trim()).filter(Boolean),
      features: cleanFeatures(body.features),
      isActive: body.isActive !== false, // default true
      sortOrder: Number.isFinite(body.sortOrder) ? body.sortOrder : 0,
    };

    // deactivate existing actives if this one is active
    if (cleaned.isActive) {
      await HeroText.updateMany({ isActive: true }, { isActive: false });
    }

    const newHeroText = new HeroText(cleaned);
    const result = await newHeroText.save();

    return NextResponse.json({ result, success: true }, { status: 201 });
  } catch (error) {
    console.error('POST Hero Text Error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

/* -------- PUT (update by id) -------- */
export async function PUT(request) {
  try {
    await connectDB();
    const body = await request.json();
    const { id, ...updateData } = body || {};
    if (!id) {
      return NextResponse.json({ success: false, message: 'Hero text ID is required' }, { status: 400 });
    }

    const set = {};
    if (typeof updateData.mainTitle === 'string') set.mainTitle = updateData.mainTitle.trim();
    if (Array.isArray(updateData.rotatingLines))
      set.rotatingLines = updateData.rotatingLines.map(s => String(s).trim()).filter(Boolean);
    const cf = cleanFeatures(updateData.features);
    if (cf) set.features = cf;
    if (typeof updateData.sortOrder === 'number') set.sortOrder = updateData.sortOrder;
    if (typeof updateData.isActive === 'boolean') set.isActive = updateData.isActive;

    // If setting this one active, deactivate others
    if (set.isActive === true) {
      await HeroText.updateMany({ _id: { $ne: id }, isActive: true }, { isActive: false });
    }

    const result = await HeroText.findByIdAndUpdate(id, set, { new: true, runValidators: true });
    if (!result) {
      return NextResponse.json({ success: false, message: 'Hero text not found' }, { status: 404 });
    }
    return NextResponse.json({ result, success: true });
  } catch (error) {
    console.error('PUT Hero Text Error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

/* -------- DELETE (soft) -------- */
export async function DELETE(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, message: 'Hero text ID is required' }, { status: 400 });
    }
    const result = await HeroText.findByIdAndUpdate(id, { isActive: false }, { new: true });
    if (!result) {
      return NextResponse.json({ success: false, message: 'Hero text not found' }, { status: 404 });
    }
    return NextResponse.json({ result, success: true });
  } catch (error) {
    console.error('DELETE Hero Text Error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
