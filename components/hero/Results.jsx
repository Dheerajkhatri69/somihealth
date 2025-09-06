"use client";

import { useEffect, useState } from "react";
import { Tabs } from "../ui/tabs";
import { Beaker, BadgeDollarSign, ShieldCheck, Check } from "lucide-react";

export function TabsDemo() {
    const [content, setContent] = useState({
        tabs: [],
        watermark: {
            text: 'somi',
            size: '160px',
            strokeColor: '#364c781d',
            strokeWidth: '2px',
            fill: 'transparent',
            font: '"Sofia Sans", ui-sans-serif',
            weight: 700,
            tracking: '0em',
            opacity: 1,
            left: '0rem',
            top: '8rem',
            rotate: '0deg'
        }
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchContent();
    }, []);

    async function fetchContent() {
        setLoading(true);
        try {
            const res = await fetch('/api/results', { cache: 'no-store' });
            const data = await res.json();

            if (data?.success) {
                setContent(data.result);
            }
        } catch (error) {
            console.error('Error fetching Results content:', error);
        } finally {
            setLoading(false);
        }
    }

    // Fallback content if API fails
    const fallbackContent = {
        tabs: [
            {
                title: "Research",
                value: "research",
                color: "#3B82F6",
                bg: "#EAF2FF",
                bgActive: "#DCEAFF",
                bullets: ["Years Of Research", "Reliable Medications", "Science-Backed Treatments"],
                body: `At Somi Health, we offer GLP-1 and GIP/GLP-1 therapies,
including compounded Semaglutide and Tirzepatide, supporting safe and
effective weight management.`,
                icon: "Beaker"
            },
            {
                title: "Pricing",
                value: "pricing",
                color: "#10B981",
                bg: "#EAF7F1",
                bgActive: "#D7F2E6",
                bullets: ["No Hidden Fees.", "No Gimmicks.", "Transparent Pricing"],
                body: `Our pricing is clear, straightforward, and free from hidden costs,
giving you full confidence in knowing exactly what you're paying for and
what to expect throughout your journey.`,
                icon: "BadgeDollarSign"
            },
            {
                title: "Safety",
                value: "safety",
                color: "#EC4899",
                bg: "#FCE7F3",
                bgActive: "#FBCFE8",
                bullets: ["FDA Approved", "Safe & Effective", "Safety & Quality Guaranteed"],
                body: `All medications are sourced from FDA-overseen, 503(a) pharmacies and
undergo strict third-party testing to ensure your safety and the highest
quality standards.`,
                icon: "ShieldCheck"
            }
        ],
        watermark: {
            text: 'somi',
            size: '160px',
            strokeColor: '#364c781d',
            strokeWidth: '2px',
            fill: 'transparent',
            font: '"Sofia Sans", ui-sans-serif',
            weight: 700,
            tracking: '0em',
            opacity: 1,
            left: '0rem',
            top: '8rem',
            rotate: '0deg'
        }
    };

    const displayContent = loading ? fallbackContent : content;

    // Convert API data to component format
    const tabs = displayContent.tabs.map(tab => ({
        title: tab.title,
        value: tab.value,
        color: tab.color,
        bg: tab.bg,
        bgActive: tab.bgActive,
        content: (
            <Panel
                color={tab.color}
                bgLight={tab.bg}
                icon={tab.icon === 'Beaker' ? <Beaker className="h-6 w-6" /> : 
                      tab.icon === 'BadgeDollarSign' ? <BadgeDollarSign className="h-6 w-6" /> : 
                      <ShieldCheck className="h-6 w-6" />}
                bullets={tab.bullets}
                body={tab.body}
            />
        ),
    }));

    if (loading) {
        return (
            <div className="relative mx-auto mb-[500px] flex w/full max-w-5xl flex-col p-4 mt-10 md:p-0">
                <div className="h-64 w-full rounded-2xl bg-gray-200 animate-pulse" />
            </div>
        );
    }

    return (
        <div
            className="relative mx-auto mb-[500px] flex w/full max-w-5xl flex-col p-4 mt-10 md:p-0 watermark"
            data-text={displayContent.watermark.text}
            style={{
                "--wm-size": displayContent.watermark.size,
                "--wm-stroke-c": displayContent.watermark.strokeColor,
                "--wm-stroke-w": displayContent.watermark.strokeWidth,
                "--wm-fill": displayContent.watermark.fill,
                "--wm-font": displayContent.watermark.font,
                "--wm-weight": displayContent.watermark.weight,
                "--wm-tracking": displayContent.watermark.tracking,
                "--wm-opacity": displayContent.watermark.opacity,
                "--wm-left": displayContent.watermark.left,
                "--wm-top": displayContent.watermark.top,
                "--wm-rotate": displayContent.watermark.rotate,
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
