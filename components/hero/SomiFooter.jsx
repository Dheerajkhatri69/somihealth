"use client";

import Link from "next/link";
import React from "react";
import { Instagram, Facebook, Phone, MapPin, Mail } from "lucide-react";
import { FaTiktok } from "react-icons/fa";
import { SiIndeed } from "react-icons/si";
import Image from "next/image";
/** Footer — “somi” version inspired by your screenshot */
export default function SomiFooter() {
    return (
        <footer className="relative mt-20 w-full text-white"
            style={{
                backgroundImage: "linear-gradient(#FFFFFF 0 230px, #364C78 230px 100%)",
            }}
        >
            {/* === TOP CTA CARD === */}
            <section className="mx-auto -mt-24 max-w-6xl px-4 md:px-6">
                <div className="rounded-2xl bg-lightprimary pt-6 px-6 shadow-2xl ring-1 ring-white/10 sm:pt-8 sm:px-8 md:pt-10 md:px-10">
                    <div className="grid items-center gap-6 md:grid-cols-2">
                        {/* Left copy */}
                        <div className="text-secondary">
                            <h3 className="text-3xl font-extrabold font-SofiaSans leading-snug sm:text-4xl">
                                Start your <br /> health journey <br /> now
                            </h3>

                            <ul className="mt-6 space-y-3 text-sm sm:text-base">
                                {[
                                    "Somi Health offers personalized, clinically guided weight loss",
                                    "weight loss solutions to help you achieve lasting results and feel your best.",
                                    "Find a plan personalized for your goals",
                                ].map((t) => (
                                    <li key={t} className="flex items-start gap-3">
                                        <CheckCircle className="mt-0.5 h-5 w-5 flex-none text-emerald-400" />
                                        <span className="text-secondary/90">{t}</span>
                                    </li>
                                ))}
                            </ul>

                            <div className="mt-6 flex flex-wrap gap-3">
                                <Link
                                    href="/learn-more"
                                    // className="inline-flex items-center justify-center rounded-full bg-white/10 px-5 py-2 text-sm font-semibold text-white ring-1 ring-white/15 hover:bg-white/15"
                                    className="fx86 inline-flex font-SofiaSans w-full items-center justify-between border border-darkprimary rounded-3xl bg-transparent text-darkprimary hover:text-lightprimary px-10 py-2 text-base font-semibold shadow-sm md:w-auto"
                                    style={{ "--fx86-base": "transparent", "--fx86-glow": "#364C78" }}
                                >
                                    Learn More
                                </Link>
                                <Link
                                    href="/getstarted"
                                    className="fx-primary inline-flex items-center justify-center gap-2 rounded-full bg-darkprimary px-5 py-2 text-sm font-semibold text-white hover:opacity-90"
                                >
                                    Start Your Journey <ArrowRight className="h-4 w-4" />
                                </Link>
                            </div>
                        </div>

                        {/* Right bottle image (replace src) */}


                        <div className="relative flex items-center justify-center">
                            <Image
                                src="/hero/footer.png"
                                alt="Footer Image"
                                width={400}
                                height={400}
                                className="mx-auto"
                            />
                        </div>
                    </div>

                </div>
            </section>

            {/* === MAIN FOOTER === */}
            <div className="mx-auto max-w-6xl px-4 pb-10 pt-16 md:px-6">
                <div className="flex flex-col justify-between md:flex-row gap-10 md:gap-10 lg:gap-16">
                    {/* Brand + blurb + socials + badges */}
                    <div>
                        <div className="text-5xl font-extrabold font-tagesschrift tracking-tight">somi</div>
                        <p className="mt-4 max-w-sm text-sm text-white/80">
                            Look Batter, Feel Better, Live Better.
                        </p>

                        {/* Socials (Lucide) */}
                        <div className="mt-4 flex items-center gap-3">
                            <Link
                                href="https://instagram.com"
                                aria-label="Instagram"
                                className="rounded-full p-2 text-white/80 ring-1 ring-white/20 hover:text-white"
                            >
                                <Instagram className="h-5 w-5" />
                            </Link>
                            <Link
                                href="https://facebook.com"
                                aria-label="Facebook"
                                className="rounded-full p-2 text-white/80 ring-1 ring-white/20 hover:text-white"
                            >
                                <Facebook className="h-5 w-5" />
                            </Link>
                            <Link
                                href="https://tiktok.com"
                                aria-label="Facebook"
                                className="rounded-full p-2 text-white/80 ring-1 ring-white/20 hover:text-white"
                            >
                                <FaTiktok className="h-5 w-5" />
                            </Link>
                            <Link
                                href="https://tiktok.com"
                                aria-label="Facebook"
                                className="rounded-full p-2 text-white/80 ring-1 ring-white/20 hover:text-white"
                            >
                                <SiIndeed className="h-5 w-5" />
                            </Link>

                        </div>

                        <h4 className="my-3 text-lg font-semibold">Contact Information</h4>
                        <ul className="space-y-3 text-sm text-white/85">
                            <li className="flex items-start gap-3">
                                <Phone className="mt-0.5 h-4 w-4 flex-none text-white/70" />
                                <span>(704) 386-6871</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <MapPin className="mt-0.5 h-4 w-4 flex-none text-white/70" />
                                <span>4111 E. Rose Lake Dr. Charlotte, NC 28217</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Mail className="mt-0.5 h-4 w-4 flex-none text-white/70" />
                                <span>info@joinsomi.com</span>
                            </li>
                        </ul>
                    </div>
                    <div >
                        <img
                            src="/hero/legitscript-badge.png"
                            alt="LegitScript Certified"
                            className="h-20 mb-4 w-auto hover:scale-105 transition-transform duration-200"
                        />
                        <img
                            src="/hero/hipaa-badge.png"
                            alt="hipaa-badge"
                            className="h-20 w-auto hover:scale-105 transition-transform duration-200"
                        />
                    </div>
                    {/* Navigation */}
                    <div>
                        <h4 className="mb-3 text-lg font-semibold">Navigation</h4>
                        <ul className="space-y-3 text-sm">
                            <li><FooterLink href="/referrals">Referrals</FooterLink></li>
                            <li>
                                <FooterLink
                                    href="/docs/patient-glp1-packet.pdf"
                                    target="_blank"           // opens in new tab (remove if you want same tab)
                                    rel="noopener noreferrer" // security hygiene
                                >
                                    Patient GLP-1 Packet
                                </FooterLink>
                            </li>
                            <li><FooterLink href="/underdevelopmentmainpage/about">About Us</FooterLink></li>
                            <li><FooterLink href="/underdevelopmentmainpage/contact">Contact Us</FooterLink></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="mb-3 text-lg font-semibold">Legal</h4>
                        <ul className="space-y-3 text-sm text-white/85">
                            <li><FooterLink href="/underdevelopmentmainpage/footer/hipaa">HIPAA Privacy</FooterLink></li>
                            <li><FooterLink href="/underdevelopmentmainpage/footer/terms">Terms of Service</FooterLink></li>
                            <li><FooterLink href="/underdevelopmentmainpage/footer/shipping-returns">Shipping & Returns</FooterLink></li>
                            <li><FooterLink href="/underdevelopmentmainpage/footer/telehealth-consent">Telehealth Consent</FooterLink></li>
                            <li><FooterLink href="/underdevelopmentmainpage/footer/cookies">Cookie Policy</FooterLink></li>
                        </ul>
                    </div>

                </div>


            </div>
        </footer>
    );
}

/* ------------ tiny helpers & icons ------------- */

function FooterLink({ href, children }) {
    return (
        <Link
            href={href}
            className="text-white/80 hover:text-white underline-offset-4 hover:underline"
        >
            {children}
        </Link>
    );
}

function ArrowRight({ className = "h-4 w-4" }) {
    return (
        <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
            <path
                d="M5 12h14M13 5l7 7-7 7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function CheckCircle({ className = "h-5 w-5" }) {
    return (
        <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
            <path
                d="M8.5 12.5l2.5 2.5L16 10"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}
