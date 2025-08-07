"use client";

import { ClipboardList, Video, Package } from "lucide-react";
import Link from "next/link";

export default function HowItWorksGnz() {
    return (
        <section className="relative w-full overflow-hidden pt-14">
            {/* soft backdrop */}
            <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(70%_60%_at_50%_0%,hsl(var(--secondary)/.18),transparent_70%)]" />

            {/* Heading */}
            <div className="mx-auto font-SofiaSans max-w-5xl px-4 text-center">
                <p className="text-xs font-semibold tracking-[.18em] text-foreground/60">
                    FEEL STRONGER, HEALTHIER, AND MORE CONFIDENT
                </p>
                <h2 className="mt-3 font-SofiaSans text-3xl font-bold leading-tight sm:text-4xl">
                    How it works <span className="text-secondary">with Somi Health</span>
                </h2>
            </div>

            {/* Steps */}
            <div className="mx-auto mt-20 max-w-6xl px-4">
                <div className="grid gap-8 md:grid-cols-3">
                    <Step
                        eyebrow="Unlock Your Best Self"
                        caption="You deserve this!"
                        icon={<ClipboardList className="h-6 w-6" />}
                        title="1. Take the Questionnaire"
                        text="Fill out a 7-minute questionnaire with your medical history, current health status, and weight-loss needs."
                    />

                    <Step
                        eyebrow="Virtual Help Available"
                        caption="Stay comfortable"
                        icon={<Video className="h-6 w-6" />}
                        title="2. Expert Guidance & Help"
                        text="Our licensed Nurse Practitioner reviews your form, confirms eligibility for GLP-1, and builds a safe, suitable plan."
                    />

                    <Step
                        eyebrow="Fast Shipping"
                        caption="Quick delivery"
                        icon={<Package className="h-6 w-6" />}
                        title="3. Receive Medication in 2–5 Days"
                        text="Once approved, your prescription is sent to the pharmacy. Expect your medication in 2–5 days with clear instructions."
                    />
                </div>

                {/* Optional CTA */}
                <div className="mt-10 flex justify-center">
                    <Link
                        href="/getstarted"
                        className="fx-primary inline-flex items-center gap-2 rounded-full bg-secondary px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/50"
                    >
                        Start your journey
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
                <div className="grid h-12 w-12 place-items-center rounded-full bg-secondary text-white shadow-md ring-2 ring-white/80">
                    {icon}
                </div>
            </div>

            {/* card */}
            <div className="relative rounded-2xl bg-lightprimary h-[200px] border border-border bg-card/70 px-6 pb-6 pt-10 shadow-sm backdrop-blur transition-transform duration-300 group-hover:-translate-y-1 group-hover:shadow-lg">
                {/* small notch */}
                <span className="absolute -top-3 left-1/2 h-6 w-6 bg-lightprimary -translate-x-1/2 rotate-45 rounded-[6px] border border-border bg-card/80 shadow-sm" />

                <h3 className="text-center font-SofiaSans text-xl font-semibold">{title}</h3>
                <p className="mt-3 text-center text-sm leading-6 text-muted-foreground">{text}</p>
            </div>
        </div>
    );
}
