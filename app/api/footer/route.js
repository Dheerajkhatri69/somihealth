import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Footer from "@/lib/model/footer";
import { connectionSrt } from "@/lib/db";

async function connectDB() {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(connectionSrt);
  }
}

export async function GET() {
  try {
    await connectDB();
    const footerData = await Footer.findOne({ isActive: true }).lean();

    if (!footerData) {
      // default payload
      const def = {
        ctaTitle: "Start your health journey now",
        ctaDescription:
          "Somi Health offers personalized, clinically guided weight loss solutions to help you achieve lasting results and feel your best.",
        ctaBenefits: [
          { text: "Somi Health offers personalized, clinically guided weight loss", sortOrder: 0 },
          { text: "weight loss solutions to help you achieve lasting results and feel your best.", sortOrder: 1 },
          { text: "Find a plan personalized for your goals", sortOrder: 2 },
        ],
        ctaLearnMoreText: "Learn More",
        ctaLearnMoreLink: "/learn-more",
        ctaStartJourneyText: "Start Your Journey",
        ctaStartJourneyLink: "/getstarted",
        ctaImage: "/hero/footer.png",
        brandName: "somi",
        brandTagline: "Look Better, Feel Better, Live Better.",
        socialLinks: [
          { platform: "instagram", url: "https://instagram.com", ariaLabel: "Instagram" },
          { platform: "facebook", url: "https://facebook.com", ariaLabel: "Facebook" },
          { platform: "tiktok", url: "https://tiktok.com", ariaLabel: "TikTok" },
          { platform: "indeed", url: "https://indeed.com", ariaLabel: "Indeed" },
        ],
        contactInfo: {
          phone: "(704) 386-6871",
          address: "4111 E. Rose Lake Dr. Charlotte, NC 28217",
          email: "info@joinsomi.com",
        },
        badges: [
          { name: "LegitScript", image: "/hero/legitscript-badge.png", alt: "LegitScript Certified", sortOrder: 0 },
          { name: "HIPAA", image: "/hero/hipaa-badge.png", alt: "HIPAA Certified", sortOrder: 1 },
        ],
        navigationLinks: [
          { text: "Referrals", href: "/referrals", target: "_self", rel: "", sortOrder: 0 },
          { text: "Patient GLP-1 Packet", href: "/docs/patient-glp1-packet.pdf", target: "_blank", rel: "noopener noreferrer", sortOrder: 1 },
          { text: "About Us", href: "/underdevelopmentmainpage/about", target: "_self", rel: "", sortOrder: 2 },
          { text: "Contact Us", href: "/underdevelopmentmainpage/contact", target: "_self", rel: "", sortOrder: 3 },
        ],
        legalLinks: [
          { text: "HIPAA Privacy", href: "/underdevelopmentmainpage/footer/hipaa", sortOrder: 0 },
          { text: "Terms of Service", href: "/underdevelopmentmainpage/footer/terms", sortOrder: 1 },
          { text: "Shipping & Returns", href: "/underdevelopmentmainpage/footer/shipping-returns", sortOrder: 2 },
          { text: "Telehealth Consent", href: "/underdevelopmentmainpage/footer/telehealth-consent", sortOrder: 3 },
          { text: "Cookie Policy", href: "/underdevelopmentmainpage/footer/cookies", sortOrder: 4 },
        ],
      };
      return NextResponse.json(def);
    }

    // enforce stable ordering by sortOrder when present
    const byOrder = (a, b) => (a?.sortOrder ?? 0) - (b?.sortOrder ?? 0);
    if (footerData.ctaBenefits) footerData.ctaBenefits = [...footerData.ctaBenefits].sort(byOrder);
    if (footerData.badges) footerData.badges = [...footerData.badges].sort(byOrder);
    if (footerData.navigationLinks) footerData.navigationLinks = [...footerData.navigationLinks].sort(byOrder);
    if (footerData.legalLinks) footerData.legalLinks = [...footerData.legalLinks].sort(byOrder);

    return NextResponse.json(footerData);
  } catch (error) {
    console.error("Error fetching footer data:", error);
    return NextResponse.json({ error: "Failed to fetch footer data" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const data = await request.json();

    // deactivate previous active
    await Footer.updateMany({ isActive: true }, { isActive: false });

    const footerDoc = new Footer({ ...data, isActive: true });
    const saved = await footerDoc.save();
    return NextResponse.json(saved.toObject());
  } catch (error) {
    console.error("Error saving footer data:", error);
    return NextResponse.json({ error: "Failed to save footer data" }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    await connectDB();
    const data = await request.json();

    const query = data?._id ? { _id: data._id } : { isActive: true };

    const updated = await Footer.findOneAndUpdate(
      query,
      { $set: data },
      { new: true, runValidators: true, omitUndefined: true }
    ).lean();

    if (!updated) {
      return NextResponse.json({ error: "No active footer found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating footer data:", error);
    return NextResponse.json({ error: "Failed to update footer data" }, { status: 500 });
  }
}
