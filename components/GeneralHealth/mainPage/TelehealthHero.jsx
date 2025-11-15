// app/components/TelehealthHero.jsx
"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";

const TELEHEALTH_CONTENT = {
    bannerNote: "Use this service for anything not listed on our",
    bannerLinkLabel: "homepage",
    bannerLinkHref: "/underdevelopmentmainpage",
    title: "Talk to our medical team online today",
    subtitle:
        "Connect directly with a doctor or nurse practitioner for any of your health concerns, right from the safety of your home.",
    ctaLabel: "Get started",
    ctaHref: "/getstarted",
    priceText: "$75/visit",

    // Image URL (put this file in your /public folder)
    heroImage: "/telehealth-hero.png",
};

export default function TelehealthHero({ content = TELEHEALTH_CONTENT }) {
    const {
        bannerNote,
        bannerLinkLabel,
        bannerLinkHref,
        title,
        subtitle,
        ctaLabel,
        ctaHref,
        priceText,
        heroImage,
    } = content;

    return (
        <section className="relative w-full font-SofiaSans bg-white">
            {/* Top banner */}
            <div className="w-full bg-amber-100 text-center text-base md:text-xl text-black py-3 px-4">
                <span>{bannerNote} </span>
                <Link
                    href={bannerLinkHref}
                    className="hover:underline font-medium hover:opacity-80 text-darkprimary-foreground"
                >
                    {bannerLinkLabel}
                </Link>
            </div>

            {/* Main hero */}
            <div className="max-w-7xl mx-auto px-6 py-24 md:py-28 grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
                {/* Left: text content */}
                <motion.div
                    initial={{ opacity: 0, x: -40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    className="flex flex-col justify-center"
                >
                    <h1 className="text-3xl sm:text-4xl lg:text-6xl font-semibold text-darkprimary leading-tight mb-6">
                        {title}
                    </h1>

                    <p className="text-base sm:text-xl lg:text-2xl text-slate-700 mb-10">
                        {subtitle}
                    </p>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                        <motion.div
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.96, y: 0 }}
                        >
                            <Link
                                href={ctaHref}
                                className="fx-primary rounded-full bg-darkprimary px-10 py-3 text-lg font-semibold text-white shadow-md shadow-darkprimary/40 hover:shadow-lg hover:shadow-darkprimary/60 transition-all"
                            >
                                {ctaLabel}
                            </Link>
                        </motion.div>

                        <span className="text-3xl font-medium text-slate-900">
                            {priceText}
                        </span>
                    </div>
                </motion.div>

                {/* Right: hero image */}
                <motion.div
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
                    className="relative flex items-center justify-center"
                >
                    <div className="relative w-full max-w-md aspect-square">
                        {/* Soft glow behind image */}
                        <div className="absolute inset-0 rounded-3xl bg-darkprimary/10 blur-2xl scale-110" />
                        <Image
                            src={heroImage}
                            alt="Telehealth hero"
                            fill
                            className="relative rounded-3xl object-cover shadow-xl shadow-slate-300/70"
                            sizes="(min-width: 1024px) 400px, 80vw"
                        />
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
