"use client";

import React from "react";

export default function GlowCompare({
    title = "Exceptional primary care that gets easier each year",
    firstTitle = "Feature",
    leftTitle = "Traditional",
    rightTitle = "Lemonaid",
    rows = DEFAULT_ROWS,
}) {
    return (
        <section className="relative isolate">
            <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-white font-SofiaSans" />
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
                <header className="text-center">
                    <h2 className="text-3xl sm:text-4xl tracking-tight text-darkprimary drop-shadow-md">
                        {title}
                    </h2>
                </header>

                {/* desktop grid */}
                <div className="mt-8 hidden md:grid [grid-template-columns:26%_37%_37%] gap-4">
                    <ColumnHeader title={firstTitle} />
                    <ColumnHeader title={leftTitle} />
                    <ColumnHeader title={rightTitle} />

                    {rows.map((r, i) => (
                        <React.Fragment key={i}>
                            <FeatureCell label={r.label} />
                            <ValueCell value={r.left} />
                            <ValueCell value={r.right} />
                        </React.Fragment>
                    ))}
                </div>

                {/* mobile: connected bands + side-by-side white cards */}
                <div className="mt-8 md:hidden">
                    <div className="rounded-2xl border-l-2 border-r-2 border-darkprimary overflow-hidden">
                        {rows.map((r, i) => {
                            const isFirst = i === 0;
                            const isLast = i === rows.length - 1;
                            return (
                                <div key={i} className="w-full">
                                    {/* band header (connected) */}
                                    <div
                                        className={[
                                            "w-full bg-darkprimary-foreground/20 text-darkprimary text-center font-semibold",
                                            "px-4 py-3 text-base",
                                            !isFirst && "",
                                            isFirst && "rounded-t-2xl",
                                            isLast && "rounded-b-none", // band connects to cards below
                                        ]
                                            .filter(Boolean)
                                            .join(" ")}
                                    >
                                        {r.label}
                                    </div>

                                    {/* two cards side-by-side */}
                                    <div
                                        className={[
                                            "grid grid-cols-2 bg-darkprimary-foreground/20",
                                            !isLast && "border-b border-darkprimary/10", // subtle divider between sections
                                        ]
                                            .filter(Boolean)
                                            .join(" ")}
                                    >
                                        <div className="rounded-tl-xl bg-white backdrop-blur-[1px] p-3">
                                            <div className="text-[11px] font-semibold uppercase tracking-wide text-darkprimary">
                                                {leftTitle}
                                            </div>
                                            <div className="mt-1 text-sm text-darkprimary/90 leading-relaxed">
                                                {r.left}
                                            </div>
                                        </div>
                                        <div className="rounded-tr-xl bg-white p-3 shadow-sm">
                                            <div className="text-[11px] font-semibold uppercase tracking-wide text-darkprimary">
                                                {rightTitle}
                                            </div>
                                            <div className="mt-1 text-sm text-darkprimary/90 leading-relaxed">
                                                {r.right}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}

/* ---------- Components (desktop) ---------- */
function ColumnHeader({ title }) {
    return (
        <div className="rounded-2xl border-l-2 border-r-2 border-darkprimary bg-darkprimary-foreground/20 px-5 py-4 text-center text-base md:text-lg font-bold text-darkprimary shadow-sm">
            {title}
        </div>
    );
}

function FeatureCell({ label }) {
    return (
        <div className="flex items-center rounded-2xl border-l-2 border-r-2 border-darkprimary bg-darkprimary-foreground/20 px-5 py-4 text-darkprimary break-words">
            <span className="text-base md:text-lg font-semibold">{label}</span>
        </div>
    );
}

function ValueCell({ value }) {
    return (
        <div className="rounded-2xl border-l-2 border-r-2 border-darkprimary bg-white shadow-lg px-5 py-4 text-darkprimary text-base md:text-lg leading-relaxed">
            {value}
        </div>
    );
}

/* ---------- Demo Data ---------- */
const DEFAULT_ROWS = [
    {
        label: "# of patients per doctor",
        left:
            "About 2500 or more. To provide the recommended care to patients, this would require 17+ hours per day!",
        right:
            "With Lemonaid, less than 600. This means more time to focus on you and your needs",
    },
    {
        label: "Time with doctor per visit",
        left: "Typically have time for 15 minutes of care",
        right: "Up to 1 hour, or however much time you need",
    },
    {
        label: "Call, text, and video chat",
        left: "Very uncommon to recieve virtual care directly from your doctor",
        right: "Yes, we offer unlimited virtual care for our patients",
    },
    {
        label: "Time and convenience",
        left:
            "The average doctor visit takes 121 minutes devoted to the appointment, including travel, waiting room, payment, and paperwork",
        right:
            "After sign up, the average Lemonaid doctor visit typically takes less than 20 minutes",
    },
    {
        label: "Payments and costs",
        left: "Your insurance co-pay per visit, and frequent surprise bills",
        right: "A $99 monthly membership. Nothing more",
    },
    {
        label: "Availability",
        left:
            "The average wait time to see a doctor in the US is 24 days, and rises each year",
        right:
            "The average wait time to see a Lemonaid doctor, from any location, is less than 2 days",
    },
];
