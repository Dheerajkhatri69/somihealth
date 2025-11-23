"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { HeartPulse, ShieldCheck, Sparkles, Wallet, ArrowRight } from "lucide-react";

// Optional: only used if you created it earlier. If not, comment this out and the <NumberTicker> usages.
import NumberTicker from "@/components/NumberTicker";
import HowItWorksGnz from "@/components/hero/HowItworks";
import SomiFooter from "@/components/hero/SomiFooter";
import Navbar from "@/components/hero/Navbar";

// Icon mapping
const iconMap = {
  HeartPulse,
  ShieldCheck,
  Sparkles,
  Wallet
};

export default function AboutPage() {
    const [content, setContent] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchContent();
    }, []);

    const fetchContent = async () => {
        try {
            const res = await fetch('/api/about-page-content');
            const data = await res.json();
            if (data.success) {
                setContent(data.result);
            }
        } catch (error) {
            console.error('Error fetching about page content:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <>
                <Navbar />
                <main className="bg-white text-slate-900">
                    <section className="relative overflow-hidden bg-darkprimary">
                        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-2 md:px-6 lg:py-24">
                            <div className="animate-pulse">
                                <div className="h-6 bg-white/20 rounded mb-4"></div>
                                <div className="h-12 bg-white/20 rounded mb-4"></div>
                                <div className="h-20 bg-white/20 rounded mb-8"></div>
                                <div className="h-10 bg-white/20 rounded"></div>
                            </div>
                            <div className="aspect-[4/3] bg-white/20 rounded-2xl"></div>
                        </div>
                    </section>
                </main>
                <SomiFooter />
            </>
        );
    }

    return (
        <>
            <Navbar />
            <main className="bg-white text-slate-900">
                {/* ====== HERO ====== */}
                {content?.config?.showHero && (
                    <section className="relative overflow-hidden bg-darkprimary">
                        {/* bg accent */}
                        <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
                        <div className="pointer-events-none absolute -right-24 -bottom-24 h-72 w-72 rounded-full bg-black/10 blur-2xl" />

                        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-2 md:px-6 lg:py-24">
                            <div className="relative z-10">
                                <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white/90 ring-1 ring-white/20">
                                    {content?.hero?.badge || 'Somi Health'}
                                </span>
                                <h1 className="mt-4 font-SofiaSans text-4xl leading-tight text-white md:text-5xl">
                                    {content?.hero?.title || 'Somi Health empowers you with real solutions and expert care.'}
                                </h1>
                                <p className="mt-4 max-w-xl text-white/90">
                                    {content?.hero?.subtitle || 'Weight Loss Isn\'t About Willpower—It\'s about getting the right support. We simplify the journey with expert-led care, personalized treatments, and transparent pricing.'}
                                </p>

                                <div className="mt-8 flex flex-wrap gap-3">
                                    <a
                                        href={content?.hero?.primaryButton?.link || '/contact'}
                                        className="fx86 inline-flex items-center gap-3 rounded-full hover:bg-transparent border hover:border-none duration-200 ease-in-out border-white px-5 py-2 font-semibold text-white hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
                                        style={{ "--fx86-base": "transparent" }}
                                    >
                                        {content?.hero?.primaryButton?.text || 'Talk to care team'} <ArrowRight className="h-4 w-4" />
                                    </a>
                                    <a
                                        href={'/pricing'}
                                        className="btn-hero inline-flex items-center gap-2 rounded-3xl bg-lightprimary px-4 py-2 font-semibold text-[#232a3a] shadow-sm ring-1 ring-black/5 hover:opacity-95"
                                    >
                                        {content?.hero?.secondaryButton?.text || 'Explore plans'}
                                    </a>
                                </div>
                            </div>

                            {/* Hero image */}
                            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl ring-1 ring-white/25">
                                <Image
                                    src={content?.hero?.image || '/hero/abouthero.jpg'}
                                    alt={content?.hero?.imageAlt || 'Members of the Somi Health care team'}
                                    fill
                                    className="object-cover"
                                    priority
                                />
                            </div>
                        </div>
                    </section>
                )}

                {/* ====== OUR STORY ====== */}
                {content?.config?.showOurStory && (
                    <section className="mx-auto max-w-6xl px-4 py-16 md:px-6 lg:py-24">
                        <div className="grid gap-10 md:grid-cols-2">
                            <div className="relative overflow-hidden">
                                <Image
                                    src={content?.ourStory?.image || '/hero/aboutstory.png'}
                                    alt={content?.ourStory?.imageAlt || 'Compassionate clinician consulting a patient'}
                                    width={1200}
                                    height={900}
                                    className="h-full w-full object-cover"
                                />
                            </div>

                            <div className="flex flex-col justify-center">
                                <h2 className="font-SofiaSans text-3xl md:text-4xl">
                                    {content?.ourStory?.title || 'Weight loss built on trust, transparency, and connection.'}
                                </h2>
                                <p className="mt-4 text-slate-700">
                                    {content?.ourStory?.paragraph1 || 'At Somi Health, we believe that lasting weight loss starts with trust, transparency, and true connection. We\'re here to simplify your journey with expert-led care, personalized treatments, and clear, upfront pricing—no hidden fees, no confusion.'}
                                </p>
                                <p className="mt-3 text-slate-700">
                                    {content?.ourStory?.paragraph2 || 'Our dedicated team, rooted in compassion and experience, works alongside you to create a healthier, more confident future. Whether you\'re just getting started or ready to take the next big step, we make medical weight loss easier, safer, and more accessible for everyone.'}
                                </p>
                            </div>
                        </div>
                    </section>
                )}

                {/* ====== VALUE CARDS ====== */}
                {content?.config?.showValueCards && (
                    <section className="mx-auto max-w-6xl px-4 pb-8 md:px-6">
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                            {content?.valueCards?.map((card, index) => {
                                const IconComponent = iconMap[card.icon];
                                return (
                                    <ValueCard
                                        key={index}
                                        icon={IconComponent ? <IconComponent className="h-5 w-5" /> : <HeartPulse className="h-5 w-5" />}
                                        title={card.title}
                                        text={card.text}
                                    />
                                );
                            }) || (
                                <>
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
                                </>
                            )}
                        </div>
                    </section>
                )}

                {/* ====== PROOF / STATS ====== */}
                {content?.config?.showStats && (
                    <section className="mx-auto max-w-6xl px-4 py-16 md:px-6 lg:py-24">
                        <div>
                            <h3 className="font-SofiaSans text-3xl md:text-4xl">
                                {content?.stats?.title || 'Care that actually supports you'}
                            </h3>
                            <p className="mt-3 text-slate-700">
                                {content?.stats?.subtitle || 'We blend medical expertise with human connection so your plan is doable—and sustainable.'}
                            </p>

                            {/* Ticker stats */}
                            <div className="mt-8 rounded-3xl border-lightprimary border-2 grid gap-6 sm:grid-cols-3">
                                {content?.stats?.stats?.map((stat, index) => (
                                    <Stat
                                        key={index}
                                        label={stat.label}
                                        value={stat.value}
                                        suffix={stat.suffix}
                                    />
                                )) || (
                                    <>
                                        <Stat
                                            label="Avg. care response time (min)"
                                            value={12}
                                            suffix="m"
                                        />
                                        <Stat label="Personalized plans delivered" value={2500} />
                                        <Stat label="Patient satisfaction" value={98} suffix="%" />
                                    </>
                                )}
                            </div>
                        </div>
                    </section>
                )}

                {/* ====== HOW IT WORKS ====== */}
                {content?.config?.showHowItWorks && (
                    <section className="pb-16 lg:pb-24">
                        <HowItWorksGnz />
                    </section>
                )}

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

