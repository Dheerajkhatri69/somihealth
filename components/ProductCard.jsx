// components/ProductCard.jsx
"use client";

import Link from "next/link";
import Image from "next/image";

export default function ProductCard({ item, ctaHref, isLink = false }) {
    return (
        <div className="rounded-3xl bg-lightprimary-foreground p-6 md:p-8 ring-1 ring-black/5" >
            <div className="mb-2 flex items-center gap-2">
                <h3 className="text-2xl font-semibold tracking-tight">{item.label}</h3>
                {item.badge && (
                    <span className="rounded-full bg-black px-2.5 py-0.5 text-xs font-semibold text-white">
                        {item.badge}
                    </span>
                )}

            </div>

            {/* Optional price line: render only if present */}
            {item.startingAt && (
                <p className="text-sm text-gray-600 mb-4">
                    Starting at {item.startingAt}
                </p>
            )}

            {/* Image section - only show if item has an image */}
            {item.img && (
                <div className="flex justify-center py-6">
                    <div className="relative h-40 w-40 md:h-52 md:w-48">
                        <Image
                            src={item.img}
                            alt={item.label}
                            fill
                            className="object-contain rotate-45 drop-shadow-sm"
                            sizes="(max-width: 768px) 160px, 200px"
                            priority={false}
                        />
                    </div>
                </div>
            )}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link
                    href={item.href}
                    className="inline-flex w-full items-center justify-center rounded-full px-4 py-2 text-sm font-semibold btn-hero bg-darkprimary text-white hover:opacity-90"
                >
                    {isLink ? 'Access Service' : 'Learn More'}
                </Link>
                {!isLink && (
                    <Link
                        href={ctaHref}
                        className="fx86 inline-flex w-full items-center justify-center rounded-full border border-darkprimary bg-transparent text-darkprimary px-4 py-2 text-sm font-semibold"
                        style={{ "--fx86-base": "transparent", "--fx86-glow": "#364c781d" }}
                    >
                        Get Started
                    </Link>
                )}
            </div>
        </div>
    );
}
