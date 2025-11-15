// app/components/TreatmentsRisks.jsx
"use client";

const TREATMENTS_RISKS_CONTENT = {
    title: "Treatments & Risks",
    paragraphs: [
        "One of our doctors or nurse practitioners will review the answers to your health questionnaire before your video starts. They’ll discuss with you possible diagnoses and treatments.",

        "Please answer all questions as honestly as you can, especially if you’re taking other medications. It’s critical to your health and safety that the medical team knows your entire medical history.",

        "As with any doctor’s visit, there’s always a small risk that we’ll get the diagnosis wrong. Because we can’t meet and examine you in person, there’s the additional possibility that we may miss something or give you the wrong advice. If we’re in any doubt, we’ll ask you to see a doctor or nurse practitioner in person for a follow-up consultation. We understand how frustrating this can be, but some medical concerns are simply not safe to treat online. We follow evidence-based guidelines and industry standards in how we diagnose, prescribe and advise our patients online."
    ],
};

export default function TreatmentsRisks({ content = TREATMENTS_RISKS_CONTENT }) {
    const { title, paragraphs } = content;

    return (
        <section className="w-full font-SofiaSans bg-darkprimary-foreground/20 py-16 sm:py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Title */}
                <h2 className="text-center text-2xl sm:text-4xl md:text-5xl font-semibold text-darkprimary mb-10">
                    {title}
                </h2>

                {/* Paragraphs */}
                <div className="space-y-6 text-black text-base sm:text-lg leading-relaxed">
                    {paragraphs.map((text, idx) => (
                        <p key={idx}>{text}</p>
                    ))}
                </div>

            </div>
        </section>
    );
}
