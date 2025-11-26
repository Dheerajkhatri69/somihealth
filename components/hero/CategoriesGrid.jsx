"use client";

import React, { useMemo, useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { useWebsiteData } from "@/contexts/WebsiteDataContext";
import {
  LoadingPage,
  CategoriesGridSkeleton,
} from "@/components/LoadingSkeleton";

/* ---------- Icon ---------- */
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

/* ---------- Category Card ---------- */
const CategoryCard = React.memo(function CategoryCard({
  title,
  img,
  href,
  label = "Learn More",
  comingSoon = false,
  priority = false,
}) {
  return (
    <div className="relative overflow-hidden rounded-[32px] [contain:content]" style={{ willChange: "transform" }}>
      {/* next/image with fixed ratio via wrapper */}
      <div className="relative w-full" style={{ aspectRatio: "4 / 5" }}>
        <Image
          src={img}
          alt={title}
          fill
          sizes="(max-width: 1024px) 100vw, 25vw"
          priority={priority}
          loading={priority ? undefined : "lazy"}
          decoding="async"
          className="object-cover"
        />
      </div>

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/20 via-black/0 to-black/70" />
      <div className="absolute left-6 top-6">
        <h3 className="text-2xl font-semibold font-SofiaSans text-white drop-shadow">{title}</h3>
      </div>
      <div className="absolute bottom-4 left-4">
        {comingSoon ? (
          <span
            className="fx86 inline-flex items-center gap-3 rounded-full bg-darkprimary px-5 py-2 font-semibold text-white"
            style={{ "--fx86-base": "transparent" }}
            aria-disabled="true"
          >
            Coming Soon <ArrowRight />
          </span>
        ) : (
          <div className="relative inline-block">

            {/* If href is /general-health → DISABLED button */}
            {href === "/general-health" ? (
              <div
                className="fx86 inline-flex items-center gap-3 font-SofiaSans rounded-full bg-darkprimary px-5 py-2 font-semibold text-white opacity-60 cursor-not-allowed select-none"
                style={{ "--fx86-base": "transparent" }}
              >
                {label} <ArrowRight />
              </div>
            ) : (
              /* Normal clickable button */
              <Link
                href={href}
                className="fx86 inline-flex items-center gap-3 font-SofiaSans hover:bg-transparent rounded-full bg-darkprimary px-5 py-2 font-semibold text-white hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
                style={{ "--fx86-base": "transparent" }}
              >
                {label} <ArrowRight />
              </Link>
            )}

            {/* Coming Soon Badge (ITALIC) */}
            {href === "/general-health" && (
              <span className="absolute -top-2 -right-2 bg-yellow-400 text-black text-xs font-semibold italic px-2 py-1 rounded-full shadow">
                Coming Soon
              </span>
            )}
          </div>

        )}
      </div>
    </div>
  );
});
/* ---------- Main Component ---------- */
export default function CategoriesGrid() {
  const { getGridItems, isLoading, error } = useWebsiteData();
  const items = getGridItems();

  const showStaticDesktop = items.length <= 4;
  const firstFour = useMemo(() => items.slice(0, 4), [items]);

  // Mobile state
  const [mobileApi, setMobileApi] = useState(null);
  const [mobileCurrent, setMobileCurrent] = useState(0);

  useEffect(() => {
    if (!mobileApi) return;

    const onSelect = () => setMobileCurrent(mobileApi.selectedScrollSnap());
    mobileApi.on("select", onSelect);
    onSelect();

    return () => {
      mobileApi.off("select", onSelect);
    };
  }, [mobileApi]);

  // ... (and make sure to include setApi={setMobileApi} on the mobile Carousel)
  // Reduced motion
  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Autoplay Plugins (separate for mobile & desktop)
  const mobileAutoplay = useRef(
    Autoplay({
      delay: 2500,
      stopOnInteraction: false,
      stopOnMouseEnter: true,
    })
  );

  const desktopAutoplay = useRef(
    Autoplay({
      delay: 2500,
      stopOnInteraction: false,
      stopOnMouseEnter: true,
    })
  );


  if (error) {
    return (
      <section className="w-full watermark bg-[#F4F4F8] py-10 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Unable to load categories
            </h2>
            <p className="text-gray-600 mb-4">
              Please try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="rounded-md bg-darkprimary px-4 py-2 text-white"
            >
              Refresh
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <LoadingPage isLoading={isLoading} fallback={<CategoriesGridSkeleton />}>
      <section className="w-full watermark bg-[#F4F4F8] py-10 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          {/* ---------- MOBILE CAROUSEL (FIXED) ---------- */}
          <div className="lg:hidden">
            <Carousel
              opts={{ align: "start", loop: true }}
              plugins={prefersReducedMotion ? [] : [mobileAutoplay.current]}
              className="w-full relative"
              setApi={setMobileApi}
            >
              <CarouselContent >
                {items.map((it, i) => (
                  <CarouselItem
                    key={it.title}
                    className="basis-full [content-visibility:auto]" // FIX: removed huge intrinsic size
                  >
                    <Card className="border-0 bg-transparent shadow-none">
                      <CardContent className="p-0">
                        <CategoryCard {...it} priority={i === 0} />
                      </CardContent>
                    </Card>
                  </CarouselItem>
                ))}
              </CarouselContent>

              {items.length > 1 && (
                <>
                  <CarouselPrevious className="left-2 top-1/2 -translate-y-1/2 z-20 bg-white/80 backdrop-blur rounded-full shadow" />
                  <CarouselNext className="right-2 top-1/2 -translate-y-1/2 z-20 bg-white/80 backdrop-blur rounded-full shadow" />
                </>
              )}
            </Carousel>

            {/* Dots */}
            <div className="mt-5 flex justify-center gap-3">
              {items.map((_, i) => (
                <button
                  key={i}
                  aria-pressed={i === mobileCurrent}
                  onClick={() => mobileApi?.scrollTo(i)}
                  className={`h-1.5 w-24 rounded-full transition-colors ${i === mobileCurrent
                      ? "bg-secondary"
                      : "bg-secondary/40 hover:bg-secondary/60"
                    }`}
                />
              ))}
            </div>
          </div>

          {/* ---------- DESKTOP (UNCHANGED) ---------- */}
          {showStaticDesktop ? (
            <div className="hidden lg:grid grid-cols-4 gap-6 md:gap-8">
              {firstFour.map((it, i) => (
                <CategoryCard key={it.title} {...it} priority={i === 0} />
              ))}
            </div>
          ) : (
            <div className="hidden lg:block">
              <Carousel
                opts={{ align: "start", loop: true }}
                plugins={prefersReducedMotion ? [] : [desktopAutoplay.current]}
                className="w-full relative"
              >
                <CarouselContent className="-ml-2">
                  {items.map((it, i) => (
                    <CarouselItem
                      key={it.title}
                      className="basis-1/4 [content-visibility:auto]"
                    >
                      <Card className="border-0 bg-transparent shadow-none">
                        <CardContent className="p-0">
                          <CategoryCard {...it} priority={i === 0} />
                        </CardContent>
                      </Card>
                    </CarouselItem>
                  ))}
                </CarouselContent>

                <CarouselPrevious className="left-4 top-1/2 -translate-y-1/2 z-20 bg-white/80 rounded-full shadow" />
                <CarouselNext className="right-4 top-1/2 -translate-y-1/2 z-20 bg-white/80 rounded-full shadow" />
              </Carousel>
            </div>
          )}
        </div>
      </section>
    </LoadingPage>
  );
}