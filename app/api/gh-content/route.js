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
        glowCompare: {
            title: "Exceptional primary care that gets easier each year",
            firstTitle: "Feature",
            leftTitle: "Traditional",
            rightTitle: "Lemonaid",
            rows: [
                {
                    label: "# of patients per doctor",
                    left: "About 2500 or more. To provide the recommended care to patients, this would require 17+ hours per day!",
                    right: "With Lemonaid, less than 600. This means more time to focus on you and your needs",
                },
                {
                    label: "Time with doctor per visit",
                    left: "Typically have time for 15 minutes of care",
                    right: "Up to 1 hour, or however much time you need",
                },
                {
                    label: "Call, text, and video chat",
                    left: "Very uncommon to recieve virtual care directly from your doctor",
                    right: "Yes, we offer unlimited virtual care for our patients",
                },
                {
                    label: "Time and convenience",
                    left: "The average doctor visit takes 121 minutes devoted to the appointment, including travel, waiting room, payment, and paperwork",
                    right: "After sign up, the average Lemonaid doctor visit typically takes less than 20 minutes",
                },
                {
                    label: "Payments and costs",
                    left: "Your insurance co-pay per visit, and frequent surprise bills",
                    right: "A $99 monthly membership. Nothing more",
                },
                {
                    label: "Availability",
                    left: "The average wait time to see a doctor in the US is 24 days, and rises each year",
                    right: "The average wait time to see a Lemonaid doctor, from any location, is less than 2 days",
                },
            ],
        },

        healthPlans: {
            title: "Health coverage for you and your loved ones",
            subtitle: "Choose the plan that’s right for you, no insurance required",
            image: {
                src: "/hero-family.jpg",
                alt: "Smiling parent with kids",
            },
            plans: [
                {
                    name: "Individual Plan",
                    blurb:
                        "Partnering you with a doctor who really gets to know you, listens to you, and has the time for you. Aligned with your life.",
                    priceLabel: "$99/month",
                    features: [
                        "No additional fees or co-pays",
                        "Cancel anytime in the first 30 days",
                        "Comprehensive one-hour first appointment tailored to your needs",
                        "Message your medical team whenever you want",
                        "All your medical records in one place",
                    ],
                },
                {
                    name: "Family Plan",
                    blurb:
                        "Comprehensive, personalized care for you and your spouse or partner. Add on your kids and other family members.",
                    priceLabel: "Starting at $178/month",
                    features: [
                        "All of the benefits of the Individual Plan",
                        "Share all of your benefits with a spouse or partner",
                        "Add on your kids and other family members later and cover the entire family",
                    ],
                },
            ],
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
            const seeded = new GeneralHealthContent(defaults());
            content = await seeded.save();
        }
        return NextResponse.json({ success: true, result: content });
    } catch (err) {
        console.error('GET /api/gh-content error', err);
        return NextResponse.json({ success: false, message: 'Failed to fetch GH content' }, { status: 500 });
    }
}

// PUT – extend merge logic for new sections
export async function PUT(req) {
    try {
        await connectDB();
        const body = await req.json();

        let doc = await GeneralHealthContent.findOne({ 'config.isActive': true });
        if (!doc) {
            doc = new GeneralHealthContent({ ...defaults(), ...body, config: { isActive: true } });
            await doc.save();
        } else {
            if (body.hero) doc.hero = { ...doc.hero.toObject(), ...body.hero };
            if (body.partner) doc.partner = { ...doc.partner.toObject(), ...body.partner };
            if (body.features) doc.features = { ...doc.features.toObject(), ...body.features };
            if (body.glowCompare) doc.glowCompare = { ...doc.glowCompare.toObject(), ...body.glowCompare };
            if (body.healthPlans) doc.healthPlans = { ...doc.healthPlans.toObject(), ...body.healthPlans };
            if (body.config) doc.config = { ...doc.config.toObject(), ...body.config, isActive: true };

            // Array replacements
            if (Array.isArray(body.partner?.items)) doc.partner.items = body.partner.items;
            if (Array.isArray(body.features?.groups)) doc.features.groups = body.features.groups;
            if (Array.isArray(body.glowCompare?.rows)) doc.glowCompare.rows = body.glowCompare.rows;
            if (Array.isArray(body.healthPlans?.plans)) doc.healthPlans.plans = body.healthPlans.plans;

            // Image object (healthPlans.image) if fully supplied
            if (body.healthPlans?.image) {
                doc.healthPlans.image = { ...doc.healthPlans.image?.toObject?.(), ...body.healthPlans.image };
            }

            await doc.save();
        }

        return NextResponse.json({ success: true, result: doc, message: 'GH content updated' });
    } catch (err) {
        if (err?.code === 11000) {
            return NextResponse.json({ success: false, message: 'Only one active GH content is allowed' }, { status: 409 });
        }
        console.error('PUT /api/gh-content error', err);
        return NextResponse.json({ success: false, message: 'Failed to update GH content' }, { status: 500 });
    }
}