// components/HowItWorks.jsx
"use client";

import * as Icons from "lucide-react";

function Icon({ name, className }) {
    const Cmp = Icons[name] || Icons.Circle;
    return <Cmp className={className} aria-hidden />;
}

export default function HowItWorks({ data }) {
    const { heading, intro } = data;
    return (
        <section className="py-10 px-4 rounded-3xl text-center watermark"
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
                '--wm-left': '-7rem',                         // horizontal offset
                '--wm-top': '0rem',                         // horizontal offset
                '--wm-rotate': '90deg',                       // rotate; use '0deg' for horizontal

                backgroundImage:
                    "linear-gradient(#E9ECF1 50%,#FFFFFF 50%)",
            }}
        >
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">{heading}</h2>
            <p className="mx-auto mt-5 max-w-3xl text-gray-600">{intro}</p>
        </section>
    );
}
