import { NextResponse } from 'next/server';
import GeneralHealthContent from '@/lib/model/generalHealthContent';
import { connectionSrt } from '@/lib/db';
import mongoose from 'mongoose';

async function connectDB() {
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(connectionSrt);
    }
}

function defaults() {
    return {
        hero: {
            heading: "Your General Health physician online",
            subheading: "Partnering you with a doctor who really gets to know you, listens to you, and has time for you.",
            priceNote: "Starting at $99/month for individuals or $178 for your entire family",
            ctaLabel: "Get started",
            ctaHref: "/getstarted",
            image: {
                src: "https://assets.lemonaidhealth.com/web/brochure/images/primary-care/Lemonaid_MD_page_Hero_image_desktop.png",
                alt: "Person at home on laptop with a dog"
            }
        },
        partner: {
            heading: "How we partner you with the perfect doctor",
            items: [
                {
                    id: 1,
                    title: "We learn about you",
                    desc: "Based on your medical needs, personal interests, and goals, we'll partner you with the doctor that's perfect for your needs.",
                    icon: {
                        src: "https://assets.lemonaidhealth.com/web/brochure/images/coaching/lemonaid-coaching-illustrations-03.png",
                        alt: "Phone with doctor",
                        width: 80, height: 80
                    }
                },
                {
                    id: 2,
                    title: "First long visit",
                    desc: "You and your doctor will connect over video chat for about an hour. You'll get to know each other and create a plan to manage your health.",
                    icon: {
                        src: "https://assets.lemonaidhealth.com/web/brochure/images/LCP-Phone-Call.png",
                        alt: "Video chat",
                        width: 80, height: 80
                    }
                },
                {
                    id: 3,
                    title: "On-going access",
                    desc: "Call, text, or video chat your doctor anytime. Every conversation continues where you left off so care feels personal and consistent.",
                    icon: {
                        src: "https://assets.lemonaidhealth.com/web/brochure/images/Lemonaid-Support-hands-blue.png",
                        alt: "Handshake",
                        width: 80, height: 80
                    }
                }
            ]
        },
        features: {
            heading: "Get the primary care you need, whenever you need it",
            intro: "Text, call, or video chat with your doctor anytime. Because you get the personal attention of the same doctor, they really get to know you and your family. Every conversation continues where it left off. We’re proud to offer care for every problem, big or small, including:",
            image: {
                src: "https://assets.lemonaidhealth.com/web/brochure/images/primary-care/Lemonaid_MD_page_Hero_image_desktop.png",
                alt: "Friendly doctor chatting with patient online"
            },
            groups: [
                {
                    title: "Chronic conditions",
                    items: [
                        "Hashimoto’s, Hyperthyroidism, Blood Pressure, Cholesterol, Weight, Allergies, Metabolic Syndrome, Stress Management"
                    ]
                },
                {
                    title: "Labs & screenings",
                    items: [
                        "Abdominal pain, Anemia, Cardiovascular, Chronic disease, Erectile Dysfunction, Fatigue, Fertility, Thyroid disease, Vitamin deficiencies, Gut Bacteria, Hormones"
                    ]
                },
                { title: "Women’s health", items: ["Family planning, Preconception counseling, Menopause, PMS, Sexual Dysfunction, Urinary Tract Infections, Vaginal & Yeast Infections, Prenatal Counseling"] },
                { title: "Preventative medicine", items: ["Smoking Cessation, Metabolic Syndrome, Mood Disorder Screening, Weight Loss Counseling"] },
                { title: "Men’s health", items: ["Acne, Hair Loss, Sexual Dysfunction"] }
            ]
        },
        config: { isActive: true }
    };
}

// GET
export async function GET() {
    try {
        await connectDB();
        let content = await GeneralHealthContent.findOne({ 'config.isActive': true }).lean();

        if (!content) {
            // Seed with defaults
            const seeded = new GeneralHealthContent(defaults());
            content = await seeded.save();
        }

        return NextResponse.json({ success: true, result: content });
    } catch (err) {
        console.error('GET /api/gh-content error', err);
        return NextResponse.json({ success: false, message: 'Failed to fetch GH content' }, { status: 500 });
    }
}

// PUT
export async function PUT(req) {
    try {
        await connectDB();
        const body = await req.json();

        // Merge logic: shallow merge for top-level, shallow inside hero/partner/features
        let doc = await GeneralHealthContent.findOne({ 'config.isActive': true });

        if (!doc) {
            doc = new GeneralHealthContent({ ...defaults(), ...body, config: { isActive: true } });
            await doc.save();
        } else {
            // Only update supplied subtrees
            if (body.hero) doc.hero = { ...doc.hero.toObject(), ...body.hero };
            if (body.partner) doc.partner = { ...doc.partner.toObject(), ...body.partner };
            if (body.features) doc.features = { ...doc.features.toObject(), ...body.features };
            if (body.config) doc.config = { ...doc.config.toObject(), ...body.config, isActive: true };

            // Allow full array replacement if arrays provided
            if (Array.isArray(body.partner?.items)) doc.partner.items = body.partner.items;
            if (Array.isArray(body.features?.groups)) doc.features.groups = body.features.groups;

            await doc.save();
        }

        return NextResponse.json({ success: true, result: doc, message: 'GH content updated' });
    } catch (err) {
        // Handle unique index violation gracefully
        if (err?.code === 11000) {
            return NextResponse.json({ success: false, message: 'Only one active GH content is allowed' }, { status: 409 });
        }
        console.error('PUT /api/gh-content error', err);
        return NextResponse.json({ success: false, message: 'Failed to update GH content' }, { status: 500 });
    }
}
