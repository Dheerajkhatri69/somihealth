"use client";

/**
 * BpSteps.jsx (refined to match reference layout)
 *
 * Centered heading, then a 2‑column grid of wide rows.
 * Each row: oversized number on the left, large title + body on the right.
 * Clean typography, generous spacing, fully responsive.
 */

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
        "Meet with a US‑licensed doctor or nurse practitioner who will review your history and advise on treatment options.",
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

  return (
    <section className="relative isolate font-SofiaSans">
      <div className="mx-auto max-w-6xl px-4 py-16 md:px-8">
        <h2 className="text-center text-2xl font-semibold tracking-tight text-slate-900 md:text-4xl">
          {c.heading}
        </h2>

        {/* 2-column rows */}
        <div className="mx-auto mt-12 grid grid-cols-1 gap-y-12 md:grid-cols-2 md:gap-x-12">
          {c.steps.map((s, idx) => (
            <StepRow key={idx} index={idx + 1} step={s} />)
          )}
        </div>
      </div>
    </section>
  );
}

function StepRow({ index, step }) {
  return (
    <div className="flex items-start gap-6">
      {/* Big number */}
      <div className="select-none font-semibold leading-none text-6xl text-emerald-950 md:text-8xl lg:text-9xl">
        {index}
      </div>

      {/* Text block */}
      <div className="pt-2">
        <h3 className="font-SofiaSans text-2xl font-semibold text-slate-900 md:text-3xl">
          {step.title}
        </h3>
        <p className="mt-3 max-w-xl text-base leading-7 text-slate-700">
          {step.desc}
        </p>
      </div>
    </div>
  );
}

