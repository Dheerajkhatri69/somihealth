"use client";

import * as React from "react";
import Link from "next/link";

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
    <path d="M12 2l2.1 2.1 2.97-.49-.49 2.97L19.5 9l-2.02 2.02.49 2.97-2.97-.49L12 16.5l-2.1-2.1-2.97.49.49-2.97L5 9l2.02-2.02-.49-2.97 2.97.49L12 2zm-1.2 10.6l4.5-4.5-1.06-1.06-3.44 3.44-1.44-1.44-1.06 1.06 2.5 2.5z" />
  </svg>
);

/* Review card – responsive, non-overflowing, clamped text */
function ReviewCard({ quote, author }) {
  return (
    <div className="mx-auto w-full max-w-full overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5 sm:max-w-[640px] lg:max-w-[720px]">
      <div className="p-5 sm:p-6 md:p-7">
        <div className="relative">
          <p className="clamped break-words hyphens-auto text-[15px] leading-6 text-gray-800 sm:text-base">
            {quote}
          </p>
          {/* soft fade at bottom when clamped */}
          <span className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-white to-white/0" />
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Verified />
          <span className="text-sm font-semibold text-gray-900">{author}</span>
          <div className="ml-1 flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} />
            ))}
          </div>
        </div>
      </div>

      {/* scoped clamp styles */}
      <style jsx>{`
        .clamped {
          display: -webkit-box;
          -webkit-line-clamp: 5; /* mobile */
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        @media (min-width: 640px) {
          .clamped {
            -webkit-line-clamp: 7; /* ≥sm */
          }
        }
      `}</style>
    </div>
  );
}

/* ===== Main section ===== */
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
    } catch (error) {
      console.error("Error fetching reviews:", error);
      setReviews(DEFAULT_REVIEWS);
    } finally {
      setLoading(false);
    }
  }

  const hasReviews = reviews.length > 0;
  const [i, setI] = React.useState(0);
  const prev = () => setI((p) => (hasReviews ? (p - 1 + reviews.length) % reviews.length : 0));
  const next = () => setI((p) => (hasReviews ? (p + 1) % reviews.length : 0));

  if (loading) {
    return (
      <section className="relative isolate w-full bg-lightprimary-foreground py-10 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="rounded-3xl bg-darkprimary px-5 py-8 sm:px-8 sm:py-10">
            <div className="grid items-start gap-8 md:grid-cols-2 md:gap-10">
              <div className="min-w-0">
                <div className="mb-6 h-12 w-3/4 animate-pulse rounded bg-white/20" />
                <div className="h-12 w-48 animate-pulse rounded bg-white/20" />
              </div>
              <div className="min-w-0 md:ml-auto">
                <div className="h-64 w-full animate-pulse rounded-2xl bg-white/20" />
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative isolate w-full bg-lightprimary-foreground py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="rounded-3xl bg-darkprimary px-5 py-8 sm:px-8 sm:py-10">
          {/* min-w-0 on grid children prevents horizontal overflow on mobile */}
          <div className="grid items-start gap-8 md:grid-cols-2 md:gap-10">
            {/* LEFT: content */}
            <div className="min-w-0">
              <h2 className="font-SofiaSans text-3xl font-bold leading-tight text-white sm:text-4xl">
                {headline}
              </h2>
              <div className="mt-6">
                <Link
                  href={cta.href}
                  className="fx86 inline-flex w-full items-center justify-between rounded-3xl border border-lightprimary bg-transparent px-6 py-2 text-base font-semibold text-lightprimary hover:text-darkprimary shadow-sm md:w-auto md:px-10"
                  style={{ "--fx86-base": "transparent", "--fx86-glow": "#E9ECF1" }}
                >
                  {cta.label}
                  <Arrow />
                </Link>
              </div>
            </div>

            {/* RIGHT: single, responsive card + controls */}
            <div className="min-w-0 md:ml-auto">
              <div key={i} className="animate-fade-in">
                {hasReviews ? (
                  <ReviewCard {...reviews[i]} />
                ) : (
                  <div className="rounded-2xl bg-white/10 p-6 text-white/80 ring-1 ring-white/15">
                    No reviews yet.
                  </div>
                )}
              </div>

              {/* controls */}
              {hasReviews && (
                <div className="mt-5 flex items-center justify-center gap-6">
                  <button
                    onClick={prev}
                    aria-label="Previous"
                    className="rounded-full p-2 text-white/90 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                  >
                    <Arrow dir="left" />
                  </button>

                  {/* dots: scrollable on small screens */}
                  <div
                    className="flex max-w-full items-center gap-3 overflow-x-auto px-2"
                    role="tablist"
                    aria-label="Review slides"
                  >
                    {reviews.map((_, idx) => {
                      const active = idx === i;
                      return (
                        <button
                          key={idx}
                          type="button"
                          role="tab"
                          aria-selected={active}
                          onClick={() => setI(idx)}
                          className={`h-2 w-6 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 sm:w-10 ${
                            active ? "bg-white" : "bg-white/50 hover:bg-white/80"
                          }`}
                        />
                      );
                    })}
                  </div>

                  <button
                    onClick={next}
                    aria-label="Next"
                    className="rounded-full p-2 text-white/90 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                  >
                    <Arrow dir="right" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* fade-in animation */}
      <style jsx global>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in-up 320ms ease both;
        }
      `}</style>
    </section>
  );
}

const DEFAULT_REVIEWS = [
  {
    quote:
      "I wasn't ready for injections and honestly didn't think oral semaglutide would do much, but I've been really surprised. Lost about 8 lbs in a month and I just… forget to snack.",
    author: "Amanda W.",
  },
  {
    quote:
      "My provider adjusted the plan twice and it kept working. Shipping was fast and support replied within a day. The app reminders helped me stay consistent even on busy weeks.",
    author: "Rahul S.",
  },
  {
    quote:
      "Checked in every month and stayed consistent. I have more energy than I did last year, and the nutrition tips actually fit my life—no weird rules or all-or-nothing thinking.",
    author: "Sofia M.",
  },
];
