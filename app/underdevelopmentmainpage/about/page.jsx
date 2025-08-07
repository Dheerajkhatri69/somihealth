"use client";

import Image from "next/image";
import { HeartPulse, ShieldCheck, Sparkles, Wallet, ArrowRight } from "lucide-react";

// Optional: only used if you created it earlier. If not, comment this out and the <NumberTicker> usages.
import NumberTicker from "@/components/NumberTicker";
import HowItWorksGnz from "@/components/hero/HowItworks";
import SomiFooter from "@/components/hero/SomiFooter";
import Navbar from "@/components/hero/Navbar";

export default function AboutPage() {
    return (
        <>
            <Navbar />
            <main className="bg-white text-slate-900">
                {/* ====== HERO ====== */}
                <section className="relative overflow-hidden bg-darkprimary">
                    {/* bg accent */}
                    <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
                    <div className="pointer-events-none absolute -right-24 -bottom-24 h-72 w-72 rounded-full bg-black/10 blur-2xl" />

                    <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-2 md:px-6 lg:py-24">
                        <div className="relative z-10">
                            <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white/90 ring-1 ring-white/20">
                                Somi Health
                            </span>
                            <h1 className="mt-4 font-SofiaSans text-4xl leading-tight text-white md:text-5xl">
                                Somi Health empowers you with real solutions and expert care.
                            </h1>
                            <p className="mt-4 max-w-xl text-white/90">
                                Weight Loss Isn’t About Willpower—It’s about getting the right support. We simplify the journey with expert-led care, personalized treatments, and transparent pricing.
                            </p>

                            <div className="mt-8 flex flex-wrap gap-3">
                                <a
                                    href="/contact"
                                    className="fx86 inline-flex items-center gap-3 rounded-full hover:bg-transparent border hover:border-none duration-200 ease-in-out border-white px-5 py-2 font-semibold text-white hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
                                    style={{ "--fx86-base": "transparent" }}

                                >
                                    Talk to care team <ArrowRight className="h-4 w-4" />
                                </a>
                                <a
                                    href="/find-your-plan"
                                    className="btn-hero inline-flex items-center gap-2 rounded-3xl bg-lightprimary px-4 py-2 font-semibold text-[#232a3a] shadow-sm ring-1 ring-black/5 hover:opacity-95"
                                >
                                    Explore plans
                                </a>
                            </div>
                        </div>

                        {/* Hero image (replace src) */}
                        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl ring-1 ring-white/25">
                            <Image
                                src="/hero/abouthero.jpg" // TODO: replace with your image path
                                alt="Members of the Somi Health care team"
                                fill
                                className="object-cover"
                                priority
                            />
                        </div>
                    </div>
                </section>

                {/* ====== OUR STORY ====== */}
                <section className="mx-auto max-w-6xl px-4 py-16 md:px-6 lg:py-24">
                    <div className="grid gap-10 md:grid-cols-2">
                        <div className="relative overflow-hidden">
                            <Image
                                src="/hero/aboutstory.png" // TODO: replace
                                alt="Compassionate clinician consulting a patient"
                                width={1200}
                                height={900}
                                className="h-full w-full object-cover"
                            />
                        </div>

                        <div className="flex flex-col justify-center">
                            <h2 className="font-SofiaSans text-3xl md:text-4xl">
                                Weight loss built on trust, transparency, and connection.
                            </h2>
                            <p className="mt-4 text-slate-700">
                                At Somi Health, we believe that lasting weight loss starts with trust, transparency,
                                and true connection. We’re here to simplify your journey with expert-led care,
                                personalized treatments, and clear, upfront pricing—no hidden fees, no confusion.
                            </p>
                            <p className="mt-3 text-slate-700">
                                Our dedicated team, rooted in compassion and experience, works alongside you to create
                                a healthier, more confident future. Whether you’re just getting started or ready to
                                take the next big step, we make medical weight loss easier, safer, and more accessible
                                for everyone.
                            </p>
                        </div>
                    </div>
                </section>

                {/* ====== VALUE CARDS ====== */}
                <section className="mx-auto max-w-6xl px-4 pb-8 md:px-6">
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        <ValueCard
                            icon={<HeartPulse className="h-5 w-5" />}
                            title="Expert-led Care"
                            text="Clinicians who listen, personalize, and guide you through every step."
                        />
                        <ValueCard
                            icon={<ShieldCheck className="h-5 w-5" />}
                            title="Safe & Transparent"
                            text="Clear dosing, clear expectations, and pricing you can trust."
                        />
                        <ValueCard
                            icon={<Sparkles className="h-5 w-5" />}
                            title="Personalized Plans"
                            text="Treatments tailored to your biology and your goals."
                        />
                        <ValueCard
                            icon={<Wallet className="h-5 w-5" />}
                            title="No Hidden Fees"
                            text="Upfront pricing—no surprises, no confusion."
                        />
                    </div>
                </section>

                {/* ====== PROOF / STATS ====== */}
                <section className="mx-auto max-w-6xl px-4 py-16 md:px-6 lg:py-24">
                    <div>
                        <h3 className="font-SofiaSans text-3xl md:text-4xl">Care that actually supports you</h3>
                        <p className="mt-3 text-slate-700">
                            We blend medical expertise with human connection so your plan is doable—and sustainable.
                        </p>

                        {/* Ticker stats */}
                        <div className="watermark mt-8 rounded-3xl border-lightprimary border-2 grid gap-6 sm:grid-cols-3"
                            data-text="somi"
                            style={{
                                '--wm-size': '160px',     // text size
                                '--wm-stroke-c': '#364c781d',                   // outline color
                                '--wm-stroke-w': '2px',                       // outline width
                                '--wm-fill': 'transparent',                   // set e.g. 'rgba(0,0,0,.06)' for filled text
                                '--wm-font': '"Sofia Sans", ui-sans-serif',      // font family
                                '--wm-weight': 700,                           // font weight
                                '--wm-tracking': '0em',                    // letter spacing
                                '--wm-opacity': 1,                         // overall opacity
                                '--wm-left': '-7rem',                         // horizontal offset
                                '--wm-top': '0rem',                         // horizontal offset
                                '--wm-rotate': '90deg',                       // rotate; use '0deg' for horizontal

                                backgroundImage:
                                    "linear-gradient(#E9ECF1 50%,#FFFFFF 50%)",
                            }}

                        >
                            <Stat
                                label="Avg. care response time (min)"
                                value={12}
                                suffix="m"
                            />
                            <Stat label="Personalized plans delivered" value={2500} />
                            <Stat label="Patient satisfaction" value={98} suffix="%" />
                        </div>
                    </div>

                </section>

                {/* ====== HOW IT WORKS ====== */}
                <section className="mx-auto max-w-6xl px-4 pb-16 md:px-6 lg:pb-24">
                    <HowItWorksGnz />
                </section>

            </main>
            <SomiFooter />
        </>

    );
}

/* ---------- Small components ---------- */

function ValueCard({ icon, title, text }) {
    return (
        <div className="fx-primary rounded-2xl border bg-lightprimary-foreground border-slate-200 p-5 shadow-sm">
            <div className="flex items-center gap-2">
                <div className="rounded-lg bg-[#E9ECF1] p-2 text-[#232a3a]">{icon}</div>
                <h4 className="text-lg font-SofiaSans">{title}</h4>
            </div>
            <p className="mt-2 text-slate-700">{text}</p>
        </div>
    );
}

function Stat({ label, value, suffix = "" }) {
    const hasTicker = typeof NumberTicker === "function";
    return (
        <div className="p-5 text-center">
            <div className="text-4xl font-bold font-SofiaSans text-secondary">
                {hasTicker ? (
                    <NumberTicker value={value} duration={1200} suffix={suffix} />
                ) : (
                    <>
                        {value}
                        {suffix}
                    </>
                )}
            </div>
            <div className="mt-2 text-sm text-slate-600">{label}</div>
        </div>
    );
}

