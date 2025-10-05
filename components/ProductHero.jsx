// components/ProductHero.jsx
"use client";

import Image from "next/image";
import Link from "next/link";
import * as Icons from "lucide-react";
import { Fragment } from "react";

function Icon({ name, className }) {
    const Cmp = Icons[name] || Icons.Circle;
    return <Cmp className={className} aria-hidden />;
}

export default function ProductHero({ product }) {
    const { label, heroImage, price, unit, inStock, bullets, description, ctas } = product;

    // ⬇️ Add your logo paths here (update paths if different)
    const payLogos = [
        { src: "/pay/klarna-badge.png", alt: "Klarna" },
        { src: "/pay/paypal-badge.png", alt: "PayPal" }, // 3rd image is PayPal

        { src: "/pay/affirm-badge.webp", alt: "Affirm" },
    ];

    return (
        <section className="grid items-start gap-10 md:grid-cols-2">
            {/* Image / soft panel */}
            <div className="rounded-3xl p-6 md:p-10 bg-darkprimary-foreground/20">
                <div className="relative mx-auto aspect-[4/3] max-w-md">
                    <Image
                        src={heroImage}
                        alt={label}
                        fill
                        className="object-contain"
                        sizes="(max-width:768px) 90vw, 40vw"
                        priority
                    />
                </div>
            </div>

            {/* Copy */}
            <div className="font-SofiaSans">
                <div className="mb-6 flex items-center justify-between gap-4">
                    <span className="inline-flex items-center gap-2 rounded-full border border-lightprimary bg-lightprimary-foreground px-3 py-1 text-sm font-medium text-emerald-700">
                        <span className="h-2 w-2 rounded-full bg-darkprimary" />{" "}
                        {inStock ? "In Stock" : "Out of Stock"}
                    </span>
                </div>

                <h1 className="text-2xl sm:text-4xl text-darkprimary tracking-tight">{label}</h1>
                <p className="mt-3 text-xl md:text-2xl">
                    From <span className="font-semibold">${price}</span> {unit}
                </p>

                <ul className="mt-6 space-y-4">
                    {bullets.map((b, i) => (
                        <li key={i} className="flex items-center gap-3">
                            <span className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-full bg-lightprimary-foreground">
                                <Icon name={b.icon} className="h-4 w-4 text-darkprimary" />
                            </span>
                            <span className="text-gray-800">{b.text}</span>
                        </li>
                    ))}
                </ul>

                <p className="mt-6 text-gray-700">{description}</p>

                <div className="mt-8 space-y-3">
                    {/* Primary CTA keeps */}
                    <Link
                        href={ctas?.primary?.href || "#"}
                        className="btn-hero block w-full rounded-full bg-darkprimary px-6 py-4 text-center text-sm font-semibold text-white hover:opacity-90"
                    >
                        {ctas?.primary?.label || "Get started"}
                    </Link>

                    {/* ⬇️ Payment strip replaces the secondary CTA button */}
                    <div className="w-full rounded-2xl bg-darkprimary-foreground/20 px-4 py-3 sm:px-5 sm:py-3.5 flex items-center justify-between gap-3">
                        {/* Left: icon + text */}
                        <div className="flex items-center gap-2">
                            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-darkprimary/10">
                                <Icons.PiggyBank className="h-4 w-4 text-darkprimary/80" />
                            </span>
                            <span className="text-[15px] font-semibold text-darkprimary/90">
                                Pay Over Time With
                            </span>
                        </div>

                        {/* Right: logos with "or" separators */}
                        <div className="flex items-center gap-2 sm:gap-3 ml-4">
                            {payLogos.map((logo, idx) => (
                                <Fragment key={logo.alt}>
                                    <div className="relative h-7 w-auto sm:h-8">
                                        <Image
                                            src={logo.src}
                                            alt={logo.alt}
                                            width={96}
                                            height={32}
                                            className="h-full w-auto rounded-md"
                                            sizes="(max-width:768px) 80px, 96px"
                                        />
                                    </div>
                                    {/* "or" between logos, not after the last */}
                                    {idx < payLogos.length - 1 && (
                                        <span className="text-sm text-gray-600 select-none" aria-hidden="true">
                                            or
                                        </span>
                                    )}
                                </Fragment>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
