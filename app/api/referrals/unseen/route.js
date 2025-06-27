import { NextResponse } from 'next/server';
import { connectMongoDB } from '@/lib/mongodb';
import Referral from '@/lib/model/referral';

export async function GET() {
  try {
    await connectMongoDB();
    const unseenCount = await Referral.countDocuments({ seen: false });
    return NextResponse.json({ success: true, count: unseenCount });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
} 