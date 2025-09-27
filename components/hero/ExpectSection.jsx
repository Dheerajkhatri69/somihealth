"use client";

import Image from "next/image";
import React from "react";

/* -------------------- Content (DB-ready) -------------------- */
export const EXPECT_CONTENT = {
  title: "What to expect with Lemonaid",
  image: {
    src: "https://assets.lemonaidhealth.com/web/brochure/images/glp1/2_video_call_original.jpg", // replace with your asset
    alt: "Tele-visit with provider on a smartphone",
    // optional: override aspect ratio per image later
    ratio: "5 / 4",
  },
  items: [
    {
      heading: "Transparent pricing",
      description:
        "Expect no hidden fees, no long-term commitment required, and no additional fees for dosage changes while on the same medication.",
    },
    {
      heading: "Convenient support",
      description:
        "Get professional and thoughtful care from licensed medical providers, all from the comfort of your home.",
    },
    {
      heading: "Straightforward healthcare",
      description:
        "Leave the complications of insurance behind with our exclusive cash-pay model.",
    },
  ],
};

/* -------------------- Component -------------------- */
export default function ExpectSection({ content = EXPECT_CONTENT }) {
  const { title, image, items } = content;

  return (
    <section className="w-full">
      <div className="mx-auto max-w-7xl px-4 md:px-6 py-10 md:py-14">
        <div className="grid items-center gap-10 md:grid-cols-12">
          {/* LEFT — image */}
          <div className="md:col-span-6">
            <div className="relative overflow-hidden rounded-[28px] ring-1 ring-black/5 shadow-lg">
              <div
                className="relative w-full"
                style={{ aspectRatio: image?.ratio || "4 / 3" }}
              >
                <Image
                  src={image?.src || "/images/placeholder.jpg"}
                  alt={image?.alt || ""}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          </div>

          {/* RIGHT — text */}
          <div className="md:col-span-6">
            <h2 className="font-semibold tracking-tight text-2xl sm:text-3xl md:text-4xl text-neutral-900">
              {title}
            </h2>

            <div className="mt-8 space-y-8">
              {items?.map((it, i) => (
                <div key={i} className="max-w-xl">
                  <p className="text-lg font-semibold text-neutral-900">
                    {it.heading}
                  </p>
                  <p className="mt-1 text-[15px] sm:text-base leading-7 text-neutral-700">
                    {it.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
