// components/ProductHero.jsx
"use client";

import Image from "next/image";
import Link from "next/link";
import * as Icons from "lucide-react";

function Icon({ name, className }) {
    const Cmp = Icons[name] || Icons.Circle;
    return <Cmp className={className} aria-hidden />;
}

export default function ProductHero({ product }) {
    const { label, heroImage, price, unit, inStock, ratingLabel, bullets, description, ctas } =
        product;

    return (
        <section className="grid items-start gap-10 md:grid-cols-2">
            {/* Image / soft panel */}
            <div
                className="rounded-3xl p-6 md:p-10 bg-lightprimary"
            >
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

                <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">{label}</h1>
                <p className="mt-3 text-xl md:text-2xl">
                    From <span className="font-semibold">${price.toFixed(2)}</span> {unit}
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
                    <Link
                        href={ctas?.primary?.href || "#"}
                        className="btn-hero block w-full rounded-full bg-darkprimary px-6 py-4 text-center text-sm font-semibold text-white hover:opacity-90"
                    >
                        {ctas?.primary?.label || "Get started"}
                    </Link>
                    <Link
                        href={ctas?.secondary?.href || "#"}
                        className="btn-hero block w-full rounded-full bg-transparent px-6 py-4 text-center text-sm font-semibold text-secondary border-2 border-darkprimary overflow-hidden"
                    >
                        {ctas?.secondary?.label || "Book a consultation"}
                    </Link>
                </div>
            </div>
        </section>
    );
}
