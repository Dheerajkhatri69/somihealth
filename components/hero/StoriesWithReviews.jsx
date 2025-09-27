"use client";

import * as React from "react";
import Link from "next/link";

/* shadcn carousel */
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

/* icons */
const Arrow = ({ dir = "right", className = "h-5 w-5" }) => (
  <svg
    viewBox="0 0 24 24"
    className={`${className} ${dir === "left" ? "rotate-180" : ""}`}
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M5 12h14M13 5l7 7-7 7"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const Star = ({ className = "h-4 w-4" }) => (
  <svg viewBox="0 0 24 24" className={className} fill="#F8C33C" aria-hidden="true">
    <path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.787 1.401 8.168L12 18.896 4.665 23.165l1.401-8.168L.132 9.21l8.2-1.192L12 .587z" />
  </svg>
);

const Verified = ({ className = "h-5 w-5" }) => (
  <svg viewBox="0 0 24 24" className={className} fill="#3B82F6" aria-hidden="true">
    <path d="M12 2l2.1 2.1 2.97-.49-.49 2.97L19.5 9l-2.02 2.02.49 2.97-2.97-.49L12 16.5l-2.1-2.1-2.97.49.49-2.97L5 9l2.02-2.02-.49-2.97 2.97.49L12 2zm-1.2 10.6l1.8-1.8 2.7-2.7-1.06-1.06-2.44 2.44-1.44-1.44-1.06 1.06 2.5 2.5z" />
  </svg>
);

/* --------- Review Card (redesigned, same colors) --------- */
function ReviewCard({ quote, author, rating = 5, verified = true }) {
  const stars = Math.max(0, Math.min(5, Math.round(rating)));

  return (
    <figure className="group relative h-full overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-black/5 transition-shadow hover:shadow-md">
      <div className="p-6 sm:p-7">
        {/* header */}
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1" aria-label={`${stars} out of 5 stars`}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className={`h-4 w-4 ${i < stars ? "" : "opacity-25"}`} />
            ))}
          </div>
          {verified && (
            <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-semibold text-gray-700">
              <Verified className="h-4 w-4" />
              Verified
            </span>
          )}
        </div>

        {/* body */}
        <blockquote className="relative">
          <span className="absolute left-0 top-1 h-6 w-1 rounded-full bg-darkprimary/20" aria-hidden="true" />
          <p className="clamped break-words hyphens-auto pl-3 text-[15px] leading-6 text-gray-800 sm:text-base">
            {quote}
          </p>
        </blockquote>

        {/* footer */}
        <figcaption className="mt-6 flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-900">{author}</span>
          <span className="text-xs tracking-wide text-gray-500">Patient</span>
        </figcaption>
      </div>

      {/* clamp */}
      <style jsx>{`
        .clamped {
          display: -webkit-box;
          -webkit-line-clamp: 6;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        @media (min-width: 640px) {
          .clamped {
            -webkit-line-clamp: 8;
          }
        }
      `}</style>
    </figure>
  );
}

