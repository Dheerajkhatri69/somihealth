import { NextResponse } from 'next/server';
import { connectMongoDB } from '@/lib/mongodb';
import Refill from '@/lib/model/refill';

export async function GET() {
  try {
    await connectMongoDB();
    const unseenCount = await Refill.countDocuments({ seen: false });
    return NextResponse.json({ success: true, count: unseenCount });
  } catch (error) {
    console.error('Error fetching unseen refills count:', error);
    return NextResponse.json({ success: false, message: 'An error occurred while fetching the count of unseen refills.' }, { status: 500 });
  }
} 