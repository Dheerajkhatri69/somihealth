"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import * as Lucide from "lucide-react";
/* -------------------- ROTATING LINE -------------------- */
export function RotatingLine({ lines, interval = 2200, duration = 450, className = "" }) {
    const [current, setCurrent] = useState(0);
    const [next, setNext] = useState(lines.length > 1 ? 1 : 0);
    const [animating, setAnimating] = useState(false);
    const [maxH, setMaxH] = useState(null);

    const curRef = useRef(0);
    const nextRef = useRef(lines.length > 1 ? 1 : 0);
    const aliveRef = useRef(true);
    const tRef = useRef(null);

    const COLOR_CLASSES = useRef([
        "text-[#9e9eff]",
        "text-[#006db0]",
        "text-[#0093af]",
        "text-[#8a8aee]",
    ]).current;
    const curColorIdxRef = useRef(Math.floor(Math.random() * COLOR_CLASSES.length));
    const nextColorIdxRef = useRef((curColorIdxRef.current + 1) % COLOR_CLASSES.length);

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

    const pickDifferentColor = (prev) => {
        if (COLOR_CLASSES.length < 2) return prev;
        let idx = Math.floor(Math.random() * COLOR_CLASSES.length);
        if (idx === prev) idx = (idx + 1) % COLOR_CLASSES.length;
        return idx;
    };

    useEffect(() => {
        if (lines.length < 2) return;
        aliveRef.current = true;

        const cycle = () => {
            if (!aliveRef.current) return;
            setAnimating(true);
            nextColorIdxRef.current = pickDifferentColor(curColorIdxRef.current);

            tRef.current = setTimeout(() => {
                if (!aliveRef.current) return;
                curRef.current = (curRef.current + 1) % lines.length;
                nextRef.current = (nextRef.current + 1) % lines.length;
                setCurrent(curRef.current);
                setNext(nextRef.current);
                curColorIdxRef.current = nextColorIdxRef.current;
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

    const curColorClass = COLOR_CLASSES[curColorIdxRef.current];
    const nextColorClass = COLOR_CLASSES[nextColorIdxRef.current];

    return (
        <div
            ref={containerRef}
            className={`relative mt-3 ${className}`}
            style={{ "--rot-dur": `${duration}ms` }}
            aria-live="polite"
        >
            <div className="relative overflow-hidden" style={{ height: maxH ? `${maxH}px` : undefined }}>
                <span
                    key={`cur-${current}-${animating ? "anim" : "idle"}`}
                    className={`absolute inset-0 flex items-center justify-start ${curColorClass} ${animating ? "animate-slide-out-up" : "opacity-100"
                        }`}
                    aria-hidden={animating}
                >
                    {lines[current]}
                </span>

                <span
                    key={`next-${next}-${animating ? "anim" : "idle"}`}
                    className={`absolute inset-0 flex items-center justify-start ${nextColorClass} ${animating ? "animate-slide-in-up" : "opacity-0"
                        }`}
                    aria-hidden={!animating}
                >
                    {lines[next]}
                </span>
            </div>

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

/* -------------------- HERO -------------------- */
export default function Hero() {
    const [heroText, setHeroText] = useState({
        mainTitle: "Look Better, Feel Better, Live Better.",
        rotatingLines: [
            "No hidden fees. No hassle. Just results.",
            "Custom plans. Real help. Real care.",
        ],
        features: [
            { icon: "Handshake", text: "Free consultation, fast approval" },
            { icon: "CreditCard", text: "No insurance required" },
            { icon: "Stethoscope", text: "Doctor-led treatment plans" },
        ],
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchHeroText() {
            try {
                const res = await fetch("/api/hero-text", { cache: "no-store" });
                const data = await res.json();
                if (data?.success) setHeroText(data.result);
            } catch (error) {
                console.error("Error fetching hero text:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchHeroText();
    }, []);
    const safeFeatures = Array.isArray(heroText.features) ? heroText.features : [];
    const Star = ({ className = "h-4 w-4", fill = "#22c55e" }) => (
        <svg viewBox="0 0 24 24" className={className} fill={fill} aria-hidden="true">
            <path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.787 1.401 8.168L12 18.896 4.665 23.165l1.401-8.168L.132 9.21l8.2-1.192L12 .587z" />
        </svg>
    );

    const HalfStar = ({ className = "h-4 w-4", fill = "#22c55e" }) => (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
            <defs>
                <linearGradient id="halfFill" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="50%" stopColor={fill} />
                    <stop offset="50%" stopColor="lightgray" />
                </linearGradient>
            </defs>
            <path
                d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.787 1.401 8.168L12 18.896 4.665 23.165l1.401-8.168L.132 9.21l8.2-1.192L12 .587z"
                fill="url(#halfFill)"
            />
        </svg>
    );

    if (loading)
        return (
            <section className="w-full">
                <div className="mx-auto max-w-7xl pb-8 px-4 md:px-6 md:pb-10 font-SofiaSans">
                    {/* GRID: LEFT 2/3, RIGHT 1/3 */}
                    <div className="grid grid-cols-1 md:grid-cols-3 items-end gap-8">
                        {/* LEFT (2/3) */}
                        <div className="md:col-span-2 flex flex-col justify-center">
                            {/* Rating pill */}
                            <div className="inline-flex items-center gap-3 rounded-full border border-white/60 bg-white px-3 py-1 shadow-sm">
                                <div className="h-4 w-16 rounded bg-gray-200 animate-pulse" />
                                <span className="text-gray-300">|</span>
                                <div className="flex items-center gap-1">
                                    <div className="h-4 w-4 rounded-full bg-gray-200 animate-pulse" />
                                </div>
                            </div>

                            {/* Rotating line (big) */}
                            <div className="mt-4 space-y-2">
                                <div className="h-10 w-4/5 rounded bg-gray-200 animate-pulse" />
                                <div className="h-10 w-3/5 rounded bg-gray-200 animate-pulse" />
                            </div>

                        </div>

                        {/* RIGHT (1/3) — bottom aligned */}
                        <div className="md:col-span-1 flex items-end justify-end">
                            <ul className="w-full max-w-sm space-y-4">
                                {[0, 1, 2].map((i) => (
                                    <li key={i} className="flex items-center gap-3">
                                        <div className="h-5 w-5 rounded bg-gray-200 animate-pulse" />
                                        <div className="h-4 w-3/4 rounded bg-gray-200 animate-pulse" />
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>
        );


    return (
        <section className="w-full">
            <div className="mx-auto max-w-7xl pb-8 px-4 md:px-6 md:pb-10 font-SofiaSans">
                {/* GRID: LEFT 2/3, RIGHT 1/3 */}
                <div className="grid grid-cols-1 md:grid-cols-3 items-start gap-8">
                    {/* LEFT (2/3) */}
                    <div className="md:col-span-2 text-start flex flex-col justify-center">
                        {/* Rating */}
                        <div className="flex items-center mt-2 gap-4 rounded-full bg-white shadow-sm border border-white/60 px-3 py-1 text-darkprimary w-fit">
                            <span className="text-sm font-semibold">Excellent</span>
                            <span>|</span>
                            <div className="flex items-center gap-1" aria-label="4.5 out of 5 stars">
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <Star key={i} />
                                ))}
                                <HalfStar />
                            </div>
                        </div>

                        <RotatingLine
                            lines={heroText.rotatingLines}
                            interval={2200}
                            duration={450}
                            className="text-4xl sm:text-5xl md:text-6xl text-[#D0E7F7]"
                        />

                        <h1 className="text-4xl sm:text-5xl md:text-6xl mt-2 tracking-tight text-darkprimary">
                            {heroText.mainTitle}
                        </h1>
                    </div>

                    {/* RIGHT (1/3) */}
                    <div className="md:col-span-1 mt-0 md:mt-16 flex justify-end items-end">
                        <ul className="w-full max-w-sm text-darkprimary bg-transparent rounded-2xl shadow-none space-y-4">
                            {safeFeatures
                                .sort((a, b) => (a?.sortOrder ?? 0) - (b?.sortOrder ?? 0))
                                .map((f, i) => {
                                    const Icon = Lucide[f.icon] || Lucide.Stethoscope;
                                    return (
                                        <li key={i} className="flex items-center gap-3 pb-2">
                                            <Icon className="h-5 w-5 text-darkprimary shrink-0" />
                                            <span className="text-sm sm:text-base font-medium">{f.text}</span>
                                        </li>
                                    );
                                })}
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    );
}
