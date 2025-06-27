import { NextResponse } from 'next/server';
import { connectMongoDB } from '@/lib/mongodb';
import Referral from '@/lib/model/referral';

export async function POST(request) {
  try {
    const { ids } = await request.json();
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ success: false, message: 'Invalid IDs provided.' }, { status: 400 });
    }
    await connectMongoDB();
    await Referral.updateMany({ _id: { $in: ids } }, { $set: { seen: true } });
    return NextResponse.json({ success: true, message: 'Referrals marked as seen.' });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
} 