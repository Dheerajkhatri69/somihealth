"use client";

import Image from "next/image";

/**
 * HypertensionTreatment.jsx
 *
 * A three-card section inspired by the reference but with a fresh design.
 * Headline + intro, then modern cards with icons, hover lift, and accent borders.
 */

const DEFAULT_CONTENT = {
  heading: "Personalized hypertension treatment",
  intro:
    "Our medical team works with you to help manage high blood pressure with lifestyle suggestions and prescription medications.",
  items: [
    {
      title: "Video consult",
      desc: "Meet with one of our licensed doctors or nurse practitioners for a medical review.",
      icon: "https://assets.lemonaidhealth.com/web/brochure/images/LCP-Popup-Ilustrations.png",
    },
    {
      title: "Lifestyle changes",
      desc: "Learn how to manage high blood pressure with practical health and lifestyle suggestions.",
      icon: "https://assets.lemonaidhealth.com/web/brochure/images/lemonaid-lifestyle.png",
    },
    {
      title: "Rx delivery",
      desc: "When appropriate, we’ll renew your prescription and ship your medication to you for free.",
      icon: "https://assets.lemonaidhealth.com/web/brochure/images/Lemonaid-Delivery-Truck-Blue.png",
    },
  ],
};

export default function Treatment({ content = DEFAULT_CONTENT }) {
  const c = { ...DEFAULT_CONTENT, ...content };

  return (
    <section className="relative isolate">
      <div className="mx-auto max-w-6xl px-4 py-16 md:px-8">
        <h2 className="text-center font-SofiaSans text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
          {c.heading}
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-base leading-7 text-slate-700">
          {c.intro}
        </p>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {c.items.map((item, idx) => (
            <Card key={idx} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
function Card({ item }) {
  return (
    <div className="group flex flex-col items-center rounded-2xl border border-secondary/20 bg-[#fffaf6] p-8 text-center shadow-md backdrop-blur-md transition hover:-translate-y-1 hover:shadow-lg">
      {item.icon ? (
        <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-secondary/30 backdrop-blur-sm">
          <Image
            src={item.icon}
            alt={item.title}
            width={48}
            height={48}
            className="h-12 w-12 object-contain"
          />
        </div>
      ) : null}
      <h3 className="text-lg font-semibold text-slate-900 md:text-xl">
        {item.title}
      </h3>
      <p className="mt-3 text-sm leading-6 text-slate-700">{item.desc}</p>
    </div>
  );
}
