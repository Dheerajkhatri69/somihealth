"use client";

import { useEffect, useState } from "react";
import { ClipboardList, Video, Package } from "lucide-react";
import Link from "next/link";

export default function HowItWorksGnz() {
    const [content, setContent] = useState({
        eyebrow: 'FEEL STRONGER, HEALTHIER, AND MORE CONFIDENT',
        mainTitle: 'How it works with Somi Health',
        mainTitleHighlight: 'with Somi Health',
        steps: [],
        ctaText: 'Start your journey',
        ctaLink: '/getstarted'
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchContent();
    }, []);

    async function fetchContent() {
        setLoading(true);
        try {
            const res = await fetch('/api/howitworks', { cache: 'no-store' });
            const data = await res.json();

            if (data?.success) {
                setContent(data.result);
            }
        } catch (error) {
            console.error('Error fetching How It Works content:', error);
        } finally {
            setLoading(false);
        }
    }

    // Fallback content if API fails
    const fallbackContent = {
        eyebrow: 'FEEL STRONGER, HEALTHIER, AND MORE CONFIDENT',
        mainTitle: 'How it works with Somi Health',
        mainTitleHighlight: 'with Somi Health',
        steps: [
            {
                eyebrow: 'Unlock Your Best Self',
                caption: 'You deserve this!',
                title: '1. Take the Questionnaire',
                description: 'Fill out a 7-minute questionnaire with your medical history, current health status, and weight-loss needs.',
                icon: 'ClipboardList'
            },
            {
                eyebrow: 'Virtual Help Available',
                caption: 'Stay comfortable',
                title: '2. Expert Guidance & Help',
                description: 'Our licensed Nurse Practitioner reviews your form, confirms eligibility for GLP-1, and builds a safe, suitable plan.',
                icon: 'Video'
            },
            {
                eyebrow: 'Fast Shipping',
                caption: 'Quick delivery',
                title: '3. Receive Medication in 2–5 Days',
                description: 'Once approved, your prescription is sent to the pharmacy. Expect your medication in 2–5 days with clear instructions.',
                icon: 'Package'
            }
        ],
        ctaText: 'Start your journey',
        ctaLink: '/getstarted'
    };

    const displayContent = loading ? fallbackContent : content;

    if (loading) {
        return (
            <section className="relative w-full overflow-hidden pt-14">
                <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(70%_60%_at_50%_0%,hsl(var(--secondary)/.18),transparent_70%)]" />
                <div className="mx-auto font-SofiaSans max-w-5xl px-4 text-center">
                    <div className="h-6 w-3/4 mx-auto rounded bg-gray-200 animate-pulse" />
                    <div className="mt-3 h-8 w-full rounded bg-gray-200 animate-pulse" />
                </div>
                <div className="mx-auto mt-20 max-w-6xl px-4">
                    <div className="grid gap-8 md:grid-cols-3">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="h-64 rounded-2xl bg-gray-200 animate-pulse" />
                        ))}
                    </div>
                </div>
            </section>
        );
    }
    return (
        <section className="relative w-full overflow-hidden pt-14">
            {/* soft backdrop */}
            <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(70%_60%_at_50%_0%,hsl(var(--secondary)/.18),transparent_70%)]" />

            {/* Heading */}
            <div className="mx-auto font-SofiaSans max-w-5xl px-4 text-center">
                <p className="text-xs font-semibold tracking-[.18em] text-foreground/60">
                    {displayContent.eyebrow}
                </p>
                <h2 className="mt-3 font-SofiaSans text-3xl leading-tight sm:text-4xl text-darkprimary">
                    {displayContent.mainTitle.replace(displayContent.mainTitleHighlight, '')}
                    <span className="text-darkprimary">{displayContent.mainTitleHighlight}</span>
                </h2>
            </div>

            {/* Steps */}
            <div className="mx-auto mt-20 max-w-6xl px-4">
                <div className="grid gap-8 md:grid-cols-3">
                    {displayContent.steps.map((step, index) => {
                        const IconComponent = step.icon === 'ClipboardList' ? ClipboardList :
                            step.icon === 'Video' ? Video : Package;
                        return (
                            <Step
                                key={index}
                                eyebrow={step.eyebrow}
                                caption={step.caption}
                                icon={<IconComponent className="h-6 w-6" />}
                                title={step.title}
                                text={step.description}
                            />
                        );
                    })}
                </div>

                {/* Optional CTA */}
                <div className="mt-10 flex justify-center">
                    <Link
                        href={displayContent.ctaLink}
                        className="fx-primary inline-flex items-center gap-2 rounded-full bg-darkprimary px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/50"
                    >
                        {displayContent.ctaText}
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <path
                                d="M5 12h14M13 5l7 7-7 7"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </Link>
                </div>
            </div>
        </section>
    );
}

/* ---------- single step card ---------- */
function Step({ eyebrow, caption, icon, title, text }) {
    return (
        <div className="group relative ">
            {/* eyebrow + caption */}
            <div className="mb-4 text-center">
                <div className="font-semibold text-foreground">{eyebrow}</div>
                <div className="text-sm text-muted-foreground">{caption}</div>
            </div>

            {/* icon bubble (floats above the card) */}
            <div className="absolute -top-14 left-1/2 z-10 -translate-x-1/2">
                <div className="grid h-12 w-12 place-items-center rounded-full bg-white text-darkprimary shadow-md ring-2 ring-white/80">
                    {icon}
                </div>
            </div>

            {/* card */}
            <div className="relative rounded-2xl bg-white h-[200px] border border-border border-darkprimary bg-card/70 px-6 pb-6 pt-10 shadow-sm backdrop-blur transition-transform duration-300 group-hover:-translate-y-1 group-hover:shadow-lg">
                {/* small notch */}
                <span
                    className="absolute -top-3 left-1/2 h-6 w-6 -translate-x-1/2 rotate-45 rounded-[6px]"
                    style={{
                        background: 'linear-gradient(135deg, #364C78 50%, white 50%)',
                    }}
                />


                <h3 className="text-center font-SofiaSans text-xl font-semibold text-darkprimary">{title}</h3>
                <p className="mt-3 text-center font-SofiaSans text-[18px] sm:text[16px] leading-7 text-gray-700">{text}</p>
            </div>
        </div>
    );
}
