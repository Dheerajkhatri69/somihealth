"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { RotatingLine } from "./Hero";

/* ------------------ Content Config ------------------ */
export const HERO_CONTENT = {
    eyebrow: "hello world",
    headingLine1: "It‘s more than weight loss,",
    lines: ["Delivered To You!", "That Actually Work!", "Simple. Safe. Effective."],
    body:
        "The impact of weight loss goes beyond the scale. Get started with an online assessment today and find out if you qualify.",
    ctaText: "Get started",
    heroImage:
        "https://res.cloudinary.com/dvmbfolrm/image/upload/v1757383165/fileUploader/h28wsjdnqmoz6mcw0qyv.jpg",
    heroAlt: "Happy woman stretching outside",
    disclaimer:
        "Side effects of GLP-1 medications may be serious, including increased risk of thyroid tumors and cancer; do not use if you or your family have a history of MTC or MEN 2. Individual weight loss results may vary.",
};

/* ---------------- Rotating Line (same animation as yours) ---------------- */
export function NewRotatingLine({ lines, interval = 2200, duration = 450, className = "" }) {
    const [current, setCurrent] = useState(0);
    const [next, setNext] = useState(lines.length > 1 ? 1 : 0);
    const [animating, setAnimating] = useState(false);
    const [maxH, setMaxH] = useState(null);

    const curRef = useRef(0);
    const nextRef = useRef(lines.length > 1 ? 1 : 0);
    const aliveRef = useRef(true);
    const tRef = useRef(null);

    const containerRef = useRef(null);
    const measureRef = useRef(null);

    const measureHeights = () => {
        const el = measureRef.current;
        if (!el) return;
        let h = 0;
        for (const child of el.children) h = Math.max(h, child.offsetHeight);
        if (h > 0) setMaxH(h);
    };

    useLayoutEffect(() => {
        measureHeights();
    }, [lines, className]);

    useEffect(() => {
        if (!containerRef.current) return;
        const ro = new ResizeObserver(() => measureHeights());
        ro.observe(containerRef.current);
        return () => ro.disconnect();
    }, []);

    useEffect(() => {
        if (lines.length < 2) return;
        aliveRef.current = true;

        const cycle = () => {
            if (!aliveRef.current) return;
            setAnimating(true);

            tRef.current = setTimeout(() => {
                if (!aliveRef.current) return;

                curRef.current = (curRef.current + 1) % lines.length;
                nextRef.current = (nextRef.current + 1) % lines.length;

                setCurrent(curRef.current);
                setNext(nextRef.current);

                setAnimating(false);
                tRef.current = setTimeout(cycle, interval);
            }, duration);
        };

        tRef.current = setTimeout(cycle, interval);

        return () => {
            aliveRef.current = false;
            clearTimeout(tRef.current);
        };
    }, [interval, duration, lines.length]);

    return (
        <div
            ref={containerRef}
            className={`relative mt-3 ${className}`}
            style={{ "--rot-dur": `${duration}ms` }}
            aria-live="polite"
        >
            <div className="relative overflow-hidden text-left" style={{ height: maxH ? `${maxH}px` : undefined }}>
                {/* current line */}
                <span
                    key={`cur-${current}-${animating ? "anim" : "idle"}`}
                    className={`absolute inset-0 flex items-center justify-start ${animating ? "animate-slide-out-up" : "opacity-100"
                        }`}
                    aria-hidden={animating}
                >
                    {lines[current]}
                </span>

                {/* next line */}
                <span
                    key={`next-${next}-${animating ? "anim" : "idle"}`}
                    className={`absolute inset-0 flex items-center justify-start ${animating ? "animate-slide-in-up" : "opacity-0"
                        }`}
                    aria-hidden={!animating}
                >
                    {lines[next]}
                </span>
            </div>

            {/* hidden measurer */}
            <div ref={measureRef} className="absolute inset-0 invisible pointer-events-none" aria-hidden>
                {lines.map((line, i) => (
                    <div key={i} className="flex items-center justify-start">
                        {line}
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ---------------------- Hero Component ---------------------- */
export default function ProTypeHero({ content = HERO_CONTENT, onCta = () => { } }) {
    return (
        <section className="relative w-full">
            <div className="mx-auto max-w-7xl px-4 md:px-6 py-10 md:py-14">
                <div className="grid items-center gap-10 md:grid-cols-12">
                    {/* LEFT */}
                    <div className="md:col-span-6 lg:pr-6">
                        {content.eyebrow ? (
                            <p className="mb-2 text-xs font-SofiaSans font-semibold tracking-[.12em] text-neutral-600 uppercase">
                                {content.eyebrow}
                            </p>
                        ) : null}

                        <h1 className="text-3xl md:text-5xl tracking-tight text-darkprimary">
                            {content.headingLine1}
                        </h1>

                        {/* Rotating line (left aligned) */}
                        <RotatingLine
                            lines={content.lines}
                            interval={2200}
                            duration={450}
                            className="text-2xl sm:text-3xl md:text-4xl text-darkprimary"
                        />

                        <p className="mt-6 max-w-xl text-[15px] sm:text-base leading-7 text-neutral-700">
                            {content.body}
                        </p>

                        <div className="mt-6">
                            <Link
                                href="/getstarted"
                                className="fx-primary rounded-full font-SofiaSans bg-darkprimary px-5 py-2 text-sm font-semibold text-white hover:opacity-100"
                            >
                                {content.ctaText}
                            </Link>
                        </div>

                        <p className="mt-5 max-w-2xl text-xs leading-5 text-neutral-600">{content.disclaimer}</p>
                    </div>

                    {/* RIGHT (single image) */}
                    <div className="md:col-span-6">
                        <div className="relative mx-auto w-full max-w-xl lg:max-w-2xl">
                            <div className="relative overflow-hidden rounded-[24px] bg-black/5 ring-1 ring-black/5 shadow-lg">
                                <div className="relative w-full" style={{ aspectRatio: "16 / 9" }}>
                                    <Image
                                        src={content.heroImage}
                                        alt={content.heroAlt}
                                        fill
                                        sizes="(max-width: 1024px) 100vw, 640px"
                                        className="object-cover"
                                        priority
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
