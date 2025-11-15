// app/components/InPersonRequired.jsx
"use client";

const IN_PERSON_CONTENT = {
    title:
        "If any of the following apply, see a doctor or nurse practitioner in person",
    subtitle:
        "As an online doctor’s office, there are necessary limitations on who and how we can help. If any of the following apply, you'll be asked to see a doctor in person.",
    columns: [
        {
            items: [
                "Under 18 or 75 and older",
                "Short of breath, wheezing, or having difficulty breathing",
                "Chest pain",
                "Experiencing confusion",
                "Hospitalized during the past week",
                "Severe neck pain with sensitivity to light or sound",
                "Dizziness and making low amounts of urine",
                "Needing paperwork for disability evaluation, physicals for employment, work compensation, time off, HSA / FSA reimbursement",
                "New diagnosis or treatment of ADHD, bipolar, psychosis, or other mood disorders",
            ],
        },
        {
            items: [
                "Refills of ADHD medicines such as Adderall, Ritalin, Vyvanse, Concerta",
                "Refills of sleeping medicines such as Ambien, Lunesta, zolpidem",
                "Refills of weight loss medicines such as phentermine",
                "Refills of benzodiazepines such as Xanax, Ativan, Valium, Klonopin",
                "Refills of opioid pain medicines such as Vicodin, Oxycodone, Dilaudid, Codeine",
                "Refills of controlled substances like testosterone",
                "Refills of antipsychotic medicines such as Risperdal, Zyprexa, olanzapine",
                "Refills of Suboxone, Fioricet",
                "Refills of Modafinil, Armodafinil for narcolepsy or shift work",
            ],
        },
    ],
};

export default function InPersonRequired({ content = IN_PERSON_CONTENT }) {
    const { title, subtitle, columns } = content;

    return (
        <section className="w-full font-SofiaSans bg-white py-16 sm:py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">

                {/* Header */}
                <div className="text-center max-w-4xl mx-auto mb-14">
                    <h2 className="text-2xl sm:text-4xl md:text-5xl font-semibold text-slate-800 mb-4">
                        {title}
                    </h2>

                    <p className="text-sm md:text-lg text-slate-600 leading-relaxed">
                        {subtitle}
                    </p>
                </div>

                {/* Redesigned layout: two pastel cards */}
                <div className="grid md:grid-cols-2 gap-6">

                    {columns.map((col, idx) => (
                        <div
                            key={idx}
                            className="bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-all duration-200"
                        >
                            <ul className="space-y-3 text-sm sm:text-base text-slate-700">
                                {col.items.map((item, i) => (
                                    <li
                                        key={i}
                                        className="flex gap-3 items-start bg-white rounded-xl px-4 py-3 border border-slate-100 hover:border-slate-300 transition-colors"
                                    >
                                        <span className="mt-1 text-rose-500 text-sm font-bold leading-none">
                                            ✕
                                        </span>
                                        <span className="leading-snug">
                                            {item}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}

                </div>
            </div>
        </section>
    );
}
