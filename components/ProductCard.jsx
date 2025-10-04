// components/ProductCard.jsx
"use client";

import Link from "next/link";
import Image from "next/image";

export default function ProductCard({ item, ctaHref, isLink = false }) {
    // Prefer the enriched values (primary/secondary/plansNote),
    // but keep backward compatibility with existing props.
    const primary = item?.primary || {
        label: "Get Started",
        href: ctaHref || "/getstarted",
    };

    const secondary = item?.secondary || {
        label: isLink ? "Access Service" : "Learn More",
        href: item?.href || "#",
    };

    const plansNote = item?.plansNote || "";

    return (
        <div className="rounded-3xl bg-lightprimary-foreground px-6 pt-6 md:px-8 md:pt-8 ring-1 ring-black/5">
            <div className="mb-2 flex items-center gap-2">
                <h3 className="text-2xl font-semibold tracking-tight">{item.label}</h3>
                {item.badge && (
                    <span className="rounded-full bg-black px-2.5 py-0.5 text-xs font-semibold text-white">
                        {item.badge}
                    </span>
                )}
            </div>

            {/* Optional price line */}
            {item.startingAt && (
                <p className="text-sm text-gray-600 mb-4">
                    Starting at {item.startingAt}
                </p>
            )}

            {/* Image */}
            {item.img && (
                <div className="flex justify-center py-6">
                    <div className="relative h-52 w-52 md:h-60 md:w-64">
                        <Image
                            src={item.img}
                            alt={item.label}
                            fill
                            className="object-contain rotate-45 drop-shadow-sm scale-125"
                            sizes="(max-width: 768px) 160px, 200px"
                            priority={false}
                        />
                    </div>
                </div>
            )}


            {/* Buttons */}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link
                    href={secondary.href}
                    className="inline-flex w-full items-center justify-center rounded-full px-4 py-2 text-sm font-semibold btn-hero bg-darkprimary text-white hover:opacity-90"
                >
                    {secondary.label}
                </Link>

                {!isLink && (
                    <Link
                        href={primary.href}
                        className="fx86 inline-flex w-full items-center justify-center rounded-full border border-darkprimary bg-transparent text-darkprimary px-4 py-2 text-sm font-semibold"
                        style={{ "--fx86-base": "transparent", "--fx86-glow": "#364c781d" }}
                    >
                        {primary.label}
                    </Link>
                )}
            </div>
            <p className="my-2 text-xs text-gray-500 text-center">
                {plansNote}
            </p>
        </div>
    );
}
