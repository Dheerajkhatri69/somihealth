"use client";

import Image from "next/image";
import React from "react";

export default function HealthPlans({
    title = "Health coverage for you and your loved ones",
    subtitle = "Choose the plan that’s right for you, no insurance required",
    image = { src: "/hero-family.jpg", alt: "Smiling parent with kids" },
    plans = DEFAULT_PLANS,
}) {
    return (
        <section className="relative">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
                {/* Layout: image left, header + cards right */}
                <div className="grid gap-6 lg:[grid-template-columns:40%_60%] items-start">

                    {/* Left image */}
                    <figure className="overflow-hidden rounded-2xl shadow-sm">
                        <div className="relative aspect-[9/16] w-full">
                            <Image
                                src={image.src}
                                alt={image.alt}
                                fill
                                priority={false}
                                className="object-cover"
                                sizes="(max-width: 1024px) 100vw, 640px"
                            />
                        </div>
                    </figure>


                    {/* Right: centered header + cards */}
                    <div className="flex flex-col h-full items-center justify-center font-SofiaSans">
                        <header className="mb-8 text-center max-w-xl">
                            <h2 className="text-3xl tracking-tight text-darkprimary sm:text-4xl">
                                {title}
                            </h2>
                            <p className="mt-2 text-sm sm:text-base text-darkprimary/70">
                                {subtitle}
                            </p>
                        </header>

                        <div className="grid w-full gap-6 sm:grid-cols-2">
                            {plans.map((plan, idx) => (
                                <PlanCard key={idx} {...plan} highlight={true} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

/* ----------------- subcomponents ----------------- */

function PlanCard({ name, blurb, priceLabel, features = []}) {
    return (
        <article
            className={[
                "group",
                "rounded-2xl border-l-4 border-r-4 bg-white p-6 sm:p-7",
                "shadow-[0_10px_30px_rgba(54,76,120,0.08)] ring-1 ring-black/0",
                "transition hover:shadow-[0_18px_40px_rgba(54,76,120,0.12)]",
                "border-darkprimary" // optional slight card lift
            ].join(" ")}
        >
            <h3 className="text-xl font-semibold text-darkprimary
                 transition-transform duration-200 ease-out
                 group-hover:scale-[1.02] origin-left">{name}</h3>
            <p className="mt-2 text-sm text-darkprimary/80 leading-relaxed">{blurb}</p>

            <div className="mt-4 inline-flex items-center rounded-md bg-emerald-100 px-2.5 py-1 text-[12px] font-semibold text-emerald-800">
                {priceLabel}
            </div>


            <ul className="mt-5 space-y-3">
                {features.map((f, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-darkprimary/90 border-l-2 pl-2 rounded-sm border-darkprimary">
                        <span>{f}</span>
                    </li>
                ))}
            </ul>

        </article>
    );
}

/* ----------------- defaults ----------------- */

const DEFAULT_PLANS = [
    {
        name: "Individual Plan",
        blurb:
            "Partnering you with a doctor who really gets to know you, listens to you, and has the time for you. Aligned with your life.",
        priceLabel: "$99/month",
        features: [
            "No additional fees or co-pays",
            "Cancel anytime in the first 30 days",
            "Comprehensive one-hour first appointment tailored to your needs",
            "Message your medical team whenever you want",
            "All your medical records in one place",
        ],
    },
    {
        name: "Family Plan",
        blurb:
            "Comprehensive, personalized care for you and your spouse or partner. Add on your kids and other family members.",
        priceLabel: "Starting at $178/month",
        features: [
            "All of the benefits of the Individual Plan",
            "Share all of your benefits with a spouse or partner",
            "Add on your kids and other family members later and cover the entire family",
        ],
    },
];
