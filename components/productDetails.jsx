"use client";

import Image from "next/image";
import React from "react";

export default function ProductDetails({ content }) {
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

        {/* MAIN WRAPPER */}
        <div className="relative">

          {/* FLOATING IMAGE — fixed 550x550 on laptop/desktop */}
          <div className="float-right md:shape-wrap md:ml-8 md:mb-6 hidden md:block">
            <div className="rounded-2xl overflow-hidden w-[550px] h-[550px]">
              <Image
                src={image?.src}
                alt={image?.alt}
                width={550}
                height={550}
                className="object-cover w-full h-full"
              />
            </div>
          </div>

          {/* MOBILE IMAGE (full width) */}
          <div className="md:hidden mb-6">
            <Image
              src={image?.src}
              alt={image?.alt}
              width={900}
              height={600}
              className="rounded-2xl object-cover w-full"
            />
          </div>

          {/* CONTENT — wraps under image */}
          <h2 className="text-[30px] sm:text-[34px] text-[#2c3a57]">{title}</h2>

          <h3 className="mt-6 font-semibold text-[18px] tracking-wide text-[#2c3a57]">
            {introTitle}
          </h3>
          <p className="mt-3 text-[15px] sm:text-[18px] leading-7 text-gray-700">
            {intro}
          </p>

          <p className="mt-6 font-medium text-[18px] text-gray-800">{breakdownHeading}</p>
          <ul className="mt-2 space-y-3">
            {ingredients.map((ing, i) => (
              <li key={i} className="text-[15px] sm:text-[18px] leading-7 text-gray-700">
                <span className="font-semibold text-[17px] text-gray-900">
                  {ing.name}:
                </span>{" "}
                {ing.desc}
              </li>
            ))}
          </ul>

          <p className="mt-6 font-medium text-gray-800">{benefitsHeading}</p>
          <ul className="mt-2 space-y-1">
            {benefits.map((b, i) => (
              <li key={i} className="font-semibold text-[#2c3a57]">{b}</li>
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

          {/* CLEAR FLOAT FIX */}
          <div className="clear-both" />
        </div>
      </div>
    </section>
  );
}
