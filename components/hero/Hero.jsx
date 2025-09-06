"use client";

import Link from "next/link";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

export function RotatingLine({
    lines,
    interval = 2200,
    duration = 450,
    className = "",
}) {
    // visible indices (state) -> trigger render
    const [current, setCurrent] = useState(0);
    const [next, setNext] = useState(lines.length > 1 ? 1 : 0);
    const [animating, setAnimating] = useState(false);
    const [maxH, setMaxH] = useState(null);

    // internal refs (do NOT cause effect restarts)
    const curRef = useRef(0);
    const nextRef = useRef(lines.length > 1 ? 1 : 0);
    const aliveRef = useRef(true);
    const tRef = useRef(null);

    // color handling via refs (no state deps)
    const COLOR_CLASSES = useRef([
        "text-[#333399]",
        "text-[#006db0]",
        "text-[#0093af]",
        "text-[#00009c]",
    ]).current;
    const curColorIdxRef = useRef(Math.floor(Math.random() * COLOR_CLASSES.length));
    const nextColorIdxRef = useRef((curColorIdxRef.current + 1) % COLOR_CLASSES.length);

    const containerRef = useRef(null);
    const measureRef = useRef(null);

    // --- sizing (same as yours) ---
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

    // --- helper: pick a different color ---
    const pickDifferentColor = (prev) => {
        if (COLOR_CLASSES.length < 2) return prev;
        let idx = Math.floor(Math.random() * COLOR_CLASSES.length);
        if (idx === prev) idx = (idx + 1) % COLOR_CLASSES.length;
        return idx;
    };

    // --- infinite loop using self-scheduling timeout ---
    useEffect(() => {
        if (lines.length < 2) return; // nothing to rotate
        aliveRef.current = true;

        const cycle = () => {
            if (!aliveRef.current) return;

            // start animation
            setAnimating(true);

            // prepare next color BEFORE swap
            nextColorIdxRef.current = pickDifferentColor(curColorIdxRef.current);

            // finish this swap after `duration`
            tRef.current = setTimeout(() => {
                if (!aliveRef.current) return;

                // advance indices in refs
                curRef.current = (curRef.current + 1) % lines.length;
                nextRef.current = (nextRef.current + 1) % lines.length;

                // reflect to state (render)
                setCurrent(curRef.current);
                setNext(nextRef.current);

                // commit colors
                curColorIdxRef.current = nextColorIdxRef.current;

                // end anim + schedule next cycle after `interval`
                setAnimating(false);
                tRef.current = setTimeout(cycle, interval);
            }, duration);
        };

        // initial delay before first swap
        tRef.current = setTimeout(cycle, interval);

        return () => {
            aliveRef.current = false;
            clearTimeout(tRef.current);
        };
        // ⚠️ Only depend on static params; do NOT include current/next/color state here
    }, [interval, duration, lines.length]);

    // derive current classes from refs (stable across renders)
    const curColorClass = COLOR_CLASSES[curColorIdxRef.current];
    const nextColorClass = COLOR_CLASSES[nextColorIdxRef.current];

    return (
        <div
            ref={containerRef}
            className={`relative mt-3 ${className}`}
            style={{ "--rot-dur": `${duration}ms` }}
            aria-live="polite"
        >
            {/* Visible swap zone with fixed height = tallest measured line */}
            <div className="relative overflow-hidden" style={{ height: maxH ? `${maxH}px` : undefined }}>
                {/* current line */}
                <span
                    key={`cur-${current}-${animating ? "anim" : "idle"}`}
                    className={`absolute inset-0 flex items-center justify-center ${curColorClass} ${animating ? "animate-slide-out-up" : "opacity-100"}`}
                    aria-hidden={animating}
                >
                    {lines[current]}
                </span>

                {/* next line */}
                <span
                    key={`next-${next}-${animating ? "anim" : "idle"}`}
                    className={`absolute inset-0 flex items-center justify-center ${nextColorClass} ${animating ? "animate-slide-in-up" : "opacity-0"}`}
                    aria-hidden={!animating}
                >
                    {lines[next]}
                </span>
            </div>

            {/* Hidden measurer */}
            <div ref={measureRef} className="absolute inset-0 invisible pointer-events-none" aria-hidden>
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
    const [heroText, setHeroText] = useState({
        mainTitle: 'Look Better, Feel Better, Live Better.',
        rotatingLines: [
            'No hidden fees. No hassle. Just results.',
            'Custom plans. Real help. Real care.',
        ]
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHeroText();
    }, []);

    async function fetchHeroText() {
        try {
            const res = await fetch('/api/hero-text', { cache: 'no-store' });
            const data = await res.json();

            if (data?.success) {
                setHeroText(data.result);
            }
        } catch (error) {
            console.error('Error fetching hero text:', error);
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <section className="w-full py-16 sm:py-24">
                <div className="mx-auto text-center font-SofiaSans">
                    <div className="h-10 w-1/4 mx-auto bg-gray-200 animate-pulse rounded" />
                    <div className="mt-4 h-10 w-2/3 mx-auto bg-gray-200 animate-pulse rounded" />
                    <div className="mt-8 flex justify-center">
                        <div className="h-12 w-48 bg-gray-200 animate-pulse rounded-full" />
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="w-full py-16 sm:py-24">
            <div className="mx-auto text-center font-SofiaSans">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-darkprimary">
                    {heroText.mainTitle}
                </h1>

                <RotatingLine
                    lines={heroText.rotatingLines}
                    interval={2200}   // faster swap
                    duration={450}    // faster animation
                    className="text-3xl sm:text-4xl md:text-5xl text-[#D0E7F7]"
                />


                <div className="mt-8 flex justify-center">
                    <Link
                        href="/getstarted"
                        className="btn-hero inline-flex items-center gap-3 rounded-full bg-darkprimary px-6 sm:px-8 py-3
                       text-white text-sm sm:text-base font-semibold font-SofiaSans"
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
