// app/components/CallUsSection.jsx
"use client";

import Image from "next/image";

const CALL_US_CONTENT = {
    title: "Call us. We’re here to help",
    phone: "888-536-2267",
    desc: "Lemonaid Health is a national telehealth company based in San Francisco, CA.",
    image: {
        src: "/Callus.png", // YOU CAN REPLACE
        alt: "Support team representative",
    },
};

export default function CallUsSection({ content = CALL_US_CONTENT }) {
    const { title, phone, desc, image } = content;

    return (
        <section className="w-full bg-[#f8fcfa] py-16 sm:py-20 font-SofiaSans">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-10 items-center">

                {/* LEFT IMAGE */}
                <div className="relative h-[380px] md:h-[490px] rounded-2xl border-b-4 border-darkprimary">
                    <Image
                        src={image.src}
                        alt={image.alt}
                        fill
                        className="object-cover"
                    />
                </div>
         

                {/* RIGHT TEXT */}
                <div>
                    <h2 className="text-3xl sm:text-4xl font-semibold text-slate-900 mb-6">
                        {title}
                    </h2>

                    <a
                        href={`tel:${phone}`}
                        className="block text-3xl sm:text-4xl font-bold text-darkprimary mb-4 hover:underline"
                    >
                        {phone}
                    </a>

                    <p className="text-base sm:text-lg text-slate-700">
                        {desc}
                    </p>
                </div>

            </div>
        </section>
    );
}
