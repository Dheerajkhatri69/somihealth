"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CardContainer, CardBody, CardItem } from "@/components/ui/3d-card";
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

      // NEW: pull from product.ctas / product.plansNote
      primary: {
        label: product?.ctas?.primary?.label || "Get Started",
        href: product?.ctas?.primary?.href || "/getstarted",
      },
      secondary: {
        label: product?.ctas?.secondary?.label || "Learn More",
        href: product?.ctas?.secondary?.href || `/underdevelopmentmainpage/${product.category}/${product.slug}`,
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

  const [ph, setPh] = useState({ title: "", subtitle: "" });
  const [phLoading, setPhLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const r = await fetch("/api/planheader", { cache: "no-store" });
        const j = await r.json();
        if (mounted && j?.success)
          setPh({ title: j.result?.title, subtitle: j.result?.subtitle });
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
      <section className="w-full mt-20">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          {phLoading ? (
            <div className="animate-pulse text-center">
              <div className="mx-auto h-6 w-3/4 max-w-xl rounded bg-slate-200" />
              <div className="mx-auto mt-3 h-4 w-5/6 max-w-2xl rounded bg-slate-200" />
            </div>
          ) : (
            <>
              <h2 className="text-center font-SofiaSans text-3xl sm:text-5xl">
                {ph.title ||
                  "Wellness Plan designed by clinicians to optimize your health."}
              </h2>
              <div className="flex justify-center">
                <p className="text-gray-600 mb-4 text-center max-w-2xl">
                  {ph.subtitle ||
                    "Your journey deserves more than one-size-fits-all. Find the tailored medication plan built to support your goals."}
                </p>
              </div>
            </>
          )}

          {plans.length >= 3 ? (
            <div>
              <Carousel
                opts={{ align: "start", loop: true }}
                plugins={prefersReducedMotion ? [] : [autoplay]}
                className="w-full relative"
              >
                <CarouselContent
                  className="touch-pan-y -ml-0 [transform:translateZ(0)]"
                  style={{ willChange: "transform" }}
                >
                  {plans.map((p, i) => (
                    <CarouselItem
                      key={i}
                      className="pl-2 basis-full md:basis-1/2 lg:basis-1/3 [content-visibility:auto] [contain-intrinsic-size:1400px_800px]"
                      style={{ willChange: "transform" }}
                    >
                      <CardContainer className="w-full">
                        <CardBody
                          className="
                            group/card relative w-full rounded-2xl
                            bg-darkprimary-foreground/20 shadow-sm ring-1 ring-black/5
                            flex flex-col items-center justify-between
                            p-6 sm:p-7
                            min-h-[500px]
                            overflow-visible
                          "
                        >
                          {/* TOP (static text; no pointer interactions) */}
                          <div className="z-10 w-full text-center pointer-events-none">
                            <CardItem translateZ={40}>
                              <div className="mx-auto inline-flex items-center gap-2 rounded-full bg-secondary/10 px-3 py-0.5 text-xs font-semibold text-secondary">
                                {p.priceLabel}
                              </div>
                            </CardItem>

                            <CardItem translateZ={60}>
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
                            </CardItem>

                            <CardItem translateZ={60}>
                              <h3 className="mt-1 text-lg font-bold tracking-tight sm:text-2xl font-SofiaSans">
                                {p.name}
                              </h3>
                            </CardItem>
                          </div>

                          {/* IMAGE + BUTTON BOX */}
                          <div className="relative z-10 flex flex-col items-center justify-center w-full">
                            {/* product image */}
                            <img
                              src={p.img}
                              alt={p.imgAlt || p.name}
                              className="pointer-events-none h-[260px] sm:h-[270px] md:h-[290px] w-auto object-contain select-none transition-transform duration-300 ease-out group-hover/card:scale-[1.06]"
                              draggable="false"
                            />

                            {/* ---- Text below image ---- */}
                            <p className="mt-8 text-xs text-gray-500 text-center">
                              {p.plansNote}
                            </p>


                            {/* ---- Buttons inside box ---- */}
                            <div
                              className="absolute left-1/2 bottom-0 mb-4 -translate-x-1/2 w-[92%] sm:w-[85%] flex flex-col lg:flex-row items-center justify-center gap-2 p-2 z-30 "
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
                          </div>

                        </CardBody>
                      </CardContainer>
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
                <CardContainer key={i} className="w-full">
                  <CardBody
                    className="
                      group/card relative w-full rounded-2xl
                      bg-darkprimary-foreground/20 shadow-sm ring-1 ring-black/5
                      flex flex-col items-center justify-between
                      p-6 sm:p-7
                      min-h-[500px]
                      overflow-visible
                    "
                  >
                    {/* TOP */}
                    <div className="z-10 w-full text-center pointer-events-none">
                      <CardItem translateZ={40}>
                        <div className="mx-auto inline-flex items-center gap-2 rounded-full bg-secondary/10 px-3 py-0.5 text-xs font-semibold text-secondary">
                          {p.priceLabel}
                        </div>
                      </CardItem>

                      <CardItem translateZ={60}>
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
                      </CardItem>

                      <CardItem translateZ={60}>
                        <h3 className="mt-1 text-lg font-bold tracking-tight sm:text-2xl font-SofiaSans">
                          {p.name}
                        </h3>
                      </CardItem>
                    </div>

                    {/* IMAGE + BUTTON BOX */}
                    <div className="relative z-10 flex items-center justify-center pt-2 w-full">
                      <div className="relative w-80 h-[350px] sm:h-[360px] md:h-[380px]">
                        <span className="vial-shadow pointer-events-none absolute bottom-24 left-1/2 h-3 w-2/3 -translate-x-1/2 rounded-full" />
                        <img
                          src={p.img}
                          alt={p.imgAlt || p.name}
                          className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-[260px] sm:h-[270px] md:h-[290px] w-auto object-contain select-none transition-transform duration-300 ease-out group-hover/card:-translate-y-0.5 group-hover/card:scale-[1.06]"
                          draggable="false"
                        />

                        <div
                          className="
                            absolute left-1/2 bottom-0 -translate-x-1/2
                            w-[92%] sm:w-[85%]
                            flex flex-col lg:flex-row items-center justify-center gap-2 p-2
                            z-30
                          "
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
                            style={{
                              "--fx86-base": "transparent",
                              "--fx86-glow": "#364c781d",
                            }}
                            draggable="false"
                            data-embla-prevent-drag
                            onPointerDownCapture={(e) => e.stopPropagation()}
                          >
                            {p.secondary.label}
                          </Link>
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </CardContainer>
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
