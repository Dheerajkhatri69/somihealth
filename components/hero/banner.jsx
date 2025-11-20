"use client";

import Image from "next/image";
import React from "react";

/* -------------------- Content -------------------- */
export const BANNER_CONTENT = {
  image: {
    src: "https://assets.lemonaidhealth.com/web/brochure/images/glp1/glp1s.jpg",
    alt: "GLP-1 injection pen in hands",
  },
  headline: {
    line1: "Lose 15% of your",
    line2: "body weight with GLP-1s*",
  },
  cta: {
    text: "Get started",
    href: "#",
  },
  footnote:
    "*In a 68-week placebo-controlled study of 1,961 obese and overweight non-diabetic adults with weight-related conditions, the treatment group receiving semaglutide experienced a mean body weight loss of 15%, compared to 2% of the placebo group. Both groups followed a reduced-calorie diet, increased physical activity, and monthly nutritional counseling. The trial was overseen and sponsored by Novo Nordisk.",
};

/* ----------------------------- Component ----------------------------- */
export default function Banner({ content = BANNER_CONTENT, onCta }) {
  const { image, headline, cta, footnote } = content;

  return (
    <section className="w-full">
      <div className="mx-auto max-w-7xl px-4 md:px-6 py-8 md:py-10">
        {/* Banner */}
        <div className="relative overflow-hidden rounded-[28px] ring-1 ring-black/5 shadow-md">
          {/* Aspect wrapper → 5:4 on mobile, 21:9 on md+ */}
          <div className="relative w-full aspect-[5/4] md:aspect-[21/9]">
            <Image
              src={image?.src || "/images/placeholder-wide.jpg"}
              alt={image?.alt || ""}
              fill
              sizes="(max-width: 1024px) 100vw, 1200px"
              className="object-cover"
              priority
            />

            {/* Overlay content */}
            <div className="absolute inset-0 flex items-center justify-center md:justify-end">
              <div className="px-4 sm:px-6 md:px-10 lg:px-14 py-6 md:py-0">
                <div className="max-w-xl md:text-right">
                  {/* Glass headline pills */}
                  <div className="space-y-3">
                    <span className="inline-block rounded-xl bg-white/20 backdrop-blur-md px-3 sm:px-4 py-2 text-lg sm:text-2xl md:text-3xl font-extrabold text-white shadow-lg">
                      {headline?.line1}
                    </span>
                    <br className="hidden md:block" />
                    <span className="inline-block rounded-xl bg-white/20 backdrop-blur-md px-3 sm:px-4 py-2 text-lg sm:text-2xl md:text-3xl font-extrabold text-white shadow-lg">
                      {headline?.line2}
                    </span>
                  </div>

                  {/* CTA */}
                  <div className="mt-5 md:mt-6">
                    {onCta ? (
                      <button
                        onClick={onCta}
                        className="fx86 inline-flex items-center font-SofiaSans gap-3 rounded-full hover:bg-transparent bg-secondary px-6 py-3 font-semibold text-white hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
                        style={{ "--fx86-base": "transparent" }}
                      >
                        {cta?.text || "Get started"}
                      </button>
                    ) : (
                      <a
                        href={cta?.href || "/getstarted"}
                        className="fx86 inline-flex items-center font-SofiaSans gap-3 rounded-full hover:bg-transparent bg-secondary px-6 py-3 font-semibold text-white hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
                        style={{ "--fx86-base": "transparent" }}
                      >
                        {cta?.text || "Get started"}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footnote */}
        <p className="mx-auto mt-3 max-w-5xl text-center text-[11px] leading-5 text-neutral-600">
          {footnote}
        </p>
      </div>
    </section>
  );
}
