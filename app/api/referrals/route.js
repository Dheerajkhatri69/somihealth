import { NextResponse } from 'next/server';
import { connectMongoDB } from '@/lib/mongodb';
import Referral from '@/lib/model/referral';

export async function POST(request) {
  try {
    await connectMongoDB();
    const data = await request.json();
    const referral = await Referral.create(data);
    return NextResponse.json({ success: true, referral });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connectMongoDB();
    const referrals = await Referral.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, referrals });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
} 