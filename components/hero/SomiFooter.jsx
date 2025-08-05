"use client";

import Link from "next/link";
import React from "react";
import { Instagram, Facebook, Phone, MapPin, Mail } from "lucide-react";
/** Footer — “somi” version inspired by your screenshot */
export default function SomiFooter() {
    return (
        <footer className="relative mt-20 w-full text-white"
            style={{
                backgroundImage: "linear-gradient(#FFFFFF 0 230px, #2c3a57 230px 100%)",
            }}
        >
            {/* === TOP CTA CARD === */}
            <section className="mx-auto -mt-24 max-w-6xl px-4 md:px-6">
                <div className="rounded-2xl bg-lightprimary p-6 shadow-2xl ring-1 ring-white/10 sm:p-8 md:p-10">
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
                                    style={{ "--fx86-base": "transparent", "--fx86-glow": "#2c3a57" }}
                                >
                                    Learn More
                                </Link>
                                <Link
                                    href="/get-started"
                                    className="fx-primary inline-flex items-center justify-center gap-2 rounded-full bg-secondary px-5 py-2 text-sm font-semibold text-white hover:opacity-90"
                                >
                                    Start Your Journey <ArrowRight className="h-4 w-4" />
                                </Link>
                            </div>
                        </div>

                        {/* Right bottle image (replace src) */}
                        <div className="relative flex items-center justify-center">
                            <img
                                src="/hero/newsemaglutide.png" // <- replace with your image path
                                alt="Compounded Semaglutide vial"
                                className="h-72 w-auto object-contain md:h-80"
                            />
                        </div>
                    </div>

                </div>
            </section>

            {/* === MAIN FOOTER === */}
            <div className="mx-auto max-w-6xl px-4 pb-10 pt-16 md:px-6">
                <div className="grid gap-10 md:grid-cols-3">
                    {/* Brand + blurb + socials + badges */}
                    <div>
                        <div className="text-3xl font-extrabold tracking-tight">somi</div>
                        <p className="mt-4 max-w-sm text-sm text-white/80">
                            Somi Health offers personalized, clinically guided weight loss
                            solutions to help you achieve lasting results and feel your best.
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
                        </div>

                        {/* Badges (swap src paths) */}
                        <div className="mt-6 flex items-center gap-6">
                            <img
                                src="/hero/legitscript-badge.png"
                                alt="LegitScript Certified"
                                className="h-12 w-auto"
                            />
                            <img
                                src="/hero/us-badge.png"
                                alt="Compounded in the USA"
                                className="h-8 w-auto"
                            />
                            <img
                                src="/hero/hipaa-badge.png"
                                alt="HIPAA Compliant"
                                className="h-8 w-auto"
                            />
                        </div>
                    </div>

                    {/* Navigation */}
                    <div>
                        <h4 className="mb-3 text-lg font-semibold">Navigation</h4>
                        <ul className="space-y-3 text-sm">
                            <li><FooterLink href="/referrals">Referrals</FooterLink></li>
                            <li><FooterLink href="/patient-glp1-packet">Patient GLP-1 Packet</FooterLink></li>
                            <li><FooterLink href="/about">About Us</FooterLink></li>
                            <li><FooterLink href="/contact">Contact Us</FooterLink></li>
                        </ul>
                    </div>

                    {/* Contact Information */}
                    <div>
                        <h4 className="mb-3 text-lg font-semibold">Contact Information</h4>
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
                </div>

                {/* Bottom legal row */}
                <div className="mt-10 border-t border-white/15 pt-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <p className="text-xs text-white/70">Website Designed by --------------</p>
                        {/* <p className="text-xs text-white/70">Website Designed by Dheeraj Khatri</p> */}
                        <ul className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs">
                            <li><FooterLink href="/hipaa">HIPAA Privacy</FooterLink></li>
                            <li><FooterLink href="/terms">Terms of Service</FooterLink></li>
                            <li><FooterLink href="/shipping-returns">Shipping &amp; Returns</FooterLink></li>
                            <li><FooterLink href="/telehealth-consent">Telehealth Consent</FooterLink></li>
                            <li><FooterLink href="/cookies">Cookie Policy</FooterLink></li>
                        </ul>
                    </div>

                    <div className="mt-4 text-xs text-white/70">
                        © {new Date().getFullYear()}, Somi. All rights reserved
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
