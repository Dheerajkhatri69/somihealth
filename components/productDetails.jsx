"use client";

import Image from "next/image";
import React from "react";

/* ---------------------- Content (DB-ready) ---------------------- */
export const PRODUCT_DETAILS_CONTENT = {
  title: "Product Details",
  introTitle:
    "LEAN BODY, HIGH ENERGY: UNLOCK THE BENEFITS OF LIPOTROPIC (MIC) + B12",
  intro:
    "Lipotropic (MIC) + B12 injections contain essential nutrients: methionine, inositol, choline (which are lipotropic agents) and vitamin B12. These key nutrients are combined to enhance fat metabolism and increase energy levels. This treatment supports weight management and overall vitality.",
  breakdownHeading: "Here is a breakdown on the ingredients:",
  ingredients: [
    {
      name: "Methionine",
      desc: "An amino acid that helps break down fat in the liver, boost energy levels, and may reduce cholesterol.",
    },
    {
      name: "Inositol",
      desc: "A B-complex vitamin that helps break down fat and lower cholesterol. Inositol also helps regulate serotonin, a neurotransmitter that controls mood and appetite.",
    },
    {
      name: "Choline",
      desc: "A nutrient that assists the liver in processing fats and other waste products.",
    },
    {
      name: "Vitamin B12",
      desc: "Another essential nutrient, also known as cyanocobalamin, that may boost metabolism and improve energy levels.",
    },
  ],
  benefitsHeading: "Potential benefits include:",
  benefits: [
    "Boosting Fat Metabolism",
    "Increasing Energy",
    "Supporting a Healthy Metabolism",
    "Improving Mood and Focus",
    "Promoting Liver Health",
  ],
  expectationsHeading: "EXPECTATIONS",
  expectations:
    "Boost your energy, kickstart fat-burning, and feel sharper every day! Lipotropic (MIC) + B12 can help your body work smarter, giving you that extra push toward a leaner, more vibrant you. However, MIC injections aren’t miracle cures. They work best when combined with other medical weight loss treatments and with positive lifestyle changes, such as a lower calorie diet and regular exercise.",
  footnote:
    "*These statements have not been evaluated by the Food and Drug Administration (FDA). This product is not approved by the FDA and is not intended to diagnose, treat, cure, or prevent any disease.",
  image: {
    src: "https://cdn.prod.website-files.com/66d426b8977df99bafdb6c19/6718a1564e562246408fc6ea_how-longevity-works-nad.avif",
    alt: "Closeup of blue eyes",
  },
};

/* --------------------------- Component --------------------------- */
export default function ProductDetails({ content = PRODUCT_DETAILS_CONTENT }) {
  const {
    title,
    introTitle,
    intro,
    breakdownHeading,
    ingredients,
    benefitsHeading,
    benefits,
    expectationsHeading,
    expectations,
    footnote,
    image,
  } = content;

  return (
    <section className="w-full font-SofiaSans">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        {/* 50/50 on md+, stacked on mobile; image first on mobile */}
        <div className="grid gap-8 md:grid-cols-2 items-stretch">
          {/* RIGHT (on desktop) — image */}
          <div className="order-1 md:order-2 flex">
            <div className="relative w-full rounded-[24px] overflow-hidden ring-1 ring-black/5 shadow-sm">
              <div className="relative w-full aspect-[4/3] md:aspect-auto md:h-full">
                <Image
                  src={image?.src || "/images/placeholder.jpg"}
                  alt={image?.alt || ""}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                  priority
                  style={{ objectPosition: "center center" }}
                />
              </div>
            </div>
          </div>

          {/* LEFT (on desktop) — copy */}
          <div className="order-2 md:order-1">
            <h2 className="text-[30px] sm:text-[34px] text-[#2c3a57]">
              {title}
            </h2>

            <h3 className="mt-6 font-semibold text-[18px] tracking-wide text-[#2c3a57]">
              {introTitle}
            </h3>
            <p className="mt-3 text-[15px] sm:text-lg leading-7 text-gray-700">
              {intro}
            </p>

            <p className="mt-6 font-medium text-[18px] text-gray-800">{breakdownHeading}</p>
            <ul className="mt-2 space-y-3">
              {ingredients?.map((ing, i) => (
                <li
                  key={i}
                  className="text-[15px] sm:text-[18px] leading-7 text-gray-700"
                >
                  <span className="font-semibold text-[17px] text-gray-900">
                    {ing.name}:
                  </span>{" "}
                  {ing.desc}
                </li>
              ))}
            </ul>

            <p className="mt-6 font-medium text-gray-800">{benefitsHeading}</p>
            <ul className="mt-2 space-y-1">
              {benefits?.map((b, i) => (
                <li key={i} className="font-semibold text-[#2c3a57]">
                  {b}
                </li>
              ))}
            </ul>

            <div className="my-6 border-t border-dashed border-gray-300" />

            <h4 className="font-semibold tracking-wide text-[#2c3a57]">
              {expectationsHeading}
            </h4>
            <p className="mt-2 text-[15px] sm:text-[18px] leading-7 text-gray-700">
              {expectations}
            </p>

            <p className="mt-4 text-[11px] leading-5 text-gray-500">
              {footnote}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
