"use client";

import React, { useState } from "react";

/** Pro FAQ (answers fully hidden when closed, updated footer) */
export default function FaqPro() {
    const heading =
        "Find clear, honest answers about our medical weight loss treatments";
    const subheading =
        "Your Questions, Answered— Every Step of the Way.";

    const faqs = [
        {
            q: "How do I get started with Somi Health’s weight loss program?",
            a: "You can begin by completing a quick 7-minute questionnaire, which gathers important information about your medical history, health status, and weight loss goals.",
        },
        {
            q: "What happens after I submit the questionnaire?",
            a: "Once you complete the form, our licensed Nurse Practitioner will review your information to determine your eligibility for GLP-1 or GIP/GLP-1 treatment.",
        },
        {
            q: "How long does it take to receive my medication?",
            a: "After approval, your prescription is sent to the pharmacy, and you will receive your medication within 2–5 days, along with complete usage instructions.",
        },
        {
            q: "Are the medications safe and effective?",
            a: "Yes, the medications we use, including Compounded Semaglutide and Compounded Tirzepatide, are clinically proven to be safe and effective when prescribed and monitored by a healthcare provider.",
        },
        {
            q: "What are the benefits of using Somi Health’s medical weight loss services?",
            a: "We provide regular health monitoring, personalized treatment plans, reduced risk of side effects, and continuous support from our healthcare team throughout your journey.",
        },
        {
            q: "How much weight can I expect to lose with Compounded Tirzepatide?",
            a: "Studies show that patients using Compounded Tirzepatide can expect a weight loss of approximately 20%–30% of their starting body weight with consistent use and proper medical supervision.",
        },
    ];

    const [open, setOpen] = useState(() => new Set([0]));
    const toggle = (idx) =>
        setOpen((prev) => {
            const next = new Set(prev);
            next.has(idx) ? next.delete(idx) : next.add(idx);
            return next;
        });
    const expandAll = () => setOpen(new Set(faqs.map((_, i) => i)));
    const collapseAll = () => setOpen(new Set());

    return (
        <section className="relative isolate w-full overflow-hidden py-12 sm:py-16">

            <div className="mx-auto max-w-6xl px-4 md:px-6">
                <div className="grid items-start gap-10 md:grid-cols-3">
                    {/* Left */}
                    <div className="md:sticky md:top-8 font-SofiaSans">
                        <span className="inline-flex items-center gap-2 rounded-full bg-secondary/10 px-3 py-1 text-xs font-semibold text-secondary">
                            <ShieldIcon className="h-4 w-4" /> FAQ
                        </span>
                        <h2 className="mt-3 text-2xl font-bold sm:text-3xl">{heading}</h2>
                        <p className="mt-2 text-sm font-semibold text-secondary sm:text-base">
                            {subheading}
                        </p>

                        <ul className="mt-5 space-y-2 text-sm text-gray-600">
                            <li className="flex items-center gap-2">
                                <CheckIcon className="h-5 w-5 text-emerald-600" />
                                Trusted clinical guidance
                            </li>
                            <li className="flex items-center gap-2">
                                <CheckIcon className="h-5 w-5 text-emerald-600" />
                                Transparent process & pricing
                            </li>
                            <li className="flex items-center gap-2">
                                <CheckIcon className="h-5 w-5 text-emerald-600" />
                                Fast 2–5 day delivery after approval
                            </li>
                        </ul>
                    </div>

                    {/* Right */}
                    <div className="md:col-span-2">
                        <div className="mb-3 flex items-center justify-end gap-2">
                            <button
                                onClick={expandAll}
                                className="rounded-full border px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                            >
                                Expand all
                            </button>
                            <button
                                onClick={collapseAll}
                                className="rounded-full border px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                            >
                                Collapse all
                            </button>
                        </div>

                        <div className="overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-black/5">
                            <div className="h-1 w-full bg-gradient-to-r from-secondary/70 via-secondary to-secondary/70" />

                            <ul className="divide-y">
                                {faqs.map((item, idx) => {
                                    const isOpen = open.has(idx);
                                    const panelId = `faq-panel-${idx}`;
                                    const btnId = `faq-button-${idx}`;

                                    return (
                                        <li key={idx} className="group">
                                            <button
                                                id={btnId}
                                                type="button"
                                                aria-controls={panelId}
                                                aria-expanded={isOpen}
                                                onClick={() => toggle(idx)}
                                                className={`flex w-full items-start gap-4 px-5 py-4 text-left transition-colors sm:px-6 ${isOpen ? "bg-secondary/3" : "hover:bg-gray-50"
                                                    }`}
                                            >
                                                <span className="mt-2 block h-2 w-2 flex-shrink-0 rounded-full bg-secondary/70" />
                                                <span className="flex-1 pr-6 text-base font-semibold sm:text-lg font-SofiaSans">
                                                    {item.q}
                                                </span>
                                                <PlusMinusIcon open={isOpen} />
                                            </button>

                                            {/* Answer: fully hidden when closed */}
                                            {isOpen ? (
                                                <div
                                                    id={panelId}
                                                    role="region"
                                                    aria-labelledby={btnId}
                                                    className="px-5 pb-5 pl-7 pr-6 text-sm leading-6 text-gray-700 sm:px-6 sm:pl-8 sm:text-base"
                                                >
                                                    {item.a}
                                                </div>
                                            ) : null}
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>

                        {/* New footer callout */}
                        <div className="mt-6 flex flex-col items-start justify-between gap-4 rounded-2xl bg-white p-5 shadow-lg ring-1 ring-black/5 sm:flex-row sm:items-center sm:p-6">
                            <div>
                                <h3 className="text-base font-semibold text-gray-900">
                                    Still have questions?
                                </h3>
                                <p className="mt-1 text-sm text-gray-600">
                                    Cant find the answer youre looking for? Please chat to our friendly team.
                                </p>
                            </div>
                            <a
                                href="/contact"
                                className="fx-primary  inline-flex items-center gap-2 rounded-full bg-secondary px-5 py-2 text-sm font-semibold text-white hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/60"
                            >
                                Get in touch
                                <ArrowRight />
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

/* ===== Icons ===== */
function PlusMinusIcon({ open }) {
    return (
        <span
            className={`relative mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full ring-1 ring-gray-300 transition-colors ${open ? "bg-secondary text-white ring-secondary/60" : "bg-white text-gray-700"
                }`}
            aria-hidden="true"
        >
            <span
                className={`absolute h-3.5 w-0.5 rounded-sm transition-opacity ${open ? "opacity-0" : "opacity-100"
                    }`}
                style={{ backgroundColor: "currentColor" }}
            />
            <span
                className="absolute h-0.5 w-3.5 rounded-sm"
                style={{ backgroundColor: "currentColor" }}
            />
        </span>
    );
}
function ShieldIcon({ className = "h-5 w-5" }) {
    return (
        <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
            <path d="M12 2l7 3v6c0 5.55-3.84 8.97-7 10-3.16-1.03-7-4.45-7-10V5l7-3z" />
            <path d="M10.5 12.5l-1.5-1.5L8 12l2.5 2.5L16 9l-1-1-4.5 4.5z" fill="white" />
        </svg>
    );
}
function CheckIcon({ className = "h-5 w-5 text-emerald-600" }) {
    return (
        <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
            <path d="M9 16.2l-3.5-3.5-1.4 1.4L9 19 20.3 7.7 18.9 6.3z" />
        </svg>
    );
}
function ArrowRight() {
    return (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}
