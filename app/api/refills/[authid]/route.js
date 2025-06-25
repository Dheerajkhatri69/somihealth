import { NextResponse } from 'next/server';
import { connectMongoDB } from '@/lib/mongodb';
import Refill from '@/lib/model/refill';

export async function GET(req, { params }) {
    try {
        await connectMongoDB();
        const { authid } = params;
        if (!authid) {
            return NextResponse.json({ success: false, message: 'authid is required.' }, { status: 400 });
        }
        const refill = await Refill.findOne({ authid });
        if (!refill) {
            return NextResponse.json({ success: false, message: 'Refill not found.' }, { status: 404 });
        }
        return NextResponse.json({ success: true, result: refill });
    } catch (error) {
        return NextResponse.json({ success: false, message: 'Error fetching refill.' }, { status: 500 });
    }
}
