// app/components/SymptomsWeTreat.jsx
"use client";

import Link from "next/link";

const SYMPTOMS_CONTENT = {
    title: "Symptoms / conditions we can treat",
    groups: [
        {
            heading: "Colds or Upper Respiratory Infection (URI)",
            items: [
                "Sore throat",
                "Cough",
                "Congestion",
                "Fever",
                "Bronchitis or chest cold",
                "Shortness of breath",
                "Tight chest",
                "Wheezing",
                "COVID-19 or coronavirus symptoms",
            ],
            note: "Please note: there is no specific treatment for COVID-19.",
        },
        {
            heading: "Skin",
            items: [
                "Eczema",
                "Rashes, hives, sores",
                "Moles",
                "Ringworm",
                "Jock itch",
                "Athlete's foot",
            ],
        },
        {
            heading: "Chronic medical issues",
            items: [
                "High Blood Pressure / Hypertension (HTN)",
                "Metabolic syndrome",
                "Diabetes",
                "Thyroid issues",
            ],
        },
        {
            heading: "Allergies",
            items: [
                "Seasonal allergies",
                "Hay fever",
                "Itchy eyes",
                "Sinus congestion",
                "Epipen refills",
            ],
        },
        {
            heading: "Stomach",
            items: [
                "Stomach ache",
                "Nausea",
                "Vomiting",
                "Diarrhea",
                "Constipation",
                "Bloating",
                "Cramps",
                "IBS",
                {
                    label: "Acid Reflux – Use our Acid Reflux service",
                    href: "/services/acid-reflux",
                },
            ],
        },
        {
            heading: "Mental Health",
            items: [
                "Insomnia",
                {
                    label: "Anxiety – Use our Anxiety service",
                    href: "/services/anxiety",
                },
                {
                    label: "Depression – Use our Depression service",
                    href: "/services/depression",
                },
            ],
        },
        {
            heading: "Infections or Acute Injuries",
            items: [
                {
                    label: "UTI – Use our UTI service",
                    href: "/services/uti",
                },
                "Yeast infections",
                "Conjunctivitis / Pink eye / Itchy eyes",
                "Cellulitis / Soft tissue infection",
                {
                    label: "Sinus infection – Use our Sinus Infection service",
                    href: "/services/sinus-infection",
                },
                "Ear infection",
                "Vaginitis / Vaginal infection",
                "Minor burns / cuts / scrapes",
                "Dental pain",
            ],
        },
        {
            heading: "Musculoskeletal Problems",
            items: [
                "Gout",
                "Sprains",
                "Pulled muscle",
                "Back pain",
                "Tension headaches",
            ],
        },
        {
            heading: "Renew a previous prescription",
            items: [
                "We can evaluate you for a script renewal even if you received it from another doctor's office.",
            ],
            note:
                "Please note: We can’t prescribe controlled substances like Adderall, Vyvanse, Xanax or Ativan.",
        },
    ],
};

export default function SymptomsWeTreat({ content = SYMPTOMS_CONTENT }) {
    const { title, groups } = content;

    return (
        <section className="w-full bg-white py-16 sm:py-24 font-SofiaSans">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="max-w-3xl mb-10">
                    <h2 className="text-3xl sm:text-4xl font-semibold text-slate-900 mb-4">
                        {title}
                    </h2>
                </div>

                {/* Masonry-style columns */}
                <div className="space-y-6 md:space-y-0 md:columns-3 md:gap-8">
                    {groups.map((group, idx) => (
                        <div
                            key={idx}
                            className="break-inside-avoid pb-4"
                        >
                            <div className="rounded-2xl bg-white shadow-sm p-5 sm:p-6 border-x-2 border-secondary ">

                                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                                    {group.heading}
                                </h3>

                                <ul className="space-y-0 text-sm sm:text-base text-slate-700">
                                    {group.items.map((item, i) => (
                                        <li key={i} className="flex">
                                            {typeof item === "string" ? (
                                                <span>{item}</span>
                                            ) : (
                                                <Link
                                                    href={item.href}
                                                    className="text-sky-700 hover:underline"
                                                >
                                                    {item.label}
                                                </Link>
                                            )}
                                        </li>
                                    ))}
                                </ul>

                                {group.note && (
                                    <p className="mt-4 text-xs text-slate-500 italic">
                                        {group.note}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
