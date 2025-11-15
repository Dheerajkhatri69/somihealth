// app/components/HowWeHelp.jsx
"use client";

import Image from "next/image";

const HOW_WE_HELP_CONTENT = {
    title: "How we help",
    subtitle:
        "We make it easier to get the help you need — quick answers, professional guidance, and follow-up when you want it.",
    image: {
        src: "https://assets.lemonaidhealth.com/web/brochure/images/primary-care/primary_care_illustration_desktop.png",
        alt: "Person getting online medical support",
    },
    points: [
        {
            body: "Book a same-day online visit with a doctor or nurse practitioner — no waiting rooms, no travel.",
        },
        {
            body: "We review your symptoms, history, and concerns to recommend the most effective care plan.",
        },
        {
            body: "If your symptoms change or you have questions, you can reconnect anytime.",
        },
    ],
};

export default function HowWeHelp({ content = HOW_WE_HELP_CONTENT }) {
    const { title, subtitle, image, points } = content;

    return (
        <section className="w-full bg-white py-16 sm:py-24 font-SofiaSans">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-12 items-start">

                {/* LEFT IMAGE */}
                <div className="relative h-[380px] md:h-[480px]">
                    <Image
                        src={image.src}
                        alt={image.alt}
                        fill
                        className="object-contain"
                    />
                </div>

                {/* RIGHT TEXT + POINTS */}
                <div className="py-10">
                    <h2 className="text-3xl sm:text-4xl font-semibold text-darkprimary mb-6">
                        {title}
                    </h2>

                    <p className="text-base md:text-xl text-slate-700 mb-10">
                        {subtitle}
                    </p>

                    <div className="space-y-6">
                        {points.map((p, i) => (
                            <div key={i} className="flex gap-4 items-start">
                                <span className="w-3 h-3 mt-2 rounded-full bg-darkprimary" />

                                <p className="text-base md:text-xl text-slate-700">{p.body}</p>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </section>
    );
}
