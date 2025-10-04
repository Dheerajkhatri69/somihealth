"use client";

import Image from "next/image";
import React, { useState, useEffect } from "react";
import * as LucideIcons from "lucide-react";
export default function CompoundedExplainer() {
    const [content, setContent] = useState({
        title: "What are Compounded GLP-1 Medications?",
        tabs: [],
        image: "/hero/bmilady.png",
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async function fetchContent() {
            try {
                const res = await fetch("/api/compounded-content", { cache: "no-store" });
                const data = await res.json();
                if (data?.success) setContent(data.result);
            } catch (e) {
                console.error("Error fetching compounded content:", e);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    if (loading) {
        return (
            <section className="relative watermark isolate w-full overflow-hidden" data-text="somi">
                <div className="mx-auto max-w-7xl px-4 md:px-6 pt-10 md:pt-14">
                    <div className="mt-6 grid items-center gap-8 md:mt-8 md:grid-cols-12 md:gap-12">
                        {/* text left */}
                        <div className="md:col-span-5 space-y-4">
                            <div className="h-12 w-3/4 bg-gray-200 animate-pulse rounded" />
                            <div className="h-4 w-full bg-gray-200 animate-pulse rounded" />
                            <div className="h-4 w-2/3 bg-gray-200 animate-pulse rounded" />
                        </div>
                        {/* image right */}
                        <div className="md:col-span-7">
                            <div className="h-[420px] sm:h-[500px] md:h-[560px] w-full bg-gray-200 animate-pulse rounded-2xl" />
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section
            className="relative isolate w-full overflow-hidden"
        >
            <div className="mx-auto max-w-7xl p-4 md:p-6 pt-10 md:pt-14">
                {/* layout: text left (5/12), image right (7/12) */}
                <div className="mt-6 grid items-center gap-8 md:mt-8 md:grid-cols-12 md:gap-12">
                    {/* LEFT – copy */}
                    <div className="md:col-span-5 text-[15px] leading-7 text-gray-700 sm:text-base">
                        <h2 className="font-SofiaSans text-3xl mb-4 leading-tight text-gray-900 sm:text-4xl md:text-[40px]">
                            {content.title}
                        </h2>
                        {/* Tabs list */}
                        {/* Tabs list – clean media rows */}
                        <div className="mt-6 space-y-8">
                            {Array.isArray(content.tabs) &&
                                content.tabs.map((t, i) => {
                                    const Icon = LucideIcons[t.icon] || LucideIcons.Sparkles; // fallback
                                    return (
                                        <div key={i} className="flex items-start gap-4">
                                            {/* Icon inline with subtitle */}
                                            <span className="mt-0.5 flex h-6 w-6 items-center justify-center text-secondary">
                                                <Icon className="h-5 w-5" />
                                            </span>

                                            {/* Text block */}
                                            <div className="min-w-0">
                                                <p className="font-semibold text-[16px] sm:text-[17px] text-gray-900 flex items-center gap-2">
                                                    {t.subtitle}
                                                </p>
                                                <p className="mt-1 text-[15px] sm:text-[16px] leading-7 text-gray-700">
                                                    {t.description}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>
                    </div>

                    {/* RIGHT – big image */}
                    <div className="md:col-span-7">
                        <div className="relative ml-auto w-full max-w-[780px] lg:max-w-[880px]">
                            {/* subtle backdrop glow */}
                            <div
                                className="pointer-events-none absolute -inset-6 rounded-[36px] bg-white/40 blur-2xl"
                                aria-hidden="true"
                            />
                            {/* ratio wrapper so the fill image is responsive */}
                            <div className="relative rounded-[28px] ring-1 ring-black/5 shadow-lg overflow-hidden"
                                style={{ aspectRatio: "4 / 5" }}>
                                <Image
                                    src={content.image}
                                    alt={content.title || "Compounded GLP-1"}
                                    fill
                                    priority={true}
                                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 60vw, 780px"
                                    className="object-cover"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
