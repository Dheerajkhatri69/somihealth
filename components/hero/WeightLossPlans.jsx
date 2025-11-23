"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useWebsiteData } from "@/contexts/WebsiteDataContext";
import { LoadingPage, WeightLossPlansSkeleton } from "@/components/LoadingSkeleton";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

/* ---------- icons ---------- */
function ArrowRight() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 12h14M13 5l7 7-7 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function AnimatedTitle({
  items = [],
  prefix = "",
  suffix = "",
  interval = 2200,
  duration = 450,
  className = "",
}) {
  const COLOR_CLASSES = [
    "text-[#9e9eff]",
    "text-[#006db0]",
    "text-[#0093af]",
    "text-[#8a8aee]",
  ];

  const safeItems = Array.isArray(items) && items.length > 0 ? items : [""];
  const longestItem = useMemo(
    () =>
      safeItems.reduce(
        (a, b) => (String(b).length > String(a).length ? b : a),
        ""
      ),
    [safeItems]
  );

  const [animating, setAnimating] = useState(false);

  const curItemIdxRef = useRef(0);
  const nextItemIdxRef = useRef(safeItems.length > 1 ? 1 : 0);

  const curColorIdxRef = useRef(
    Math.floor(Math.random() * COLOR_CLASSES.length)
  );
  const nextColorIdxRef = useRef(
    (curColorIdxRef.current + 1) % COLOR_CLASSES.length
  );

  const aliveRef = useRef(true);
  const tRef = useRef(null);

  const pickDifferentColor = (prev) => {
    if (COLOR_CLASSES.length < 2) return prev;
    let idx = Math.floor(Math.random() * COLOR_CLASSES.length);
    if (idx === prev) idx = (idx + 1) % COLOR_CLASSES.length;
    return idx;
  };

  useEffect(() => {
    aliveRef.current = true;

    const cycle = () => {
      if (!aliveRef.current) return;

      nextItemIdxRef.current = (curItemIdxRef.current + 1) % safeItems.length;
      nextColorIdxRef.current = pickDifferentColor(curColorIdxRef.current);

      setAnimating(true);

      tRef.current = setTimeout(() => {
        if (!aliveRef.current) return;

        curItemIdxRef.current = nextItemIdxRef.current;
        curColorIdxRef.current = nextColorIdxRef.current;

        setAnimating(false);

        tRef.current = setTimeout(cycle, interval);
      }, duration);
    };

    tRef.current = setTimeout(cycle, interval);

    return () => {
      aliveRef.current = false;
      if (tRef.current) clearTimeout(tRef.current);
    };
  }, [interval, duration, safeItems.length]);

  const currentText = safeItems[curItemIdxRef.current] ?? "";
  const nextText = safeItems[nextItemIdxRef.current] ?? "";

  const curColorClass = COLOR_CLASSES[curColorIdxRef.current];
  const nextColorClass = COLOR_CLASSES[nextColorIdxRef.current];

  return (
    <h2
      className={`text-start font-SofiaSans text-darkprimary mb-10 text-3xl sm:text-5xl ${className}`}
      style={{ "--rot-dur": `${duration}ms` }}
    >
      {prefix && <span>{prefix} </span>}

      <span
        className="inline-grid align-baseline leading-[1em] h-[1em] whitespace-nowrap overflow-hidden"
        style={{ "--rot-dur": `${duration}ms` }}
      >
        <span className="opacity-0 pointer-events-none col-start-1 row-start-1">
          {longestItem || currentText}
        </span>

        <span
          key={`cur-${curItemIdxRef.current}-${curColorIdxRef.current}-${animating ? "anim" : "idle"
            }`}
          className={`col-start-1 row-start-1 ${curColorClass} ${animating ? "animate-slide-out-up" : "opacity-100"
            } will-change-transform`}
          aria-hidden={animating}
        >
          {currentText}
        </span>

        <span
          key={`next-${nextItemIdxRef.current}-${nextColorIdxRef.current}-${animating ? "anim" : "idle"
            }`}
          className={`col-start-1 row-start-1 ${nextColorClass} ${animating ? "animate-slide-in-up" : "opacity-0"
            } will-change-transform`}
          aria-hidden={!animating}
        >
          {nextText}
        </span>
      </span>

      {suffix && <span> {suffix}</span>}
    </h2>
  );
}

