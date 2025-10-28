import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import PricingLanding from '@/lib/model/pricingLanding';
import { connectionSrt } from '@/lib/db';

async function connectDB() {
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(connectionSrt);
    }
}

function defaultDoc() {
    return {
        brand: 'somi',
        backLabel: 'Back',
        backUrl: 'https://joinsomi.com/',
        title: 'What is your primary health goal?',
        subtitle: 'View Our Pricing',
        payLaterPrefix: 'Buy now, pay later with',
        refundCopy:
            "We will refund 100% of your money if our licensed clinician determines you are not eligible for GLP-1 weight loss therapy.",
        guaranteeLines: ['100% Money Back', 'Guarantee', 'FSA and HSA Accepted'],
        badges: [
            { src: '/pricing/certified.png', alt: 'Certified', w: 96, h: 96 },
            { src: '/pricing/guaranteed.png', alt: 'Guaranteed', w: 112, h: 112 },
        ],
        payLogos: [
            { src: '/pay/klarna-badge.png', alt: 'Klarna' },
            { src: '/pay/paypal-badge.png', alt: 'PayPal' },
            { src: '/pay/affirm-badge.webp', alt: 'Affirm' },
        ],
        options: [
            { title: 'Weight Loss', idname: 'weightloss', price: { note: 'AS LOW AS', amount: 196, unit: '/mo' }, href: '/pricing/weightLoss', image: '' },
            { title: 'Longevity', idname: 'longevity', price: { note: 'AS LOW AS', amount: 188, unit: '/mo' }, href: '/pricing/longevity', image: '' },
            { title: 'Erectile Dysfunction', idname: 'erectiledysfunction', price: { note: 'AS LOW AS', amount: 182, unit: '/mo' }, href: '/pricing/erectileDysfunction', image: '' },
            { title: 'Skin+Hair', idname: 'skinhair', price: { note: 'AS LOW AS', amount: 182, unit: '/mo' }, href: '/pricing/skinhair', image: '' },
        ],
        config: { isActive: true },
    };
}

export async function GET() {
    try {
        await connectDB();
        let doc = await PricingLanding.findOne({ 'config.isActive': true }).lean();
        if (!doc) {
            const seeded = new PricingLanding(defaultDoc());
            await seeded.save();
            doc = seeded.toObject();
        }
        return NextResponse.json({ success: true, result: doc });
    } catch (err) {
        console.error('GET /pricing-landing-content error:', err);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch pricing landing content' },
            { status: 500 }
        );
    }
}

export async function PUT(request) {
    try {
        await connectDB();
        const body = await request.json();

        let doc = await PricingLanding.findOne({ 'config.isActive': true });

        if (doc) {
            Object.keys(body || {}).forEach((key) => {
                const incoming = body[key];
                if (typeof incoming === 'object' && incoming !== null && !Array.isArray(incoming)) {
                    doc[key] = { ...(doc[key] || {}), ...incoming };
                } else {
                    doc[key] = incoming;
                }
            });
            if (!doc.config) doc.config = { isActive: true };
            doc.config.isActive = true;
            await doc.save();
        } else {
            doc = new PricingLanding({
                ...defaultDoc(),
                ...body,
                config: { ...(body?.config || {}), isActive: true },
            });
            await doc.save();
        }

        return NextResponse.json({ success: true, result: doc, message: 'Pricing landing content updated successfully' });
    } catch (err) {
        console.error('PUT /pricing-landing-content error:', err);
        return NextResponse.json(
            { success: false, message: 'Failed to update pricing landing content' },
            { status: 500 }
        );
    }
}