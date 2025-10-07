"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";
import { Instagram, Facebook, Phone, MapPin, Mail } from "lucide-react";
import { FaTiktok } from "react-icons/fa";
import { SiIndeed } from "react-icons/si";
import Image from "next/image";

/** Footer — "somi" version (safe against empty fetch & preserves prior edits) */
export default function SomiFooter() {
    const [footerData, setFooterData] = useState({
        _id: "",
        ctaTitle: "Start your health journey now",
        ctaDescription:
            "Somi Health offers personalized, clinically guided weight loss solutions to help you achieve lasting results and feel your best.",
        ctaBenefits: [
            { text: "Personalized, clinically guided weight loss", sortOrder: 0 },
            { text: "Lasting results you can maintain", sortOrder: 1 },
            { text: "Find a plan for your goals", sortOrder: 2 },
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
    });
    const [loading, setLoading] = useState(true);

    // Fetch footer data from API
    useEffect(() => {
        const fetchFooterData = async () => {
            try {
                const response = await fetch("/api/footer", { cache: "no-store" });
                if (response.ok) {
                    const data = await response.json();
                    // Merge to preserve default shape
                    setFooterData((prev) => ({ ...prev, ...data }));
                }
            } catch (error) {
                console.error("Error fetching footer data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchFooterData();
    }, []);

    if (loading) {
        return (
            <footer className="relative mt-20 w-full text-white bg-gray-800">
                <div className="mx-auto max-w-6xl px-4 py-12">
                    <div className="flex items-center justify-center h-32">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                    </div>
                </div>
            </footer>
        );
    }

    return (
        <footer
            className="relative mt-20 w-full text-white"
            style={{ backgroundImage: "linear-gradient(#FFFFFF 0 230px, #364C78 230px 100%)" }}
        >
            {/* === TOP CTA CARD === */}
            <section className="mx-auto -mt-24 max-w-7xl px-4 md:px-6">
                <div className="rounded-2xl bg-lightprimary p-6 shadow-2xl ring-1 ring-white/10 sm:pt-8 sm:px-8 md:pt-10 md:px-10">
                    <div className="grid items-center gap-6 md:grid-cols-2">
                        {/* Left copy */}
                        <div className="text-secondary">
                            <h3 className="text-3xl font-SofiaSans leading-snug sm:text-4xl">
                                {footerData.ctaTitle}
                            </h3>
                            {footerData.ctaDescription ? (
                                <p className="mt-3 text-secondary/90 font-SofiaSans text-base sm:text-lg">{footerData.ctaDescription}</p>
                            ) : null}

                            <ul className="mt-6 space-y-3 text-sm sm:text-base">
                                {footerData?.ctaBenefits?.map((benefit, index) => (
                                    <li key={index} className="flex items-start gap-3">
                                        <CheckCircle className="mt-0.5 h-5 w-5 flex-none text-emerald-400" />
                                        <span className="text-secondary/90 font-SofiaSans text-[18px]">{benefit.text}</span>
                                    </li>
                                ))}
                            </ul>

                            <div className="mt-6 flex flex-wrap gap-3">
                                <Link
                                    href={footerData.ctaLearnMoreLink || "#"}
                                    className="fx86 inline-flex font-SofiaSans w-full items-center justify-between border border-darkprimary rounded-3xl bg-transparent text-darkprimary hover:text-lightprimary px-10 py-2 text-base font-semibold shadow-sm md:w-auto"
                                    style={{ "--fx86-base": "transparent", "--fx86-glow": "#364C78" }}
                                >
                                    {footerData.ctaLearnMoreText || "Learn More"}
                                </Link>
                                <Link
                                    href={footerData.ctaStartJourneyLink || "#"}
                                    className="fx-primary inline-flex items-center justify-center gap-2 rounded-full bg-darkprimary px-5 py-2 text-sm font-semibold text-white hover:opacity-90"
                                >
                                    {footerData.ctaStartJourneyText || "Start Your Journey"} <ArrowRight className="h-4 w-4" />
                                </Link>
                            </div>
                        </div>

                        {/* Right image */}
                        <div className="relative flex items-center justify-center">
                            <Image
                                src={footerData.ctaImage || "/hero/footer.png"}
                                alt="Footer Image"
                                width={400}
                                height={400}
                                className="mx-auto rounded-2xl"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* === MAIN FOOTER === */}
            <div className="mx-auto max-w-7xl px-4 pb-10 pt-24 md:px-6">
                <div className="flex flex-col justify-between md:flex-row gap-10 md:gap-10 lg:gap-16">
                    {/* Brand + blurb + socials + badges */}
                    <div>
                        <div className="text-5xl font-extrabold font-tagesschrift tracking-tight">{footerData.brandName}</div>
                        <p className="mt-4 max-w-sm text-sm text-white/80">{footerData.brandTagline}</p>

                        {/* Socials */}
                        <div className="mt-4 flex items-center gap-3">
                            {footerData?.socialLinks?.map((social, index) => {
                                const getIcon = (platform) => {
                                    switch (platform) {
                                        case "instagram":
                                            return <Instagram className="h-5 w-5" />;
                                        case "facebook":
                                            return <Facebook className="h-5 w-5" />;
                                        case "tiktok":
                                            return <FaTiktok className="h-5 w-5" />;
                                        case "indeed":
                                            return <SiIndeed className="h-5 w-5" />;
                                        default:
                                            return null;
                                    }
                                };

                                return (
                                    <Link
                                        key={index}
                                        href={social.url || "#"}
                                        aria-label={social.ariaLabel || social.platform}
                                        className="rounded-full p-2 text-white/80 ring-1 ring-white/20 hover:text-white"
                                    >
                                        {getIcon(social.platform)}
                                    </Link>
                                );
                            })}
                        </div>

                        <h4 className="my-3 text-lg font-semibold">Contact Information</h4>
                        <ul className="space-y-3 text-sm text-white/85">
                            <li className="flex items-start gap-3">
                                <Phone className="mt-0.5 h-4 w-4 flex-none text-white/70" />
                                <a
                                    href={`tel:${footerData?.contactInfo?.phone}`}
                                    className="hover:underline hover:text-white transition"
                                >
                                    {footerData?.contactInfo?.phone}
                                </a>
                            </li>

                            <li className="flex items-start gap-3">
                                <MapPin className="mt-0.5 h-4 w-4 flex-none text-white/70" />
                                <span>{footerData?.contactInfo?.address}</span>
                            </li>

                            <li className="flex items-start gap-3">
                                <Mail className="mt-0.5 h-4 w-4 flex-none text-white/70" />
                                <a
                                    href={`mailto:${footerData?.contactInfo?.email}`}
                                    className="hover:underline hover:text-white transition"
                                >
                                    {footerData?.contactInfo?.email}
                                </a>
                            </li>
                        </ul>

                    </div>

                    {/* Badges */}
                    <div>
                        {footerData?.badges?.map((badge, index) => (
                            <img
                                key={index}
                                src={badge.image}
                                alt={badge.alt}
                                className="h-20 mb-4 w-auto hover:scale-105 transition-transform duration-200"
                            />
                        ))}
                    </div>

                    {/* Navigation */}
                    <div>
                        <h4 className="mb-3 text-lg font-semibold">Navigation</h4>
                        <ul className="space-y-3 text-sm">
                            {footerData?.navigationLinks?.map((link, index) => (
                                <li key={index}>
                                    <FooterLink href={link.href} target={link.target} rel={link.rel}>
                                        {link.text}
                                    </FooterLink>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h4 className="mb-3 text-lg font-semibold">Legal</h4>
                        <ul className="space-y-3 text-sm text-white/85">
                            {footerData?.legalLinks?.map((link, index) => (
                                <li key={index}>
                                    <FooterLink href={link.href}>{link.text}</FooterLink>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </footer>
    );
}

function FooterLink({ href, target, rel, children }) {
    return (
        <Link href={href || "#"} target={target || "_self"} rel={rel || ""} className="text-white/80 hover:text-white underline-offset-4 hover:underline">
            {children}
        </Link>
    );
}

function ArrowRight({ className = "h-4 w-4" }) {
    return (
        <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
            <path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function CheckCircle({ className = "h-5 w-5" }) {
    return (
        <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
            <path d="M8.5 12.5l2.5 2.5L16 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}
