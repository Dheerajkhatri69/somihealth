"use client";

import Link from "next/link";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

/** Simultaneous slide-out (up) + slide-in (from bottom)
 *  Handles multi-line by measuring tallest line and setting container height.
 */
export function RotatingLine({ lines, interval = 2200, duration = 450, className = "" }) {
    const [current, setCurrent] = useState(0);
    const [next, setNext] = useState(lines.length > 1 ? 1 : 0);
    const [animating, setAnimating] = useState(false);
    const [maxH, setMaxH] = useState(null);

    const containerRef = useRef(null);
    const measureRef = useRef(null);
    const timeoutRef = useRef(null);
    const intervalRef = useRef(null);

    // Measure tallest line (accounts for wrapping)
    const measureHeights = () => {
        const el = measureRef.current;
        if (!el) return;
        let h = 0;
        for (const child of el.children) {
            h = Math.max(h, child.offsetHeight);
        }
        if (h > 0) setMaxH(h);
    };

    useLayoutEffect(() => {
        measureHeights();
    }, [lines, className]);

    useEffect(() => {
        // Re-measure on resize
        if (!containerRef.current) return;
        const ro = new ResizeObserver(() => measureHeights());
        ro.observe(containerRef.current);
        return () => ro.disconnect();
    }, []);

    // Animate loop
    useEffect(() => {
        if (lines.length < 2) return; // nothing to rotate
        intervalRef.current = setInterval(() => {
            setAnimating(true);
            timeoutRef.current = setTimeout(() => {
                setCurrent((p) => (p + 1) % lines.length);
                setNext((p) => (p + 1) % lines.length);
                setAnimating(false);
            }, duration);
        }, interval);
        return () => {
            clearInterval(intervalRef.current);
            clearTimeout(timeoutRef.current);
        };
    }, [interval, duration, lines.length]);

    return (
        <div
            ref={containerRef}
            className={`relative mt-3 ${className}`}
            style={{ "--rot-dur": `${duration}ms` }}
            aria-live="polite"
        >
            {/* Visible swap zone with fixed height = tallest measured line */}
            <div className="relative overflow-hidden" style={{ height: maxH ? `${maxH}px` : undefined }}>
                {/* current line (slides up) */}
                <span
                    key={`cur-${current}-${animating}`}
                    className={`absolute inset-0 flex items-center justify-center ${animating ? "animate-slide-out-up" : "opacity-100"
                        }`}
                    aria-hidden={animating}
                >
                    {lines[current]}
                </span>

                {/* next line (slides in from bottom) */}
                <span
                    key={`next-${next}-${animating}`}
                    className={`absolute inset-0 flex items-center justify-center ${animating ? "animate-slide-in-up" : "opacity-0"
                        }`}
                    aria-hidden={!animating}
                >
                    {lines[next]}
                </span>
            </div>

            {/* Hidden measurer: same width/typography to compute tallest height */}
            <div
                ref={measureRef}
                className="absolute inset-0 invisible pointer-events-none"
                aria-hidden
            >
                {lines.map((line, i) => (
                    <div key={i} className="flex items-center justify-center">
                        {line}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function Hero() {
    return (
        <section className="w-full py-16 sm:py-24">
            <div className="mx-auto text-center font-SofiaSans">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-secondary">
                    Your Health, Your Future, Your Time.
                </h1>

                <RotatingLine
                    lines={[
                        "No hidden fees. No hassle. Just results.",
                        "Custom plans. Real help. Real care.",
                    ]}
                    interval={2200}   // faster swap
                    duration={450}    // faster animation
                    className="text-3xl sm:text-4xl md:text-5xl text-darkprimary"
                />


                <div className="mt-8 flex justify-center">
                    <Link
                        href="/getstarted"
                        className="btn-hero inline-flex items-center gap-3 rounded-full bg-secondary px-6 sm:px-8 py-3
                       text-white text-sm sm:text-base font-semibold"
                    >
                        Start Your Journey
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </Link>
                </div>
            </div>
        </section>
    );
}
