"use client";

import Image from "next/image";

/**
 * PartnerWithDoctor.jsx (hover glass effect)
 */

const DEFAULT_CONTENT = {
  heading: "How we partner you with the perfect doctor",
  items: [
    {
      id: 1,
      title: "We learn about you",
      desc:
        "Based on your medical needs, personal interests, and goals, we'll partner you with the doctor that's perfect for your needs.",
      icon: {
        src: "https://assets.lemonaidhealth.com/web/brochure/images/coaching/lemonaid-coaching-illustrations-03.png",
        alt: "Phone with doctor",
        width: 80,
        height: 80,
      },
    },
    {
      id: 2,
      title: "First long visit",
      desc:
        "You and your doctor will connect over video chat for about an hour. You'll get to know each other and create a plan to manage your health.",
      icon: {
        src: "https://assets.lemonaidhealth.com/web/brochure/images/LCP-Phone-Call.png",
        alt: "Video chat",
        width: 80,
        height: 80,
      },
    },
    {
      id: 3,
      title: "On-going access",
      desc:
        "Call, text, or video chat your doctor anytime. Every conversation continues where you left off so care feels personal and consistent.",
      icon: {
        src: "https://assets.lemonaidhealth.com/web/brochure/images/Lemonaid-Support-hands-blue.png",
        alt: "Handshake",
        width: 80,
        height: 80,
      },
    },
  ],
};

export default function PartnerWithDoctor({ content = DEFAULT_CONTENT }) {
  const c = { ...DEFAULT_CONTENT, ...content };

  return (
    <section className="relative isolate">
      {/* Soft backdrop */}
      <div className="mx-auto font-SofiaSans max-w-7xl rounded-3xl bg-darkprimary-foreground/20 px-4 py-14 shadow-inner ring-1 ring-sky-100 md:px-8">
        <h2 className="mx-auto max-w-3xl text-center text-3xl font-semibold tracking-tight text-slate-900 md:text-5xl">
          {c.heading}
        </h2>

        <div className="mt-10 grid grid-cols-1 gap-6 md:mt-12 md:grid-cols-3">
          {c.items?.map((item) => (
            <Card key={item.id} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Card({ item }) {
  const hasIcon = Boolean(item?.icon?.src);
  return (
    <div
      className="group relative rounded-2xl bg-white/80 p-6 shadow-sm ring-1 ring-slate-200 backdrop-blur-sm transition will-change-transform hover:-translate-y-1 hover:bg-white/30 hover:backdrop-blur-lg hover:shadow-xl"
    >
      {/* glassy gradient accent behind card */}
      <div className="pointer-events-none absolute inset-0 -z-10 rounded-2xl bg-gradient-to-b from-sky-100/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

      <div className="flex flex-col items-center text-center">
        {hasIcon ? (
          <div className="mb-4 rounded-full bg-sky-50 p-4">
            <Image
              src={item.icon.src}
              alt={item.icon.alt || ""}
              width={item.icon.width || 72}
              height={item.icon.height || 72}
              className="h-16 w-16 object-contain"
            />
          </div>
        ) : null}

        <h3 className="text-lg font-semibold text-slate-900">
          {item.title}
        </h3>
        <p className="mt-3 text-base leading-6 text-slate-600">
          {item.desc}
        </p>
      </div>
    </div>
  );
}