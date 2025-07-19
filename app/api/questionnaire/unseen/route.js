import { NextResponse } from 'next/server';
import { connectMongoDB } from '@/lib/mongodb';
import mongoose from 'mongoose';

export async function GET() {
  try {
    await connectMongoDB();
    const Questionnaire = mongoose.models.Questionnaire || (await import('@/lib/model/questionnaire')).default;
    const unseenCount = await Questionnaire.countDocuments({ seen: false });
    return NextResponse.json({ success: true, count: unseenCount });
  } catch (error) {
    console.error('Error fetching unseen questionnaires count:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred while fetching the count of unseen questionnaires.' },
      { status: 500 }
    );
  }
} 