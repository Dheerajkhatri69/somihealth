"use client";

/**
 * MultiComponent.jsx
 *
 * Reusable section that accepts an array of objects (id, heading, bgcolour, point[])
 * and renders them in sequence. Each block can have its own background color and
 * multiple bullet/paragraph points.
 */

const DEFAULT_CONTENT = [
    {
        id: 1,
        heading: "Treatments & Risks",
        bgcolour: "fffaf6",
        point: [
            "A member of our medical team will review the answers to your health questionnaire before your video starts. They’ll look at your history of high blood pressure or hypertension and treatments we can offer safely online. If you haven’t been diagnosed or treated for hypertension by a healthcare professional previously, we won’t be able to start treatment for you.",
            "Please answer all questions as honestly as you can, especially if you’re taking other medications. It’s critical to your health and safety that our medical team knows your entire medical history.",
            "As with any medical examination, there’s a small risk we’ll get the diagnosis wrong. Because we can’t meet and examine you in person, there’s the additional possibility that we may miss something medically relevant or give you the wrong advice.",
            "If we’re in any doubt, we’ll ask you to see a healthcare professional in person for a follow-up consultation. We understand how frustrating this can be, but it’s not safe for us to treat your hypertension if you’ve never been evaluated or treated by a doctor before.",
        ],
    },
];

export default function MultiComponent({ content = DEFAULT_CONTENT }) {
    return (
        <section className="relative isolate">
            {content.map((block) => {
                const bgClass = block.bgcolour?.startsWith("bg-")
                    ? block.bgcolour // Tailwind class
                    : ""; // fallback if hex

                const bgStyle = !block.bgcolour?.startsWith("bg-")
                    ? { backgroundColor: `#${block.bgcolour}` } // apply inline style
                    : {};

                return (
                    <div
                        key={block.id}
                        className={`mx-auto mb-8 max-w-6xl rounded-3xl px-4 py-16 md:px-8 ${bgClass}`}
                        style={bgStyle}
                    >
                        <h2 className="text-center font-SofiaSans text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
                            {block.heading}
                        </h2>
                        <div className="mt-8 space-y-6 text-base leading-7 text-slate-700">
                            {block.point.map((p, idx) => (
                                <p key={idx}>{p}</p>
                            ))}
                        </div>
                    </div>
                );
            })}
        </section>
    );
}

