"use client";

import Image from "next/image";

/**
 * PrimaryCareFeatures.jsx (image bottom text overlay with local blur only)
 *
 * Left side: responsive image with bottom-aligned overlay. The blur is applied
 * only behind the text block (not the entire image).
 * Right side: feature groups as clean accent cards.
 */

const DEFAULT_CONTENT = {
  heading: "Get the primary care you need, whenever you need it",
  intro:
    "Text, call, or video chat with your doctor anytime. Because you get the personal attention of the same doctor, they really get to know you and your family. Every conversation continues where it left off. We’re proud to offer care for every problem, big or small, including:",
  image: {
    src: "https://assets.lemonaidhealth.com/web/brochure/images/primary-care/Lemonaid_MD_page_Hero_image_desktop.png", // replace with your asset or remote URL
    alt: "Friendly doctor chatting with patient online",
  },
  groups: [
    {
      title: "Chronic conditions",
      items: [
        "Hashimoto’s, Hyperthyroidism, Blood Pressure, Cholesterol, Weight, Allergies, Metabolic Syndrome, Stress Management",
      ],
    },
    {
      title: "Labs & screenings",
      items: [
        "Abdominal pain, Anemia, Cardiovascular, Chronic disease, Erectile Dysfunction, Fatigue, Fertility, Thyroid disease, Vitamin deficiencies, Gut Bacteria, Hormones",
      ],
    },
    {
      title: "Women’s health",
      items: [
        "Family planning, Preconception counseling, Menopause, PMS, Sexual Dysfunction, Urinary Tract Infections, Vaginal & Yeast Infections, Prenatal Counseling",
      ],
    },
    {
      title: "Preventative medicine",
      items: [
        "Smoking Cessation, Metabolic Syndrome, Mood Disorder Screening, Weight Loss Counseling",
      ],
    },
    {
      title: "Men’s health",
      items: ["Acne, Hair Loss, Sexual Dysfunction"],
    },
  ],
};

export default function PrimaryCareFeatures({ content = DEFAULT_CONTENT }) {
  const c = { ...DEFAULT_CONTENT, ...content };

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 md:px-8">
      <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-16">
        {/* Left: Responsive image with bottom text overlay */}
        <figure className="relative order-1 h-[360px] w-full overflow-hidden rounded-2xl bg-slate-100 md:order-none md:h-auto md:min-h-[460px]">
          <Image
            src={c.image?.src}
            alt={c.image?.alt || ""}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
            priority
          />

          {/* Text panel only at bottom with local blur */}
          <figcaption className="absolute bottom-0 left-0 right-0 mx-4 mb-4 rounded-xl bg-lightprimary/50 p-5 text-black backdrop-blur-md md:mx-6 md:mb-6 md:max-w-[85%]">
            <h2 className="font-SofiaSans text-3xl font-semibold leading-snug md:text-4xl">
              {c.heading}
            </h2>
            <p className="mt-2 text-lg leading-6 text-black/90 md:text-xl">
              {c.intro}
            </p>
          </figcaption>
        </figure>

        {/* Right: feature groups */}
        <div className="space-y-6">
          {c.groups.map((g, i) => (
            <FeatureGroup key={g.title + i} group={g} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureGroup({ group }) {
  return (
    <div className="rounded-xl bg-white backdrop-blur-md border-l-4 border-secondary p-5 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900">{group.title}</h3>
      <div className="mt-2 list-disc space-y-1 text-base leading-6 text-slate-700">
        {group.items.map((item, idx) => (
          <div key={idx}>{item}</div>
        ))}
      </div>
    </div>
  );
}