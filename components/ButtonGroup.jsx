"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useMemo } from "react";

export default function ButtonGroup() {
    const pathname = usePathname();

    // Buttons with unseen API support
    const buttons = useMemo(() => [
        { label: "Weight Loss", path: "/dashboard", unseenapi: "/api/weightloss/seen-count" },
        { label: "Longevity", path: "/dashboard/longevity", unseenapi: "/api/longevity/seen-count" },
        { label: "Erectile Dysfunction", path: "/dashboard/ed", unseenapi: "/api/ed/seen-count" },
        { label: "Skin and Hair", path: "/dashboard/skinhair", unseenapi: "/api/skinhair/seen-count" },
    ], []);
    // Fetch unseen counts for each button
    const [unseenCounts, setUnseenCounts] = useState({});

    useEffect(() => {
        const fetchCounts = async () => {
            const updatedCounts = {};

            for (const btn of buttons) {
                if (btn.unseenapi) {
                    try {
                        const res = await fetch(btn.unseenapi);
                        const data = await res.json();
                        updatedCounts[btn.path] = data?.count ?? 0;
                    } catch (e) {
                        console.error("Failed fetching unseen for", btn.label, e);
                        updatedCounts[btn.path] = 0;
                    }
                }
            }

            setUnseenCounts(updatedCounts);
        };

        fetchCounts();

        // Refresh unseen counts every 30 seconds
        const interval = setInterval(fetchCounts, 30000);
        return () => clearInterval(interval);
    }, [buttons]);

    const baseStyle =
        "relative px-4 py-2 rounded-xl text-sm font-medium transition-all border";
    const activeStyle = "bg-secondary text-white border-secondary";
    const inactiveStyle =
        "bg-white text-secondary border-secondary/80 hover:bg-secondary hover:text-white";

    return (
        <div className="flex gap-3 my-2">
            {buttons.map((btn, index) => {
                const isActive = pathname === btn.path;
                const unseen = unseenCounts[btn.path] || 0;

                return (
                    <Link key={index} href={btn.path} className="relative">
                        <button className={`${baseStyle} ${isActive ? activeStyle : inactiveStyle}`}>
                            {btn.label}
                        </button>

                        {/* 🔴 Notification Badge */}
                        {unseen > 0 && (
                            <span
                                className="
                                    absolute -top-2 -right-2
                                    bg-red-500 text-white text-xs font-bold
                                    rounded-full h-5 w-5 flex items-center justify-center
                                "
                            >
                                {unseen}
                            </span>
                        )}
                    </Link>
                );
            })}
        </div>
    );
}
