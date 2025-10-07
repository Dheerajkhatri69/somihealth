"use client";

import Image from "next/image";
import { useEffect, useState, useRef, useCallback } from "react";

export function TabsDemo() {
    const [content, setContent] = useState({
        tabs: [],
        watermark: {
            text: "somi",
            size: "160px",
            strokeColor: "#364c781d",
            strokeWidth: "2px",
            fill: "transparent",
            font: '"Sofia Sans", ui-sans-serif',
            weight: 700,
            tracking: "0em",
            opacity: 1,
            left: "0rem",
            top: "8rem",
            rotate: "0deg",
        },
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchContent();
    }, []);

    async function fetchContent() {
        setLoading(true);
        try {
            const res = await fetch("/api/results", { cache: "no-store" });
            const data = await res.json();
            if (data?.success) setContent(data.result);
        } catch (error) {
            console.error("Error fetching Results content:", error);
        } finally {
            setLoading(false);
        }
    }

    const fallbackContent = {
        tabs: [
            {
                title: "Take the Questionnaire",
                value: "step1",
                color: "#364c78",
                bg: "#F4F6FB",
                bullets: ["Unlock Your Best Self", "You Deserve This!"],
                body:
                    "Fill out a short form that captures your medical history, current health status, and goals.",
                icon: "Beaker",
            },
            {
                title: "Expert Guidance & Help",
                value: "step2",
                color: "#364c78",
                bg: "#F4F6FB",
                bullets: ["Virtual Help Available", "Stay Comfortable"],
                body:
                    "A licensed provider reviews your form to confirm eligibility and safety.",
                icon: "ShieldCheck",
            },
            {
                title: "Receive Medication in 2–5 Days",
                value: "step3",
                color: "#364c78",
                bg: "#F4F6FB",
                bullets: ["Fast Shipping", "Fast Delivery"],
                body:
                    "Once approved, your RX is sent to the pharmacy and delivered with clear instructions.",
                icon: "BadgeDollarSign",
            },
        ],
        watermark: {
            text: "somi",
            size: "160px",
            strokeColor: "#364c781d",
            strokeWidth: "2px",
            fill: "transparent",
            font: '"Sofia Sans", ui-sans-serif',
            weight: 700,
            tracking: "0em",
            opacity: 1,
            left: "0rem",
            top: "8rem",
            rotate: "0deg",
        },
        header: {
            eyebrow: "Feel stronger, healthier, and more confident",
            headlineLeft: "How it works",
            headlineRight: "at Somi Health",
        },
        image: "/hero/bmilady.png",
    };

    const display = loading ? fallbackContent : { ...fallbackContent, ...content };

    // Map API tabs -> steps (no text changes)
    const steps = Array.isArray(display.tabs)
        ? display.tabs.map((t, idx) => ({
            idx: idx + 1,
            color: t.color || "#364c78",
            title: t.title,
            desc: t.body ?? "",
            cap1: t.bullets?.[0] ?? "",
            cap2: t.bullets?.[1] ?? "",
        }))
        : [];

    // ---------- Smart image fit (works for any aspect ratio) ----------
    const imgBoxRef = useRef(null);
    const [fit, setFit] = useState("cover"); // 'cover' | 'contain'
    const naturalRef = useRef({ w: 0, h: 0 });

    const recomputeFit = useCallback(() => {
        const box = imgBoxRef.current?.getBoundingClientRect?.();
        const { w, h } = naturalRef.current;
        if (!box || !w || !h) return;

        const imgR = w / h;
        const boxR = box.width / box.height;

        // How much would 'cover' crop? (0 = no crop, 1 = full)
        const cropFrac = imgR >= boxR ? 1 - boxR / imgR : 1 - imgR / boxR;

        // Prefer 'cover' unless the crop would be extreme
        setFit(cropFrac > 0.52 ? "contain" : "cover"); // 52% is a generous cutoff
    }, []);

    useEffect(() => {
        const onResize = () => recomputeFit();
        window.addEventListener("resize", onResize);

        // re-evaluate when the column size changes (timeline content grows/shrinks)
        let ro;
        if (typeof ResizeObserver !== "undefined" && imgBoxRef.current) {
            ro = new ResizeObserver(() => recomputeFit());
            ro.observe(imgBoxRef.current);
        }
        return () => {
            window.removeEventListener("resize", onResize);
            ro?.disconnect();
        };
    }, [recomputeFit]);

    if (loading) {
        return (
            <section className="relative isolate w-full py-10 sm:py-14">
                <div className="mx-auto max-w-7xl px-4 md:px-6">
                    <div className="grid items-center gap-8 md:grid-cols-12 md:gap-12">
                        <div className="md:col-span-6 h-[520px] rounded-2xl bg-gray-200 animate-pulse" />
                        <div className="md:col-span-6 space-y-5">
                            <div className="h-4 w-56 rounded bg-gray-200 animate-pulse" />
                            <div className="h-10 w-3/4 rounded bg-gray-200 animate-pulse" />
                            <div className="h-28 w-full rounded-2xl bg-gray-200 animate-pulse" />
                            <div className="h-28 w-full rounded-2xl bg-gray-200 animate-pulse" />
                            <div className="h-28 w-full rounded-2xl bg-gray-200 animate-pulse" />
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="relative isolate w-full overflow-hidden mt-10 bg-lightprimary">
            <div className="mx-auto max-w-7xl px-4 md:px-6 py-10 sm:py-14">
                <div className="grid items-stretch gap-8 md:grid-cols-12 md:gap-12">
                    {/* LEFT — big image (always shows full image, no crop) */}
                    {/* LEFT — big image (match right side height) */}
                    <div className="md:col-span-6 flex">
                        <div className="relative h-full w-full overflow-hidden rounded-2xl md:min-h-[520px]">
                            <Image
                                src={display.image || "/hero/bmilady.png"}
                                alt="How it works"
                                fill
                                className="object-cover rounded-2xl"
                                sizes="(max-width: 1024px) 100vw, 50vw"
                                priority
                            />

                            {/* Optional blurred backdrop, kept consistent */}
                            <Image
                                src={display.image || "/hero/bmilady.png"}
                                alt=""
                                fill
                                className="absolute inset-0 -z-10 object-cover blur-lg scale-110 opacity-20 rounded-2xl"
                                aria-hidden
                            />
                        </div>
                    </div>


                    {/* RIGHT — header + vertical timeline */}
                    <div className="md:col-span-6">
                        <p className="text-base font-SofiaSans tracking-[.12em] text-darkprimary/70 uppercase">
                            {display.header?.eyebrow || "Feel stronger, healthier, and more confident"}
                        </p>
                        <h2 className="mt-2 font-SofiaSans text-[28px] leading-tight text-darkprimary sm:text-[36px] md:text-[40px]">
                            <span>
                                {display.header?.headlineLeft || "How it works"}
                            </span>{" "}
                            <span className="font-bold">{display.header?.headlineRight || "at Somi Health"}</span>
                        </h2>

                        {/* Timeline */}
                        <div className="relative mt-8 pl-6">
                            <span className="absolute left-2 top-0 h-full w-px bg-secondary/40" aria-hidden="true" />
                            <div className="space-y-8">
                                {steps.map((s) => (
                                    <div key={s.idx} className="relative font-SofiaSans">
                                        {(s.cap1 || s.cap2) && (
                                            <div className="mb-2 pl-3 text-[14px] leading-5">
                                                {s.cap1 && <p className="font-semibold text-lg text-secondary">{s.cap1}</p>}
                                                {s.cap2 && <p className="text-secondary/70 text-lg">{s.cap2}</p>}
                                            </div>
                                        )}
                                        <div className="relative rounded-2xl bg-white p-5 sm:p-6 shadow-sm ring-1 ring-black/5">
                                            <span
                                                className="absolute left-[-10px] top-8 block h-5 w-5 rotate-45 rounded-md shadow-sm ring-1 ring-black/5"
                                                style={{ backgroundColor: "#ffffff" }}
                                                aria-hidden="true"
                                            />
                                            <span
                                                className="absolute left-0 top-0 h-1 w-full rounded-t-2xl"
                                                style={{ backgroundColor: s.color }}
                                                aria-hidden="true"
                                            />
                                            <h3 className="mt-2 text-center text-lg font-semibold text-gray-800">{s.title}</h3>
                                            <p className="mt-3 text-[16px] sm:text[17px] leading-7 text-gray-700 text-center">{s.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        {/* /Timeline */}
                    </div>
                </div>
            </div>
        </section>
    );
}
