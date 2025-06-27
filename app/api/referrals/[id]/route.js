import { NextResponse } from 'next/server';
import { connectMongoDB } from '@/lib/mongodb';
import Referral from '@/lib/model/referral';

export async function GET(req, { params }) {
  try {
    await connectMongoDB();
    const { id } = params;
    const referral = await Referral.findById(id);
    if (!referral) {
      return NextResponse.json({ success: false, message: 'Referral not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, referral });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
} 