export default function WeightLossPlans() {
  const { data, isLoading, error } = useWebsiteData();

  const plans = useMemo(() => {
    if (!data?.products) return [];
    const allProducts = [];
    Object.values(data.products).forEach((categoryProducts) => {
      Object.values(categoryProducts).forEach((product) => {
        allProducts.push(product);
      });
    });
    const filtered = allProducts.filter((p) => p.showInPlans === true);

    return filtered.map((product) => ({
      name: product.label,
      img: product.heroImage,
      imgAlt: product.shortLabel,
      priceLabel: "Starting At",
      currency: "$",
      price: product.price,
      per: product.unit,
      primary: {
        label: product?.ctas?.primary?.label || "Get Started",
        href: product?.ctas?.primary?.href || "/getstarted",
      },
      secondary: {
        label: product?.ctas?.secondary?.label || "Learn More",
        href:
          product?.ctas?.secondary?.href ||
          `/underdevelopmentmainpage/${product.category}/${product.slug}`,
      },
      plansNote: product?.plansNote || "",
    }));
  }, [data]);

  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const autoplay = React.useMemo(
    () =>
      Autoplay({
        delay: 2500,
        stopOnInteraction: false,
        stopOnMouseEnter: true,
      }),
    []
  );

  const [ph, setPh] = useState({ title: "", items: [] });
  const [phLoading, setPhLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const r = await fetch("/api/planheader", { cache: "no-store" });
        const j = await r.json();
        if (mounted && j?.success) {
          const res = j.result || {};
          setPh({
            title: res.title ?? "",
            items: Array.isArray(res.items) ? res.items : [],
          });
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (mounted) setPhLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  if (error) {
    return (
      <section className="w-full py-10 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Unable to load plans
            </h2>
            <p className="text-gray-600 mb-4">
              Please try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="rounded-md bg-darkprimary px-4 py-2 text-white hover:bg-darkprimary/90"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (!isLoading && plans.length === 0) {
    return (
      <section className="w-full py-10 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              No plans available
            </h2>
            <p className="text-gray-600 mb-4">
              Check back later for our latest offerings.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="rounded-md bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <LoadingPage isLoading={isLoading} fallback={<WeightLossPlansSkeleton />}>
      <section className="w-full mt-10 md:mt-20">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          {phLoading ? (
            <div className="animate-pulse text-start">
              <div className="mx-auto h-6 w-3/4 max-w-xl rounded bg-slate-200" />
            </div>
          ) : (
            <AnimatedTitle
              prefix={ph.title}
              items={
                ph.items?.length
                  ? ph.items
                  : ["Speed", "Stability", "Style", "Somi ❤️"]
              }
              interval={2200}
              duration={450}
            />
          )}

          {plans.length >= 3 ? (
            <div>
              <Carousel
                opts={{ align: "start", loop: true }}
                plugins={prefersReducedMotion ? [] : [autoplay]}
                className="w-full relative py-0"
              >
                <CarouselContent
                  className="touch-pan-y -ml-0 [transform:translateZ(0)]"
                  style={{ willChange: "transform" }}
                >
                  {plans.map((p, i) => (
                    <CarouselItem
                      key={i}
                      className="pl-2 basis-full md:basis-1/2 lg:basis-1/3 [content-visibility:auto]"
                      style={{ willChange: "transform" }}
                    >
                      {/* SIMPLE CARD (no 3D component) */}
                      <div className="w-full">
                        <div
                          className="
                            group/card relative w-full rounded-2xl
                            bg-darkprimary-foreground/20 shadow-sm ring-1 ring-black/5
                            flex flex-col
                            p-6 sm:p-7
                            min-h-[540px]
                          "
                        >
                          {/* TOP (Header + Image) */}
                          <div className="z-10 w-full flex-1 flex flex-col">
                            {/* HEADER */}
                            {/* HEADER */}
                            <div className="text-left pointer-events-none">
                              {/* pill */}
                              <div>
                                <div className="inline-flex items-center gap-2 rounded-full bg-secondary/10 px-3 py-0.5 text-xs font-semibold text-secondary">
                                  {p.priceLabel}
                                </div>
                              </div>

                              {/* price row */}
                              <div className="mt-2 flex items-end gap-1.5">
                                <span className="text-xl font-semibold text-gray-900">
                                  {p.currency}
                                </span>
                                <span className="text-4xl leading-none text-darkprimary sm:text-5xl">
                                  {p.price}
                                </span>
                                <span className="mb-1 text-xs font-semibold text-gray-500">
                                  {p.per}
                                </span>
                              </div>

                              {/* name */}
                              <div>
                                <h3 className="mt-1 text-lg tracking-tight sm:text-2xl font-SofiaSans">
                                  {p.name}
                                </h3>
                              </div>
                            </div>

                            {/* IMAGE */}
                            <div className="relative mt-4 w-full flex items-center justify-center pointer-events-none">
                              <div className="relative h-[260px] sm:h-[270px] md:h-[290px] w-auto">
                                <Image
                                  src={p.img}
                                  alt={p.imgAlt || p.name}
                                  width={480}
                                  height={300}
                                  priority={false}
                                  className="select-none object-contain transition-transform duration-300 ease-out group-hover/card:scale-[1.06]"
                                  sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                                />
                              </div>
                            </div>
                          </div>

                          {/* FOOTER (Buttons + Note slot) */}
                          <div className="-mt-2">
                            {/* BUTTONS */}
                            <div
                              className="z-30 w-full flex flex-col lg:flex-row items-center justify-center gap-2 p-2"
                              data-embla-prevent-drag
                              onPointerDownCapture={(e) => e.stopPropagation()}
                              onMouseDown={(e) => e.stopPropagation()}
                              onClick={(e) => e.stopPropagation()}
                              onTouchStart={(e) => e.stopPropagation()}
                            >
                              <Link
                                href={p.primary.href}
                                className="inline-flex h-10 min-w-[150px] items-center justify-center gap-2 rounded-full bg-darkprimary px-4 text-sm font-semibold text-white hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/60"
                                draggable="false"
                                data-embla-prevent-drag
                                onPointerDownCapture={(e) => e.stopPropagation()}
                              >
                                {p.primary.label}
                                <ArrowRight />
                              </Link>

                              <Link
                                href={p.secondary.href}
                                className="inline-flex h-10 min-w-[150px] items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 text-sm font-semibold text-gray-900 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300"
                                draggable="false"
                                data-embla-prevent-drag
                                onPointerDownCapture={(e) => e.stopPropagation()}
                              >
                                {p.secondary.label}
                              </Link>
                            </div>
                            {/* NOTE SLOT (fixed height) */}
                            <div className="mb-2 min-h-[32px] flex items-center justify-center px-2">
                              {p.plansNote ? (
                                <p className="text-xs text-gray-500 text-center">
                                  {p.plansNote}
                                </p>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>

                {plans.length > 3 && (
                  <>
                    <CarouselPrevious className="left-3 top-1/2 -translate-y-1/2 z-20 bg-white/80 backdrop-blur rounded-full shadow hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary" />
                    <CarouselNext className="right-2 top-1/2 -translate-y-1/2 z-20 bg-white/80 backdrop-blur rounded-full shadow hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary" />
                  </>
                )}
              </Carousel>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {plans.map((p, i) => (
                <div key={i} className="w-full">
                  <div
                    className="
                      group/card relative w-full rounded-2xl
                      bg-darkprimary-foreground/20 shadow-sm ring-1 ring-black/5
                      flex flex-col
                      p-6 sm:p-7
                      min-h-[540px]
                    "
                  >
                    {/* TOP (Header + Image) */}
                    <div className="z-10 w-full flex-1 flex flex-col">
                      {/* HEADER */}
                      <div className="text-center pointer-events-none">
                        <div>
                          <div className="mx-auto inline-flex items-center gap-2 rounded-full bg-secondary/10 px-3 py-0.5 text-xs font-semibold text-secondary">
                            {p.priceLabel}
                          </div>
                        </div>

                        <div>
                          <div className="mt-2 flex items-end justify-center gap-1.5">
                            <span className="text-xl font-semibold text-gray-900">
                              {p.currency}
                            </span>
                            <span className="text-4xl leading-none text-darkprimary sm:text-5xl">
                              {p.price}
                            </span>
                            <span className="mb-1 text-xs font-semibold text-gray-500">
                              {p.per}
                            </span>
                          </div>
                        </div>

                        <div>
                          <h3 className="mt-1 text-lg font-bold tracking-tight sm:text-2xl font-SofiaSans">
                            {p.name}
                          </h3>
                        </div>
                      </div>

                      {/* IMAGE */}
                      <div className="relative mt-4 w-full flex items-center justify-center pointer-events-none">
                        <div className="relative h-[260px] sm:h-[270px] md:h-[290px] w-auto">
                          <span className="vial-shadow pointer-events-none absolute bottom-24 left-1/2 h-3 w-2/3 -translate-x-1/2 rounded-full" />
                          <Image
                            src={p.img}
                            alt={p.imgAlt || p.name}
                            width={480}
                            height={300}
                            priority={false}
                            className="select-none object-contain transition-transform duration-300 ease-out group-hover/card:-translate-y-0.5 group-hover/card:scale-[1.06]"
                            sizes="(min-width: 1024px) 50vw, 100vw"
                          />
                        </div>
                      </div>
                    </div>
                    {/* FOOTER (Buttons + Note slot) */}
                    <div className="-mt-2">
                      {/* BUTTONS */}
                      <div
                        className="z-30 w-full flex flex-col lg:flex-row items-center justify-center gap-2 p-2"
                        data-embla-prevent-drag
                        onPointerDownCapture={(e) => e.stopPropagation()}
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={(e) => e.stopPropagation()}
                        onTouchStart={(e) => e.stopPropagation()}
                      >
                        <Link
                          href={p.primary.href}
                          className="inline-flex h-10 min-w-[160px] items-center justify-center gap-2 rounded-full bg-darkprimary px-4 text-sm font-semibold text-white hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/60"
                          draggable="false"
                          data-embla-prevent-drag
                          onPointerDownCapture={(e) => e.stopPropagation()}
                        >
                          {p.primary.label}
                          <ArrowRight />
                        </Link>

                        <Link
                          href={p.secondary.href}
                          className="inline-flex h-10 min-w-[160px] items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 text-sm font-semibold text-gray-900 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300"
                          draggable="false"
                          data-embla-prevent-drag
                          onPointerDownCapture={(e) => e.stopPropagation()}
                        >
                          {p.secondary.label}
                        </Link>
                      </div>

                      {/* NOTE SLOT (fixed height) */}
                      <div className="mb-2 min-h-[32px] flex items-center justify-center px-2">
                        {p.plansNote ? (
                          <p className="text-xs text-gray-500 text-center">
                            {p.plansNote}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <style jsx>{`
          .vial-shadow {
            background: radial-gradient(
              closest-side,
              rgba(0, 0, 0, 0.28),
              transparent
            );
            opacity: 0.9;
            transform: translateY(6px) scale(0.85);
          }
          @media (hover: none) {
            .vial-img {
              transform: none !important;
            }
          }
        `}</style>
      </section>
    </LoadingPage>
  );
}
