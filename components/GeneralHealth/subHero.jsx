"use client";

import Image from "next/image";

const DEFAULT_CONTENT = {
  eyebrow: "",
  heading: "Get high blood pressure treatment online",
  subheading:
    "Renew your prescription for blood pressure medication online, and we'll deliver it to your door with free shipping.",
  ctaLabel: "Get started",
  ctaHref: "/get-started",
  priceNote: "$75/month, cancel anytime",
  disclaimer:
    "Please see a healthcare professional in person if you’ve never been diagnosed with high blood pressure (hypertension) before.",
  image: {
    src: "https://assets.lemonaidhealth.com/web/brochure/images/hypertension/High_blood_pressure_Creative_Desktop.png", // transparent PNG/SVG works best
    alt: "Person running",
    width: 520,
    height: 520,
  },
};

export default function SubHero({ content = DEFAULT_CONTENT }) {
  const c = { ...DEFAULT_CONTENT, ...content };

  return (
    <section className="relative isolate">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 py-16 md:grid-cols-2 md:gap-6 md:px-8">
        {/* Left: Illustration with blob */}
        <div className="relative mx-auto flex w-full max-w-lg items-center justify-center">

          {/* Decorative plus icons */}
          <span className="absolute -left-4 top-2 text-lg text-secondary">+</span>
          <span className="absolute right-6 bottom-4 text-lg text-secondary">+</span>

          <div className="relative">
            <Image
              src={c.image?.src}
              alt={c.image?.alt || ""}
              width={c.image?.width || 520}
              height={c.image?.height || 520}
              className="h-auto w-auto max-w-[90%] object-contain"
              priority
            />
          </div>
        </div>

        {/* Right: Copy */}
        <div className="max-w-xl">
          {c.eyebrow ? (
            <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-secondary">{c.eyebrow}</p>
          ) : null}

          <h1 className="font-SofiaSans text-3xl font-semibold tracking-tight text-slate-900 md:text-5xl">
            {c.heading}
          </h1>

          <p className="mt-5 text-lg leading-8 text-slate-700">
            {c.subheading}
          </p>

          {/* CTA */}
          <div className="mt-8 flex items-center gap-5">
            {c.ctaLabel ? (
              <a
                href={c.ctaHref || "#"}
                className="fx-primary inline-flex items-center justify-center rounded-2xl bg-secondary px-6 py-3 text-base font-semibold text-white shadow-[0_8px_20px_rgba(0,0,0,0.12)] transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2"
              >
                {c.ctaLabel}
              </a>
            ) : null}
            {c.priceNote ? (
              <span className="text-sm text-slate-600">{c.priceNote}</span>
            ) : null}
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      {c.disclaimer ? (
        <p className="mx-auto max-w-4xl px-6 pb-10 text-center text-sm leading-6 text-slate-600">
          {c.disclaimer}
        </p>
      ) : null}
    </section>
  );
}

