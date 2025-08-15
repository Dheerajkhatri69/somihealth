"use client";

import { Tabs } from "../ui/tabs";
import { Beaker, BadgeDollarSign, ShieldCheck, Check } from "lucide-react";

export function TabsDemo() {
    const tabs = [
        {
            title: "Research",
            value: "research",
            color: "#3B82F6",     // accent (blue-500)
            bg: "#EAF2FF",        // light blue background
            bgActive: "#DCEAFF",  // slightly stronger on active
            content: (
                <Panel
                    color="#3B82F6"
                    bgLight="#EAF2FF"
                    icon={<Beaker className="h-6 w-6" />}
                    bullets={["Years Of Research", "Reliable Medications", "Science-Backed Treatments"]}
                    body={`At Somi Health, we offer GLP-1 and GIP/GLP-1 therapies,
including compounded Semaglutide and Tirzepatide, supporting safe and
effective weight management.`}
                />
            ),
        },
        {
            title: "Pricing",
            value: "pricing",
            color: "#10B981",     // emerald-500
            bg: "#EAF7F1",        // light emerald
            bgActive: "#D7F2E6",  // stronger active
            content: (
                <Panel
                    color="#10B981"
                    bgLight="#EAF7F1"
                    icon={<BadgeDollarSign className="h-6 w-6" />}
                    bullets={["No Hidden Fees.", "No Gimmicks.", "Transparent Pricing"]}
                    body={`Our pricing is clear, straightforward, and free from hidden costs,
giving you full confidence in knowing exactly what you’re paying for and
what to expect throughout your journey.`}
                />
            ),
        },
        // In TabsDemo tabs array, replace the "Safety" tab object with:
        {
            title: "Safety",
            value: "safety",
            color: "#EC4899",     // pink-500
            bg: "#FCE7F3",        // pink-100 (light bg)
            bgActive: "#FBCFE8",  // pink-200 (active pill)
            content: (
                <Panel
                    color="#EC4899"
                    bgLight="#FCE7F3"
                    icon={<ShieldCheck className="h-6 w-6" />}
                    bullets={["FDA Approved", "Safe & Effective", "Safety & Quality Guaranteed"]}
                    body={`All medications are sourced from FDA-overseen, 503(a) pharmacies and
undergo strict third-party testing to ensure your safety and the highest
quality standards.`}
                />
            ),
        },
    ];

    return (
        <div
            className="relative mx-auto mb-[500px] flex w/full max-w-5xl flex-col p-4 mt-10 md:p-0 watermark"
            data-text="somi"
            style={{
                "--wm-size": "160px",
                "--wm-stroke-c": "#364c781d",
                "--wm-stroke-w": "2px",
                "--wm-fill": "transparent",
                "--wm-font": '"Sofia Sans", ui-sans-serif',
                "--wm-weight": 700,
                "--wm-tracking": "0em",
                "--wm-opacity": 1,
                "--wm-left": "0rem",
                "--wm-top": "8rem",
                "--wm-rotate": "0deg",
            }}
        >
            <Tabs tabs={tabs} />
        </div>
    );
}

/* ---------- content panel ---------- */
function Panel({ icon, bullets = [], body, color = "#3B82F6", bgLight = "#EAF2FF" }) {
    return (
        <div
            className="
        relative isolate h-full w-full min-h-[18rem]
        overflow-hidden rounded-3xl
        p-6 md:p-10 text-secondary ring-1 ring-black/5
        shadow-[0_20px_60px_-15px_rgba(16,24,40,0.35)]
        transition-transform duration-300 hover:-translate-y-1
        hover:shadow-[0_32px_80px_-20px_rgba(16,24,40,0.45)]
        focus-visible:outline-none focus-visible:ring-2
      "
            style={{
                background: `linear-gradient(135deg, ${bgLight}, white)`,
                borderTop: `4px solid ${color}`,
            }}
        >
            <div className="mb-5 flex items-center gap-3">
                <span
                    className="grid h-10 w-10 place-items-center rounded-xl"
                    style={{ backgroundColor: bgLight, color }}
                >
                    {icon}
                </span>
                <p className="text-xs font-semibold uppercase tracking-wide" style={{ color }}>
                    Somi Health
                </p>
            </div>

            <ul className="grid gap-2 sm:grid-cols-2">
                {bullets.map((b, i) => (
                    <li key={i} className="flex items-start gap-2 text-base md:text-lg">
                        <Check className="mt-0.5 h-5 w-5 shrink-0" style={{ color }} />
                        <span style={{ color }}>{b}</span>
                    </li>
                ))}
            </ul>

            <p style={{ color }} className="mt-5 max-w-3xl text-sm leading-6 md:text-base">
                {body}
            </p>
        </div>
    );
}
