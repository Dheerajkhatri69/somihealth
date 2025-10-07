"use client";

import Image from "next/image";
import React from "react";

/* ---------------------- Content (DB-ready) ---------------------- */
export const HOW_IT_WORKS_CONTENT = {
  title: "How Effecty Works",
  steps: [
    {
      number: 1,
      title: "Take the Quiz",
      description:
        "We’ve said it before and we’ll say it again – feeling your best doesn’t look the same for everyone. Take this quiz to help us get to know you better. Let’s start this journey together!",
    },
    {
      number: 2,
      title: "Connect & Consult",
      description:
        "After you complete your health intake, a licensed medical provider in your state will contact through our secure, HIPAA-compliant telehealth system within 24 hours. You’ll have ongoing access to your medical provider for continuous support as long as you have an active treatment with us.",
    },
    {
      number: 3,
      title: "Start your Wellness Journey",
      description:
        "Get personalized treatment delivered to your doorstep. No hidden fees, no shipping costs, just the Effecty team supporting you every step of the way.",
    },
  ],
  cta: {
    text: "Add To Cart",
    href: "/getstarted",
  },
  image: {
    src: "https://cdn.prod.website-files.com/66d426b8977df99bafdb6c19/6718a0e6d9e6f55f4d34d921_how-effecty-works-longevity.avif",
    alt: "Relaxing in water",
  },
};

/* --------------------------- Component --------------------------- */
export default function HowItWorks({ content = HOW_IT_WORKS_CONTENT }) {
  const { title, steps, cta, image } = content;

  return (
    <section className="w-full">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="grid gap-10 md:grid-cols-2 items-center">
          {/* LEFT — image */}
          <div className="relative w-full h-[320px] sm:h-[400px] md:h-full overflow-hidden rounded-[24px] ring-1 ring-black/5 shadow-sm">
            <Image
              src={image?.src || "/images/placeholder.jpg"}
              alt={image?.alt || ""}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              priority
            />
          </div>

          {/* RIGHT — steps */}
          <div>
            <h2 className="font-SofiaSans text-[28px] sm:text-[34px] text-[#2c3a57] mb-8">
              {title}
            </h2>

            {/* No vertical line; number badge and text spaced with flex gaps */}
            <ol className="space-y-8 sm:space-y-10 font-SofiaSans">
              {steps.map((step) => (
                <li key={step.number}>
                  <div className="flex items-start gap-4 sm:gap-5">
                    {/* Number badge */}
                    <span className="mt-0.5 inline-flex h-10 w-10 flex-none items-center justify-center rounded-full border-2 border-gray-400 bg-white font-semibold text-[#2c3a57]">
                      {step.number}
                    </span>

                    {/* Text */}
                    <div className="min-w-0">
                      <h3 className="text-base sm:text-lg font-semibold text-[#2c3a57]">
                        {step.title}
                      </h3>
                      <p className="mt-1 sm:mt-2 text-[17px] leading-7 text-gray-700">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ol>

            {/* CTA */}
            {cta?.text && (
              <div className="mt-8">
                <a
                  href={cta.href || "#"}
                  className="inline-flex items-center justify-center rounded-full bg-[#2c3a57] px-6 py-3 text-white text-sm font-semibold shadow hover:opacity-90 transition"
                >
                  {cta.text}
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
