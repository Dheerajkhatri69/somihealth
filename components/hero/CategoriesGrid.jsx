"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious
} from "@/components/ui/carousel";
import WeightLossPlansV3 from "./WeightLossPlans";

/* ---------- Icon ---------- */
function ArrowRight() {
    return (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

/* ---------- Card ---------- */
function CategoryCard({ title, img, href, label = "Learn More", comingSoon = false }) {
    return (
        <div className="relative overflow-hidden rounded-[32px]">
            <img src={img} alt="" className="w-full h-full max-h-[500px] object-cover" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/20 via-black/0 to-black/70" />
            <div className="absolute left-6 top-6">
                <h3 className="text-2xl font-semibold text-white drop-shadow">{title}</h3>
            </div>
            <div className="absolute bottom-4 left-4">
                {comingSoon ? (
                    <span
                        className="fx86 inline-flex items-center gap-3 rounded-full bg-secondary px-5 py-2 font-semibold text-white"
                        style={{ "--fx86-base": "transparent" }}
                        aria-disabled="true"
                    >
                        Coming Soon <ArrowRight />
                    </span>
                ) : (
                    <Link
                        href={href}
                        className="fx86 inline-flex items-center gap-3 hover:bg-transparent rounded-full bg-secondary px-5 py-2 font-semibold text-white hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
                        style={{ "--fx86-base": "transparent" }}
                    >
                        {label} <ArrowRight />
                    </Link>
                )}
            </div>
        </div>
    );
}

/* ---------- Grid + Mobile horizontal carousel ---------- */
export default function CategoriesGrid() {
    const items = [
        { title: "Weight Loss", img: "/hero/1.jpg", href: "/underdevelopmentmainpage/weight-loss" },
        { title: "Longevity", img: "/hero/2.png", href: "/underdevelopmentmainpage/longevity" },
        { title: "Sexual Health", img: "/hero/3.png", href: "/underdevelopmentmainpage/sexual-health" },
        { title: "Skin+Hair", img: "/hero/4.jpg", href: "/underdevelopmentmainpage/skin-hair" },
        // { title: "Skin+Hair", img: "/hero/4.jpg", href: "#", comingSoon: true },
    ];

    const [api, setApi] = React.useState/** @type {CarouselApi | null} */(null);
    const [current, setCurrent] = React.useState(0);

    React.useEffect(() => {
        if (!api) return;
        setCurrent(api.selectedScrollSnap());
        api.on("select", () => setCurrent(api.selectedScrollSnap()));
    }, [api]);

    return (
        <section className="w-full watermark bg-[#F4F4F8] py-10 sm:py-14"
    
                    data-text="somi"
                    style={{
                        '--wm-size': '250px',     // text size
                        '--wm-stroke-c': '#364c781d',                   // outline color
                        '--wm-stroke-w': '2px',                       // outline width
                        '--wm-fill': 'transparent',                   // set e.g. 'rgba(0,0,0,.06)' for filled text
                        '--wm-font': '"Sofia Sans", ui-sans-serif',      // font family
                        '--wm-weight': 700,                           // font weight
                        '--wm-tracking': '0em',                    // letter spacing
                        '--wm-opacity': 1,                         // overall opacity
                        '--wm-left': '-11rem',                         // horizontal offset
                        '--wm-rotate': '90deg',                       // rotate; use '0deg' for horizontal
                    }}
        >
            <div className="mx-auto max-w-7xl px-4 md:px-6">
                <div
                    className="watermark"
                    data-text="somi"
                    style={{
                        '--wm-size': '120px',     // text size
                        '--wm-stroke-c': '#364c781d',                   // outline color
                        '--wm-stroke-w': '2px',                       // outline width
                        '--wm-fill': 'transparent',                   // set e.g. 'rgba(0,0,0,.06)' for filled text
                        '--wm-font': '"Sofia Sans", ui-sans-serif',      // font family
                        '--wm-weight': 700,                           // font weight
                        '--wm-tracking': '0em',                    // letter spacing
                        '--wm-opacity': 1,                         // overall opacity
                        '--wm-left': '0rem',                         // horizontal offset
                        '--wm-top': '-3rem',                         // horizontal offset
                        '--wm-rotate': '0deg',                       // rotate; use '0deg' for horizontal
                    }}
                >
                </div>

                {/* Mobile: horizontal slider (1 per view) */}
                <div className="lg:hidden">
                    <Carousel
                        setApi={setApi}
                        opts={{ align: "start", loop: false }}
                        className="w-full"
                    >
                        <CarouselContent>
                            {items.map((it, i) => (
                                <CarouselItem id={`slide-${i}`} key={it.title} className="basis-full">
                                    <Card className="border-0 bg-transparent shadow-none">
                                        <CardContent className="p-0">
                                            <CategoryCard {...it} />
                                        </CardContent>
                                    </Card>
                                </CarouselItem>
                            ))}
                        </CarouselContent>

                        {/* Optional arrows */}
                        <CarouselPrevious className="left-2" />
                        <CarouselNext className="right-2" />
                    </Carousel>

                    {/* Dots (clickable) */}
                    <div className="mt-5 flex justify-center gap-3" role="tablist" aria-label="Category slides">
                        {items.map((_, i) => {
                            const isActive = i === current;
                            return (
                                <button
                                    key={i}
                                    type="button"
                                    role="tab"
                                    aria-selected={isActive}
                                    aria-controls={`slide-${i}`}
                                    onClick={() => api && api.scrollTo(i)}
                                    className={`h-1.5 w-24 cursor-pointer rounded-full transition-colors
          focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2
          ${isActive ? "bg-secondary" : "bg-secondary/40 hover:bg-secondary/60"}`}
                                />
                            );
                        })}
                    </div>

                </div>

                {/* Desktop: 4 in a row */}
                <div className="hidden lg:grid grid-cols-4 gap-6 md:gap-8">
                    {items.map((it) => (
                        <CategoryCard key={it.title} {...it} />
                    ))}
                </div>
            </div>

            <WeightLossPlansV3 />
        </section>
    );
}
