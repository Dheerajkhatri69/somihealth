"use client";

import * as React from "react";
import * as Lucide from "lucide-react";

export default function FeatureBanner({
    api = "/api/feature-banners",
    queryKey = "global",
    className = "",
    speed = 28, // seconds per full loop
}) {
    const [items, setItems] = React.useState([]);

    React.useEffect(() => {
        (async () => {
            try {
                const url = `${api}?key=${encodeURIComponent(queryKey)}`;
                const res = await fetch(url, { cache: "no-store" });
                const json = await res.json();
                setItems(json?.result || []);
            } catch (e) {
                console.error(e);
            }
        })();
    }, [api, queryKey]);

    const marqueeItems = React.useMemo(
        () => (items?.length ? [...items, ...items] : []),
        [items]
    );

    if (!items?.length) return null;

    return (
        <div
            className={`relative overflow-hidden w-full bg-[#fafbfc] rounded-xl ${className}`}
        >
            <div
                className="flex items-center gap-28 whitespace-nowrap will-change-transform animate-marquee px-6 py-2"
                style={{
                    animationDuration: `${Math.max(12, speed + items.length * 3)}s`,
                }}
            >
                {marqueeItems.map((it, idx) => {
                    const Icon = Lucide[it.icon] || Lucide.Circle;
                    return (
                        <div key={idx} className="flex items-center gap-2 shrink-0">
                            <Icon className="h-5 w-5 text-darkprimary" />
                            <span className="text-base font-medium text-darkprimary font-SofiaSans">
                                {it.label}
                            </span>
                        </div>
                    );
                })}
            </div>

            <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-marquee {
          animation-name: marquee;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused; /* pause on hover */
        }
      `}</style>
        </div>
    );
}
