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
        <section className="relative isolate w-full overflow-hidden">
            <div className="mx-auto max-w-7xl p-4 md:p-6 pt-10 md:pt-14">
                {/* layout: text left (5/12), image right (7/12) */}
                {/* CHANGED: items-center -> items-stretch */}
                <div className="mt-6 grid items-stretch gap-8 md:mt-8 md:grid-cols-12 md:gap-12">
                    {/* LEFT – copy */}
                    {/* OPTIONAL: h-full helps define the row height from left content */}
                    <div className="md:col-span-5 text-[15px] leading-7 text-gray-700 sm:text-base h-full">
                        <h2 className="font-SofiaSans text-3xl mb-4 leading-tight text-darkprimary sm:text-4xl md:text-[40px]">
                            {content.title}
                        </h2>

                        <div className="mt-6 space-y-8">
                            {Array.isArray(content.tabs) &&
                                content.tabs.map((t, i) => {
                                    const Icon = LucideIcons[t.icon] || LucideIcons.Sparkles;
                                    return (
                                        <div key={i} className="flex items-start gap-4 font-SofiaSans">
                                            <span className="mt-0.5 flex h-6 w-6 items-center justify-center text-darkprimary">
                                                <Icon className="h-5 w-5" />
                                            </span>
                                            <div className="min-w-0">
                                                <p className="font-semibold text-[16px] sm:text-[17px] text-darkprimary flex items-center gap-2">
                                                    {t.subtitle}
                                                </p>
                                                <p className="mt-1 text-[15px] sm:text[16px] leading-7 text-gray-700">
                                                    {t.description}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>
                    </div>

                    {/* RIGHT – big image */}
                    {/* CHANGED: ensure this column stretches and the wrappers are h-full */}
                    <div className="md:col-span-7 h-full">
                        <div className="relative ml-auto w-full max-w-[780px] lg:max-w-[880px] h-full">
                            <div
                                className="pointer-events-none absolute -inset-6 rounded-[36px] bg-white/40 blur-2xl"
                                aria-hidden="true"
                            />

                            {/* Responsive aspect ratio container */}
                            <div className="relative rounded-[28px] ring-1 ring-black/5 shadow-lg overflow-hidden h-full min-h-[320px] sm:min-h-[420px]">
                                <div className="relative w-full h-full md:aspect-[16/9] aspect-[3/4]">
                                    <Image
                                        src={content.image}
                                        alt={content.title || "Compounded GLP-1"}
                                        fill
                                        priority
                                        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 60vw, 780px"
                                        className="object-cover"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>

    );
}
