"use client";

import Image from "next/image";

/**
 * PrimaryCareHero.jsx (image background div as secondary shadow)
 */

const DEFAULT_CONTENT = {
    eyebrow: "",
    heading: "Your primary care physician online",
    subheading:
        "Partnering you with a doctor who really gets to know you, listens to you, and has time for you.",
    priceNote:
        "Starting at $99/month for individuals or $178 for your entire family",
    ctaLabel: "Get started",
    ctaHref: "/get-started",
    image: {
        src: "/images/primary-care-hero.jpg",
        alt: "Person relaxing on bed with laptop and dog nearby",
        width: 600,
        height: 350,
    },
};

export default function PrimaryCareHero({ content = DEFAULT_CONTENT }) {
    const c = { ...DEFAULT_CONTENT, ...content };

    return (
        <section className="relative isolate overflow-hidden">
            <div className="mx-auto font-SofiaSans grid max-w-5xl grid-cols-1 gap-8 px-4 py-12 md:grid-cols-2 md:py-16 lg:gap-10 lg:px-6">
                {/* Left: Copy */}
                <div className="flex flex-col items-start justify-center">
                    {c.eyebrow ? (
                        <span className="mb-2 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-800">
                            {c.eyebrow}
                        </span>
                    ) : null}

                    <h1 className="text-2xl font-semibold leading-snug text-slate-900 md:text-3xl">
                        {c.heading}
                    </h1>

                    <p className="mt-4 max-w-md text-base leading-6 text-slate-700">
                        {c.subheading}
                    </p>

                    {c.priceNote ? (
                        <div className="mt-6 inline-flex rounded bg-lightprimary px-3 py-1.5 text-xs text-slate-800 ring-1 ring-lightprimary-foreground">
                            {c.priceNote}
                        </div>
                    ) : null}

                    {c.ctaLabel ? (
                        <a
                            href={c.ctaHref || "#"}
                            className="fx-primary rounded-full mt-6 font-SofiaSans bg-darkprimary px-5 py-2 text-sm font-semibold text-white hover:opacity-100"
                        >
                            {c.ctaLabel}
                        </a>
                    ) : null}
                </div>

                {/* Right: Image with background div as shadow */}
                <div className="relative flex items-center justify-center">
                    {/* Secondary background div */}
                    <div className="absolute right-4 top-4 -z-10 hidden h-[95%] w-[95%] rounded-2xl bg-lightprimary md:block" />

                    <div className="relative overflow-hidden rounded-2xl max-w-md">
                        <Image
                            src={c.image?.src}
                            alt={c.image?.alt || ""}
                            width={c.image?.width || 600}
                            height={c.image?.height || 350}
                            className="h-auto w-full object-cover rounded-2xl"
                            priority
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}