"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function MainButtonGroup() {
    const pathname = usePathname();

    const buttons = [
        { label: "Weight Loss", path: "/dashboard" },
        { label: "Longevity", path: "/dashboard/main/longevity" },
        { label: "Erectile Dysfunction", path: "/dashboard/main/ed" },
        { label: "Skin and Hair", path: "/dashboard/main/skinhair" },
    ];

    const baseStyle =
        "relative px-4 py-2 rounded-xl text-sm font-medium transition-all border";
    const activeStyle = "bg-secondary text-white border-secondary";
    const inactiveStyle =
        "bg-white text-secondary border-secondary/80 hover:bg-secondary hover:text-white";

    return (
        <div className="flex gap-3 mb-2">
            {buttons.map((btn, index) => {
                const isActive = pathname === btn.path;

                return (
                    <Link key={index} href={btn.path}>
                        <button className={`${baseStyle} ${isActive ? activeStyle : inactiveStyle}`}>
                            {btn.label}
                        </button>
                    </Link>
                );
            })}
        </div>
    );
}