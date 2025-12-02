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

// Full star
const Star = ({ className = "h-4 w-4", fill = "#22c55e" }) => (
  <svg viewBox="0 0 24 24" className={className} fill={fill} aria-hidden="true">
    <path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.787 1.401 8.168L12 18.896 4.665 23.165l1.401-8.168L.132 9.21l8.2-1.192L12 .587z" />
  </svg>
);

// Half star
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

// Verified badge
const Verified = ({ className = "h-5 w-5" }) => (
  <svg viewBox="0 0 24 24" className={className} fill="#3B82F6">
    <path d="M12 2l2.1 2.1 2.97-.49-.49 2.97L19.5 9l-2.02 2.02.49 2.97-2.97-.49L12 16.5l-2.1-2.1-2.97.49.49-2.97L5 9l2.02-2.02-.49-2.97 2.97.49L12 2zm-1.2 10.6l1.8-1.8 2.7-2.7-1.06-1.06-2.44 2.44-1.44-1.44-1.06 1.06 2.5 2.5z" />
  </svg>
);

/* ===== Review Card ===== */
function ReviewCard({ quote, author, rating = 5, verified = true }) {
  return (
    <figure className="w-full h-full rounded-3xl bg-white border-2 border-darkprimary shadow-sm overflow-hidden">
      <div className="p-5 sm:p-7">
        
        {/* Rating */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} />
            ))}
          </div>

          {verified && (
            <span className="flex items-center gap-2 bg-white border border-gray-200 rounded-full px-3 py-1 text-xs font-semibold">
              <Verified className="h-4 w-4" />
              Verified
            </span>
          )}
        </div>

        {/* Quote */}
        <blockquote className="relative">
          <span className="absolute left-0 top-1 w-1 h-6 bg-darkprimary/20 rounded-full" />
          <p className="pl-3 text-[18px] leading-7 text-gray-700 font-SofiaSans">
            {quote}
          </p>
        </blockquote>

        {/* Footer */}
        <figcaption className="mt-6 flex justify-between">
          <span className="font-semibold text-gray-900">{author}</span>
          <span className="text-xs text-gray-500">Patient</span>
        </figcaption>
      </div>
    </figure>
  );
}

/* ===== Main Section (Option B Layout) ===== */
export default function StoriesWithReviews() {
  const headline =
    "Real stories from real patients on their journey to better health.";

  const cta = { label: "Start Your Journey", href: "/pricing" };

  const [reviews, setReviews] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetchReviews();
  }, []);

  async function fetchReviews() {
    try {
      const res = await fetch("/api/reviews", { cache: "no-store" });
      const data = await res.json();

      if (data?.success && Array.isArray(data.result)) {
        setReviews(data.result);
      } else {
        setReviews(DEFAULT_REVIEWS);
      }
    } catch {
      setReviews(DEFAULT_REVIEWS);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="relative w-full bg-white">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="bg-white rounded-3xl px-5 pt-8 sm:px-8 sm:py-10">

          {/* Top Header */}
          <div className="flex flex-col gap-5 sm:flex-row sm:justify-between">
            <div>
              <div className="flex items-center gap-3 text-darkprimary">
                <span className="bg-lightprimary-foreground px-3 py-1 text-xs font-semibold rounded-full">
                  Excellent
                </span>

                <div className="flex gap-1">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Star key={i} />
                  ))}
                  <HalfStar />
                </div>

                <span className="text-xs font-semibold opacity-90">Trustpilot</span>
              </div>

              <h2 className="mt-3 text-3xl sm:text-4xl font-SofiaSans text-darkprimary leading-tight">
                {headline}
              </h2>
            </div>

             {/* Right: CTA */}
                <Link
                  href={cta.href}
                  className="fx86 inline-flex h-10  w-[230px] md:w-[300px] items-center justify-between rounded-3xl border border-lightprimary bg-darkprimary px-6 py-2 text-base font-semibold text-lightprimary hover:text-darkprimary shadow-sm md:px-10"
                  style={{ "--fx86-base": "transparent", "--fx86-glow": "#E9ECF1" }}
                >
                  {cta.label}
                  <Arrow />
                </Link>
          </div>

          {/* EDGE-TO-EDGE CAROUSEL */}
          <div className="mt-8">
            <Carousel opts={{ align: "start", loop: true }} className="w-full">

              <CarouselContent className="touch-pan-y">
                {reviews.map((r, idx) => (
                  <CarouselItem
                    key={idx}
                    className="basis-full sm:basis-1/2 lg:basis-1/3"
                  >
                    <ReviewCard {...r} />
                  </CarouselItem>
                ))}
              </CarouselContent>

              {reviews.length > 3 && (
                <>
                  <CarouselPrevious className="left-2 top-1/2 -translate-y-1/2 rounded-full bg-white shadow z-20" />
                  <CarouselNext className="right-2 top-1/2 -translate-y-1/2 rounded-full bg-white shadow z-20" />
                </>
              )}
            </Carousel>
          </div>
        </div>
      </div>
    </section>
  );
}

const DEFAULT_REVIEWS = [
  {
    quote:
      "I wasn't ready for injections and honestly didn't think oral semaglutide would do much, but I've been really surprised.",
    author: "Amanda W.",
  },
  {
    quote:
      "My provider adjusted the plan twice and it kept working. Shipping was fast and support replied within a day.",
    author: "Rahul S.",
  },
  {
    quote:
      "Checked in every month and stayed consistent. I have more energy than I did last year.",
    author: "Sofia M.",
  },
  {
    quote:
      "Support team was on it. Refill came on time and the guidance was clear.",
    author: "Dennis M.",
  },
];
