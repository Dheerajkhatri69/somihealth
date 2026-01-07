// components/ProductCard.jsx
"use client";

import Link from "next/link";
import Image from "next/image";

export default function ProductCard({ item, ctaHref, isLink = false }) {
    const primary = item?.primary || {
        label: "Get Started",
        href: ctaHref || "/pricing",
    };

    const secondary = item?.secondary || {
        label: isLink ? "Access Service" : "Learn More",
        href: item?.href || "#",
    };

    const plansNote = item?.plansNote || "";

    return (
        <div className="rounded-3xl bg-lightprimary-foreground px-6 pt-6 md:px-8 md:pt-8 ring-1 ring-black/5">
            <div className="mb-2 flex items-center gap-2">
                <h3 className="text-2xl tracking-tight">{item.label}</h3>
                {item.badge && (
                    <span className="rounded-full bg-black px-2.5 py-0.5 text-xs font-semibold text-white">
                        {item.badge}
                    </span>
                )}
            </div>

            {/* Optional price line */}
            {item.startingAt && (
                <p className="text-base text-gray-600 mb-4">Starting at {item.startingAt}</p>
            )}

            {/* Image – bigger, sharper, forward */}
            {item.img && (
                <div className="flex justify-center pt-6 overflow-hidden">
                    <div className="relative h-64 w-64 sm:h-72 sm:w-72 md:h-80 md:w-80 z-10">
                        <Image
                            src={item.img}
                            alt={item.label}
                            // provide large intrinsic size; Next will downscale crisply
                            width={900}
                            height={900}
                            quality={95}
                            priority={false}
                            draggable={false}
                            className="
                object-contain
                drop-shadow-lg
                will-change-transform
                scale-[1.15] md:scale-[1.2]
                rotate-45
              "
                            sizes="(max-width: 640px) 256px, (max-width: 768px) 288px, 320px"
                        />
                    </div>
                </div>
            )}

            {/* Buttons */}
            <div className="flex flex-col gap-3 -mt-20 sm:flex-row">
                <Link
                    href={secondary.href}
                    className="inline-flex w-full z-20 items-center justify-center rounded-full px-4 py-2 text-sm font-semibold btn-hero bg-darkprimary text-white hover:opacity-90"
                >
                    {secondary.label}
                </Link>

                {!isLink && (
                    <Link
                        href={primary.href}
                        className="fx86 inline-flex w-full z-20 items-center justify-center rounded-full border border-darkprimary bg-transparent text-darkprimary px-4 py-2 text-sm font-semibold"
                        style={{ "--fx86-base": "transparent", "--fx86-glow": "#364c781d" }}
                    >
                        {primary.label}
                    </Link>
                )}
            </div>

            <p className="my-2 text-xs text-gray-500 text-center">{plansNote}</p>
        </div>
    );
}
