import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import PricingWeightLoss from '@/lib/model/pricingWeightLoss';
import { connectionSrt } from '@/lib/db';

async function connectDB() {
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(connectionSrt);
    }
}

function defaultDoc() {
    return {
        heading: 'Ready To Start Your Weight Loss Journey?',
        subheading: 'View Our Pricing',
        brand: 'somi',
        backLabel: 'Back',
        backHref: '/pricing',
        options: [
            {
                title: 'Compounded Semaglutide',
                idname: 'semaglutide',
                price: { note: '', amount: 0, unit: '' },
                href: '/pricing/semaglutide',
                image: '/pricing/semaglutide.png'
            },
            {
                title: 'Compounded Tirzepatide',
                idname: 'tirzepatide',
                price: { note: '', amount: 0, unit: '' },
                href: '/pricing/tirzepatide',
                image: '/pricing/tirzepatide.png'
            },
        ],
        badges: [
            { src: '/pricing/certified.png', alt: 'Certified', w: 96, h: 96 },
            { src: '/pricing/guaranteed.png', alt: 'Guaranteed', w: 112, h: 112 },
        ],
        guarantee: {
            title: 'Money Back Guarantee',
            lines: ['100% Money Back', 'Guarantee', 'FSA and HSA Accepted'],
            refundText: 'We will refund 100% of your money if our licensed clinician determines you are not eligible for GLP-1 weight loss therapy.',
        },
        config: { isActive: true },
    };
}
// ---------- GET ----------
export async function GET() {
    try {
        await connectDB();
        let doc = await PricingWeightLoss.findOne({ 'config.isActive': true }).lean();
        if (!doc) {
            const seeded = new PricingWeightLoss(defaultDoc());
            await seeded.save();
            doc = seeded.toObject();
        }
        return NextResponse.json({ success: true, result: doc });
    } catch (err) {
        console.error('GET /pricing-weightloss-content error:', err);
        return NextResponse.json({ success: false, message: 'Failed to fetch content' }, { status: 500 });
    }
}

// ---------- PUT ----------
export async function PUT(request) {
    try {
        await connectDB();
        const body = await request.json();

        let doc = await PricingWeightLoss.findOne({ 'config.isActive': true });

        if (doc) {
            Object.assign(doc, body);
            await doc.save();
        } else {
            doc = new PricingWeightLoss({ ...defaultDoc(), ...body });
            await doc.save();
        }

        return NextResponse.json({ success: true, result: doc, message: 'Updated successfully' });
    } catch (err) {
        console.error('PUT /pricing-weightloss-content error:', err);
        return NextResponse.json({ success: false, message: 'Failed to update content' }, { status: 500 });
    }
}
