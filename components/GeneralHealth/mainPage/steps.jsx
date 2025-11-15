// app/components/Steps.jsx
"use client";

import { useEffect, useRef } from "react";

const DEFAULT_CONTENT = {
  heading: "How can I renew my blood pressure medications online?",
  steps: [
    {
      title: "Tell us about you",
      desc:
        "Share your health history, previous prescriptions, and experience with high blood pressure.",
    },
    {
      title: "Online video consult",
      desc:
        "Meet with a US-licensed doctor or nurse practitioner who will review your history and advise on treatment options.",
    },
    {
      title: "Meds shipped to your door",
      desc:
        "If appropriate, we'll renew your prescription for high blood pressure medication, and our mail order pharmacy will ship it free.",
    },
    {
      title: "Stay healthy!",
      desc:
        "Learn to lower blood pressure with lifestyle tips from our medical team. Message us with any questions.",
    },
    {
      title: "Stay healthy!",
      desc:
        "Learn to lower blood pressure with lifestyle tips from our medical team. Message us with any questions.",
    },
  ],
};

export default function Steps({ content = DEFAULT_CONTENT }) {
  const c = { ...DEFAULT_CONTENT, ...content };

  // duplicate steps to create seamless loop
  const loopSteps = [...c.steps, ...c.steps];

  const scrollRef = useRef(null);
  const isPausedRef = useRef(false);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    let frameId;
    const speed = 0.5; // lower = slower, higher = faster

    const animate = () => {
      if (!container) return;

      // only scroll if not paused
      if (!isPausedRef.current) {
        container.scrollLeft += speed;

        // when we've scrolled past the first set of cards,
        // jump back by half the total scroll width (one full set)
        const maxLoopWidth = container.scrollWidth / 2;
        if (container.scrollLeft >= maxLoopWidth) {
          container.scrollLeft = 0;
        }
      }

      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);

    return () => {
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <section className="relative isolate font-SofiaSans bg-darkprimary-foreground/20">
      <div className="mx-auto max-w-7xl px-4 py-16 md:px-8">
        {/* Heading */}
        <h2 className="text-center text-2xl font-semibold tracking-tight text-slate-900 md:text-4xl">
          {c.heading}
        </h2>

        {/* Auto-scrolling rail */}
        <div className="relative mt-10 md:mt-12">
          {/* Scroll container */}
          <div
            ref={scrollRef}
            className="
              flex gap-4 md:gap-6
              overflow-x-hidden
              py-2
            "
            onMouseEnter={() => {
              isPausedRef.current = true;
            }}
            onMouseLeave={() => {
              isPausedRef.current = false;
            }}
          >
            {loopSteps.map((s, idx) => (
              <StepCard
                key={idx}
                index={(idx % c.steps.length) + 1}
                step={s}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function StepCard({ index, step }) {
  return (
    <article
      className="
        min-w-[260px] sm:min-w-[280px] md:min-w-[320px]
        rounded-3xl border border-slate-200 bg-darkprimary-foreground/20
        px-5 py-6 sm:px-6 sm:py-7
        shadow-sm
        flex flex-col gap-3
      "
    >
      <div className="select-none font-semibold leading-none text-4xl text-emerald-950 md:text-6xl lg:text-7xl">
        {index}
      </div>

      {/* Text block */}
      <div>
        <h3 className="text-lg sm:text-xl font-semibold text-slate-900">
          {step.title}
        </h3>
        <p className="mt-2 text-sm sm:text-base leading-relaxed text-slate-700">
          {step.desc}
        </p>
      </div>
    </article>
  );
}
