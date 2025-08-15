"use client";

import Image from "next/image";

export default function CompoundedExplainer() {
    return (
        <section
            className="relative watermark  isolate w-full overflow-hidden"
            data-text="somi"
            style={{
                '--wm-size': '160px',     // text size
                '--wm-stroke-c': '#364c781d',                   // outline color
                '--wm-stroke-w': '2px',                       // outline width
                '--wm-fill': 'transparent',                   // set e.g. 'rgba(0,0,0,.06)' for filled text
                '--wm-font': '"Sofia Sans", ui-sans-serif',      // font family
                '--wm-weight': 700,                           // font weight
                '--wm-tracking': '0em',                    // letter spacing
                '--wm-opacity': 1,                         // overall opacity
                '--wm-left': '0rem',                         // horizontal offset
                '--wm-rotate': '0deg',                       // rotate; use '0deg' for horizontal

                backgroundImage:
                    "linear-gradient(#FFFFFF 0 230px, #E9ECF1 230px 100%)",
            }}
        >
            <div className="mx-auto max-w-7xl px-4 md:px-6 pt-10 md:pt-14">

                {/* Content grid */}
                <div className="mt-6 grid items-center gap-8 md:mt-8 md:grid-cols-2 md:gap-12" >

                    {/* Right copy */}
                    <div className="text-[15px] leading-7 text-gray-700 sm:text-base">
                        {/* Heading */}
                        <h2 className="font-SofiaSans text-3xl mb-4 font-bold leading-tight text-gray-900 sm:text-4xl md:text-[40px]">
                            What are Compounded
                            <br className="hidden sm:block" /> GLP-1 Medications?
                        </h2>
                        <p className="mb-4">
                            Compounded GLP-1 medications are personalized versions of
                            treatments like Semaglutide or Tirzepatide.
                        </p>
                        <p className="mb-4">
                            They’re made by licensed compounding pharmacies based on a
                            prescription from a qualified healthcare provider.
                        </p>
                        <p>
                            They contain the same active ingredient as the branded
                            medications, but are compounded to offer a more personalized and
                            often more accessible option.
                        </p>
                    </div>
                    {/* Left image (replace the src) */}
                    <div className="relative w-full max-w-lg z-10 hidden sm:block">
                        <Image
                            src="/hero/bmilady.png"
                            alt="BMI Calculator"
                            width={500}
                            height={500}
                            className="mx-auto bottom-0"
                        />
                    </div>

                </div>
            </div>

        </section>
    );
}
