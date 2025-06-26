import { NextResponse } from 'next/server';
import { connectMongoDB } from '@/lib/mongodb';
import Questionnaire from '@/lib/model/questionnaire';

export async function POST(request) {
  try {
    const { ids } = await request.json();
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ success: false, message: 'Invalid IDs provided.' }, { status: 400 });
    }
    await connectMongoDB();
    await Questionnaire.updateMany({ _id: { $in: ids } }, { $set: { seen: true } });
    return NextResponse.json({ success: true, message: 'Questionnaires marked as seen.' });
  } catch (error) {
    console.error('Error marking questionnaires as seen:', error);
    return NextResponse.json({ success: false, message: 'An error occurred while marking questionnaires as seen.' }, { status: 500 });
  }
} 