/* ===== Main Section – heading top-left, button top-right, 3 cards visible ===== */
export default function StoriesWithReviews() {
  const headline = "Real stories from real patients on their journey to better health.";
  const cta = { label: "Start Your Journey", href: "/getstarted" };

  const [reviews, setReviews] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetchReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchReviews() {
    try {
      const res = await fetch("/api/reviews", { cache: "no-store" });
      const data = await res.json();
      if (data?.success && Array.isArray(data.result) && data.result.length) {
        setReviews(data.result);
      } else {
        setReviews(DEFAULT_REVIEWS);
      }
    } catch (e) {
      console.error(e);
      setReviews(DEFAULT_REVIEWS);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <section className="relative isolate w-full bg-lightprimary-foreground py-10 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="rounded-3xl bg-darkprimary px-5 py-8 sm:px-8 sm:py-10">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div className="h-10 w-2/3 animate-pulse rounded bg-white/20" />
              <div className="h-10 w-40 animate-pulse rounded bg-white/20" />
            </div>
            <div className="h-64 w-full animate-pulse rounded-2xl bg-white/20" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative isolate w-full bg-lightprimary-foreground py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="rounded-3xl bg-darkprimary px-5 py-8 sm:px-8 sm:py-10">
          {/* top bar: heading left, button right */}
          {/* TOP BAR — rating left, CTA right (no color changes) */}
          {(() => {
            const emphasis = "for themselves";
            const parts = (headline || "").split(emphasis);
            const hasEmphasis = parts.length > 1;

            return (
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                {/* Left: Rating strip + Headline */}
                <div className="min-w-0">
                  {/* Rating strip (Excellent • ★★★★★ • Trustpilot) */}
                  <div className="flex items-center gap-3 text-white">
                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold">
                      Excellent
                    </span>

                    <div className="flex items-center gap-1" aria-label="5 out of 5 stars">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="h-4 w-4" />
                      ))}
                    </div>

                    <span className="text-xs font-semibold opacity-90">
                      Trustpilot
                    </span>
                  </div>

                  {/* Headline (with optional italic segment) */}
                  <h2 className="mt-3 font-SofiaSans text-3xl font-bold leading-tight text-white sm:text-4xl">
                    {hasEmphasis ? (
                      <>
                        {parts[0]}
                        <span className="italic text-white/90">{emphasis}</span>
                        {parts[1]}
                      </>
                    ) : (
                      headline
                    )}
                  </h2>
                </div>

                {/* Right: CTA */}
                <Link
                  href={cta.href}
                  className="fx86 inline-flex h-10 min-w-[250px] items-center justify-between rounded-3xl border border-lightprimary bg-transparent px-6 py-2 text-base font-semibold text-lightprimary hover:text-darkprimary shadow-sm md:px-10"
                  style={{ "--fx86-base": "transparent", "--fx86-glow": "#E9ECF1" }}
                >
                  {cta.label}
                  <Arrow />
                </Link>
              </div>
            );
          })()}

          {/* carousel: 1 / 2 / 3 per view */}
          <div className="mt-8">
            <Carousel opts={{ align: "start", loop: true }} className="w-full relative">
              <CarouselContent className="touch-pan-y -ml-0 [transform:translateZ(0)]" style={{ willChange: "transform" }}>
                {reviews.map((r, idx) => (
                  <CarouselItem
                    key={idx}
                    className="pl-3 basis-full sm:basis-1/2 lg:basis-1/3 [content-visibility:auto] [contain-intrinsic-size:1200px_700px]"
                    style={{ willChange: "transform" }}
                  >
                    <ReviewCard {...r} />
                  </CarouselItem>
                ))}
              </CarouselContent>

              {/* arrows (show when more than 3) */}
              {reviews.length > 3 && (
                <>
                  <CarouselPrevious className="left-2 top-1/2 -translate-y-1/2 z-20 bg-white/80 backdrop-blur rounded-full shadow hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary" />
                  <CarouselNext className="-right-1 top-1/2 -translate-y-1/2 z-20 bg-white/80 backdrop-blur rounded-full shadow hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary" />
                </>
              )}
            </Carousel>
          </div>
        </div>
      </div>

      {/* small entrance anim (optional) */}
      <style jsx global>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in-up 320ms ease both; }
      `}</style>
    </section>
  );
}

const DEFAULT_REVIEWS = [
  { quote: "I wasn't ready for injections and honestly didn't think oral semaglutide would do much, but I've been really surprised. Lost about 8 lbs in a month and I just… forget to snack.", author: "Amanda W." },
  { quote: "My provider adjusted the plan twice and it kept working. Shipping was fast and support replied within a day. The app reminders helped me stay consistent even on busy weeks.", author: "Rahul S." },
  { quote: "Checked in every month and stayed consistent. I have more energy than I did last year, and the nutrition tips actually fit my life—no weird rules or all-or-nothing thinking.", author: "Sofia M." },
  { quote: "Support team was on it. Refill came on time and the guidance was clear. Feeling better already.", author: "Dennis M." },
];
