import { NextResponse } from 'next/server';
import { connectMongoDB } from '@/lib/mongodb';
import Refill from '@/lib/model/refill';

export async function POST(req) {
    try {
        await connectMongoDB();
        const body = await req.json();
        const { authid } = body;

        if (!authid) {
            return NextResponse.json({ message: "authid is required." }, { status: 400 });
        }

        // Create a regex to find the base authid and any suffixed versions
        const baseAuthId = authid.split('-')[0];
        const authIdRegex = new RegExp(`^${baseAuthId}(-\\d+)?$`);

        // Count existing documents with the same base authid
        const count = await Refill.countDocuments({ authid: authIdRegex });

        let newAuthId = authid;
        if (count > 0) {
            // If documents exist, the new suffix will be the count.
            // e.g., if P01012 exists (count=1), new is P01012-1
            // if P01012, P01012-1 exist (count=2), new is P01012-2
            newAuthId = `${baseAuthId}-${count}`;
        }
        
        const submissionData = {
            ...body,
            authid: newAuthId,
        };

        await Refill.create(submissionData);

        return NextResponse.json({ message: "Refill questionnaire submitted." }, { status: 201 });
    } catch (error) {
        console.error("Error submitting refill questionnaire: ", error);
        return NextResponse.json({ message: "An error occurred while submitting the form." }, { status: 500 });
    }
}

export async function GET() {
    try {
        await connectMongoDB();
        const refills = await Refill.find().sort({ createdAt: -1 });
        return NextResponse.json({ success: true, result: refills });
    } catch (error) {
        console.error("Error fetching refills: ", error);
        return NextResponse.json({ success: false, message: "An error occurred while fetching refills." }, { status: 500 });
    }
}

export async function DELETE(req) {
    try {
        await connectMongoDB();
        const { ids } = await req.json();

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json({ success: false, message: "IDs are required for deletion." }, { status: 400 });
        }

        const result = await Refill.deleteMany({ _id: { $in: ids } });

        if (result.deletedCount === 0) {
            return NextResponse.json({ success: false, message: "No matching refills found to delete." }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: "Refills deleted successfully." });
    } catch (error) {
        console.error("Error deleting refills: ", error);
        return NextResponse.json({ success: false, message: "An error occurred while deleting refills." }, { status: 500 });
    }
} 