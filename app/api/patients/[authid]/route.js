import { NextResponse } from 'next/server';
import { connectMongoDB } from '@/lib/mongodb';
import { Patient } from '@/lib/model/patient';

export async function GET(req, { params }) {
    try {
        await connectMongoDB();
        const { authid } = params;
        if (!authid) {
            return NextResponse.json({ success: false, error: 'authid is required.' }, { status: 400 });
        }
        const patient = await Patient.findOne({ authid });
        if (!patient) {
            return NextResponse.json({ success: false, error: 'Patient not found.' }, { status: 404 });
        }
        return NextResponse.json({ success: true, patient });
    } catch (error) {
        console.error('PATIENT API ERROR:', error);
        return NextResponse.json({ success: false, error: error.message || 'Error fetching patient.' }, { status: 500 });
    }
}
