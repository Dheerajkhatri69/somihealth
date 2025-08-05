"use client";

import { Tabs } from "../ui/tabs";
import { Beaker, BadgeDollarSign, ShieldCheck, Check } from "lucide-react";

export function TabsDemo() {
    const tabs = [
        {
            title: "Research",
            value: "research",
            content: (
                <Panel
                    icon={<Beaker className="h-6 w-6" />}
                    bullets={[
                        "Years Of Research",
                        "Reliable Medications",
                        "Science-Backed Treatments",
                    ]}
                    body={`At Somi Health, we offer GLP-1 and GIP/GLP-1 therapies,
including compounded Semaglutide and Tirzepatide, supporting safe and
effective weight management.`}
                />
            ),
        },
        {
            title: "Pricing",
            value: "pricing",
            content: (
                <Panel
                    icon={<BadgeDollarSign className="h-6 w-6" />}
                    bullets={["No Hidden Fees.", "No Gimmicks.", "Transparent Pricing"]}
                    body={`Our pricing is clear, straightforward, and free from hidden costs,
giving you full confidence in knowing exactly what you’re paying for and
what to expect throughout your journey.`}
                />
            ),
        },
        {
            title: "Safety",
            value: "safety",
            content: (
                <Panel
                    icon={<ShieldCheck className="h-6 w-6" />}
                    bullets={[
                        "FDA Approved",
                        "Safe & Effective",
                        "Safety & Quality Guaranteed",
                    ]}
                    body={`All medications are sourced from FDA-overseen, 503(a) pharmacies and
undergo strict third-party testing to ensure your safety and the highest
quality standards.`}
                />
            ),
        },
    ];

    return (
        <div className="relative mx-auto mb-[500px] flex w-full max-w-5xl flex-col p-4 md:p-0 watermark"
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
                '--wm-top': '8rem',                         // horizontal offset
                '--wm-rotate': '0deg',                       // rotate; use '0deg' for horizontal
            }}

        >
            <Tabs tabs={tabs} />
        </div>
    );
}

/* ---------- content panel ---------- */
function Panel({ icon, bullets = [], body }) {
    return (
        <div className="
  relative isolate h-full w-full min-h-[18rem]
  overflow-hidden rounded-3xl
  bg-gradient-to-br from-lightprimary via-lightprimary to-lightprimary-foreground
  p-6 md:p-10 text-secondary
  ring-1 ring-black/5
  shadow-[0_20px_60px_-15px_rgba(16,24,40,0.35)]
  transition-transform duration-300
  hover:-translate-y-1
  hover:shadow-[0_32px_80px_-20px_rgba(16,24,40,0.45)]
  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/60
  "
        >
            <div className="mb-5 flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/15">
                    {icon}
                </span>
                <p className="text-xs font-semibold uppercase tracking-wide text-white/85">
                    Somi Health
                </p>
            </div>

            {/* headline bullets */}
            <ul className="grid gap-2 sm:grid-cols-2">
                {bullets.map((b, i) => (
                    <li key={i} className="flex items-start gap-2 text-base md:text-lg">
                        <Check className="mt-0.5 h-5 w-5 shrink-0 text-secondary/95" />
                        <span className="text-secondary">{b}</span>
                    </li>
                ))}
            </ul>

            {/* paragraph */}
            <p className="mt-5 max-w-3xl text-sm leading-6 text-secondary/90 md:text-base">
                {body}
            </p>
        </div>
    );
}
