"use client";

import { ArrowRightIcon, Sparkles, User } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useWebsiteData } from "@/contexts/WebsiteDataContext";
import { NavbarSkeleton, MegaPanelSkeleton } from "@/components/LoadingSkeleton";

/* =================== ICONS =================== */
const Chevron = ({ open }) => (
    <svg className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} viewBox="0 0 20 20" fill="currentColor">
        <path d="M5.23 7.21a.75.75 0 011.06.02L10 10.17l3.71-2.94a.75.75 0 11.94 1.17l-4.18 3.31a.75.75 0 01-.94 0L5.21 8.4a.75.75 0 01.02-1.19z" />
    </svg>
);
const ArrowRight = () => (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
        <path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);
const CloseIcon = () => (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
        <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
);
const BackIcon = () => (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
        <path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

/* =================== DESKTOP MEGA PANEL =================== */
function MegaPanel({ menuKey, onNavigate }) {
    const { getMenuBySlug, isLoading } = useWebsiteData();
    const data = getMenuBySlug(menuKey);

    if (isLoading) return <MegaPanelSkeleton />;
    if (!data) return null;

    return (
        <div
            className="watermark w-full border-t  rounded-b-3xl bg-lightprimary"
        >
            <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-10 md:grid-cols-12 md:px-6">
                <div
                    className="watermark md:col-span-1"
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
                        '--wm-rotate': '90deg',                       // rotate; use '0deg' for horizontal
                    }}
                >
                </div>
                {data.type === "categorized" ? (
                    <>
                        {/* Direct Primary Care */}

                        <div className="md:col-span-3">
                            <div className="text-sm font-semibold uppercase tracking-wide text-darkprimary">Direct Primary Care</div>
                            <ul className="mt-4 space-y-2">
                                {data.categories[0]?.items.map((item) => (
                                    <li key={item.label}>
                                        <Link
                                            href={item.href}
                                            onClick={onNavigate}
                                            className="group relative flex w-full items-center justify-between gap-2 rounded-xl border-l-2 duration-100 ease-in-out border-secondary hover:border-l-4 hover:border-secondary px-3 py-2 text-sm font-medium text-secondary transition-colors hover:text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-300"
                                        >
                                            {/* Label */}
                                            <span className="text-lg font-SofiaSans">
                                                {item.label}
                                            </span>

                                            {/* Animated underline (grows from left on hover) */}
                                            <span
                                                aria-hidden="true"
                                                className="pointer-events-none absolute inset-x-3 bottom-1.5 h-px origin-left scale-x-0 bg-gray-300 transition-transform duration-300 group-hover:scale-x-100motion-reduce:hidden"
                                            />
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Same-day Care */}
                        <div className="md:col-span-3">
                            <div className="text-sm font-semibold uppercase tracking-wide text-darkprimary">Same-day Care</div>
                            <ul className="mt-4 space-y-2">
                                {data.categories[1]?.items.map((item) => (
                                    <li key={item.label}>
                                        <Link
                                            href={item.href}
                                            onClick={onNavigate}
                                            className="group relative flex w-full items-center justify-between gap-2 rounded-xl border-l-2 duration-100 ease-in-out border-secondary hover:border-l-4 hover:border-secondary px-3 py-2 text-sm font-medium text-secondary transition-colors hover:text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-300"
                                        >
                                            {/* Label */}
                                            <span className="text-lg font-SofiaSans">
                                                {item.label}
                                            </span>

                                            {/* Animated underline (grows from left on hover) */}
                                            <span
                                                aria-hidden="true"
                                                className="pointer-events-none absolute inset-x-3 bottom-1.5 h-px origin-left scale-x-0 bg-gray-300 transition-transform duration-300 group-hover:scale-x-100motion-reduce:hidden"
                                            />
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Medication Refill */}
                        <div className="md:col-span-4">
                            <div className="text-sm font-semibold uppercase tracking-wide text-darkprimary">Medication Refill</div>
                            <ul className="mt-4 space-y-2">
                                {data.categories[2]?.items.map((item) => (
                                    <li key={item.label}>
                                        <Link
                                            href={item.href}
                                            onClick={onNavigate}
                                            className="group relative flex w-full items-center justify-between gap-2 rounded-xl border-l-2 duration-100 ease-in-out border-secondary hover:border-l-4 hover:border-secondary px-3 py-2 text-sm font-medium text-secondary transition-colors hover:text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-300"
                                        >
                                            {/* Label */}
                                            <span className="text-lg font-SofiaSans">
                                                {item.label}
                                            </span>

                                            {/* Animated underline (grows from left on hover) */}
                                            <span
                                                aria-hidden="true"
                                                className="pointer-events-none absolute inset-x-3 bottom-1.5 h-px origin-left scale-x-0 bg-gray-300 transition-transform duration-300 group-hover:scale-x-100motion-reduce:hidden"
                                            />
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                            <div className="relative aspect-[16/11] mt-4 rounded-2xl overflow-hidden bg-gray-100">
                                <img src={data.cta.img} alt="" className="h-full w-full object-cover" />

                                {/* subtle gradient to improve readability */}
                                <div
                                    className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/40 via-black/10 to-black/60"
                                    aria-hidden="true"
                                />
                                <div className="absolute left-4 top-4 right-4">
                                    <div className="whitespace-pre-line text-xl font-bold tracking-tight text-white drop-shadow">
                                        {String(data?.cta?.title ?? '').replace(/\\n/g, '\n')}
                                    </div>
                                </div>



                                {/* button – bottom-left */}
                                <div className="absolute bottom-4 left-4">
                                    <Link
                                        href={data.cta.button.href}
                                        onClick={onNavigate}
                                        className="fx86 inline-flex items-center gap-3 font-SofiaSans  rounded-full hover:bg-transparent bg-darkprimary px-5 py-2 font-semibold text-white hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
                                        style={{ "--fx86-base": "transparent" }}
                                    >
                                        {data.cta.button.label}
                                        <span className="inline-flex h-7 w-7 items-center justify-center">
                                            <ArrowRight />
                                        </span>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        {/* Discover */}
                        <div className="md:col-span-3">
                            <div className="text-sm font-semibold uppercase tracking-wide mb-4 text-darkprimary">Discover</div>
                            <Link
                                href={data.discover.href}
                                onClick={onNavigate}
                                className="fx86 inline-flex font-SofiaSans w-full items-center justify-between border border-darkprimary rounded-3xl bg-transparent text-darkprimary px-5 py-2 text-base font-semibold shadow-sm md:w-auto"
                                style={{ "--fx86-base": "transparent", "--fx86-glow": "#364c781d" }}
                            >
                                {data.discover.label}
                                <span className="ml-3 inline-flex h-8 w-8 items-center justify-center">
                                    <ArrowRight />
                                </span>
                            </Link>
                            <Link
                                href={"/underdevelopmentmainpage/healthcoach"}
                                onClick={onNavigate}
                                className="fx86 inline-flex mt-4 font-SofiaSans w-full items-center justify-between border border-darkprimary rounded-3xl bg-transparent text-darkprimary px-5 py-2 text-base font-semibold shadow-sm md:w-auto"
                                style={{ "--fx86-base": "transparent", "--fx86-glow": "#364c781d" }}
                            >
                                Health Coach
                                <span className="ml-3 inline-flex h-8 w-8 items-center justify-center">
                                    <ArrowRight />
                                </span>
                            </Link>
                            {
                                data.discover.label === "Weight Loss" && (
                                    <>
                                        <div className="text-sm font-semibold uppercase tracking-wide mt-4 text-darkprimary">Existing Patients</div>
                                        <Link
                                            href={"/refills"}
                                            onClick={onNavigate}
                                            className="fx86 inline-flex mt-4 font-SofiaSans w-full items-center justify-between border border-darkprimary rounded-3xl bg-transparent text-darkprimary px-5 py-2 text-base font-semibold shadow-sm md:w-auto"
                                            style={{ "--fx86-base": "transparent", "--fx86-glow": "#364c781d" }}
                                        >
                                            Refills
                                            <span className="ml-3 inline-flex h-8 w-8 items-center justify-center">
                                                <ArrowRight />
                                            </span>
                                        </Link>
                                    </>
                                )
                            }
                        </div>

                        {/* Treatments */}
                        <div className="md:col-span-4">
                            <div className="text-sm font-semibold uppercase tracking-wide text-darkprimary">Treatments</div>
                            <ul className="mt-4 space-y-5">
                                {data.treatments.map((t) => (
                                    <li key={t.label}>
                                        <Link href={t.href} onClick={onNavigate} className="group flex items-center gap-4 rounded-xl p-2 border-l-2 duration-100 ease-in-out border-secondary hover:border-l-4 hover:border-secondary">
                                            <div className="flex h-10 w-10 items-center justify-center">
                                                <img src={t.img} alt="" className="h-10 w-10 object-contain" />
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-lg font-SofiaSans font-medium text-gray-900">{t.label}</span>
                                                {t.badge && (
                                                    <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-semibold text-white">NEW</span>
                                                )}
                                            </div>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* CTA */}
                        <div className="md:col-span-4">
                            <div className="text-sm font-semibold uppercase tracking-wide text-darkprimary">Get Started</div>
                            <div className="relative aspect-[16/11] mt-4 rounded-2xl overflow-hidden bg-gray-100">
                                <img src={data.cta.img} alt="" className="h-full w-full object-cover" />

                                {/* subtle gradient to improve readability */}
                                <div
                                    className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/40 via-black/10 to-black/60"
                                    aria-hidden="true"
                                />

                                {/* title – top-left */}
                                <div className="absolute left-4 top-4 right-4">
                                    <div className="whitespace-pre-line text-xl font-bold tracking-tight text-white drop-shadow">
                                        {String(data?.cta?.title ?? '').replace(/\\n/g, '\n')}
                                    </div>
                                </div>

                                {/* button – bottom-left */}
                                <div className="absolute bottom-4 left-4">
                                    <Link
                                        href={data.cta.button.href}
                                        onClick={onNavigate}
                                        className="fx86 inline-flex items-center gap-3 font-SofiaSans  rounded-full hover:bg-transparent bg-darkprimary px-5 py-2 font-semibold text-white hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
                                        style={{ "--fx86-base": "transparent" }}
                                    >
                                        {data.cta.button.label}
                                        <span className="inline-flex h-7 w-7 items-center justify-center">
                                            <ArrowRight />
                                        </span>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

/* =================== MOBILE OVERLAY (two-stage) =================== */
function MobileOverlay({ open, onClose, stage, setStage, onNavigate, brand = "somi" }) {
    const { getNavbarItems, getMenuBySlug, isLoading } = useWebsiteData();

    // lock scroll while open
    useEffect(() => {
        if (open) document.body.style.overflow = "hidden";
        else document.body.style.overflow = "";
        return () => (document.body.style.overflow = "");
    }, [open]);

    if (!open) return null;

    const navbarItems = getNavbarItems();
    const menuData = stage ? getMenuBySlug(stage) : null;

    const root = (
        <div className="p-5">
            {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex w-full items-center justify-between rounded-lg px-2 py-5">
                        <div className="h-6 w-32 rounded bg-gray-200 animate-pulse" />
                        <div className="h-6 w-6 rounded bg-gray-200 animate-pulse" />
                    </div>
                ))
            ) : (
                navbarItems.map(({ key: k, menu }) => (
                    <button
                        key={k}
                        onClick={() => setStage(k)}
                        className="flex w-full font-SofiaSans items-center justify-between rounded-lg px-2 py-5 text-left text-xl font-semibold"
                    >
                        <span>{menu.name}</span>
                        <ArrowRight />
                    </button>
                ))
            )}
        </div>
    );

    const detail = stage ? (
        <div className="py-3 pb-10 px-6 overflow-y-auto h-[calc(100vh-56px)]">
            {/* Back */}
            <button onClick={() => setStage(null)} className="mb-4 inline-flex items-center gap-2 text-sm font-semibold">
                <BackIcon /> Back
            </button>

            {isLoading ? (
                <div className="space-y-6">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="space-y-4">
                            <div className="h-4 w-32 rounded bg-gray-200 animate-pulse" />
                            <div className="space-y-2">
                                {Array.from({ length: 4 }).map((_, j) => (
                                    <div key={j} className="h-8 w-full rounded bg-gray-200 animate-pulse" />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            ) : menuData?.type === "categorized" ? (
                <>
                    {/* Direct Primary Care */}
                    <div className="text-sm font-semibold uppercase tracking-wide mb-4 text-darkprimary">Direct Primary Care</div>
                    <ul className="space-y-3 mb-8">
                        {menuData.categories[0]?.items.map((item) => (
                            <li key={item.label}>
                                <Link
                                    href={item.href}
                                    onClick={onNavigate}
                                    className="group relative flex w-full items-center justify-between gap-2 rounded-xl border-l-2 duration-100 ease-in-out border-secondary hover:border-l-4 hover:border-secondary px-3 py-2 text-sm font-medium text-secondary transition-colors hover:text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-300"
                                >
                                    {/* Label */}
                                    <span className="text-lg font-SofiaSans">
                                        {item.label}
                                    </span>

                                    {/* Animated underline (grows from left on hover) */}
                                    <span
                                        aria-hidden="true"
                                        className="pointer-events-none absolute inset-x-3 bottom-1.5 h-px origin-left scale-x-0 bg-gray-300 transition-transform duration-300 group-hover:scale-x-100motion-reduce:hidden"
                                    />
                                </Link>
                            </li>
                        ))}
                    </ul>

                    {/* Same-day Care */}
                    <div className="text-sm font-semibold uppercase tracking-wide mb-4 text-darkprimary">Same-day Care</div>
                    <ul className="space-y-3 mb-8">
                        {menuData.categories[1]?.items.map((item) => (
                            <li key={item.label}>
                                <Link
                                    href={item.href}
                                    onClick={onNavigate}
                                    className="group relative flex w-full items-center justify-between gap-2 rounded-xl border-l-2 duration-100 ease-in-out border-secondary hover:border-l-4 hover:border-secondary px-3 py-2 text-sm font-medium text-secondary transition-colors hover:text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-300"
                                >
                                    {/* Label */}
                                    <span className="text-lg font-SofiaSans">
                                        {item.label}
                                    </span>

                                    {/* Animated underline (grows from left on hover) */}
                                    <span
                                        aria-hidden="true"
                                        className="pointer-events-none absolute inset-x-3 bottom-1.5 h-px origin-left scale-x-0 bg-gray-300 transition-transform duration-300 group-hover:scale-x-100motion-reduce:hidden"
                                    />
                                </Link>
                            </li>
                        ))}
                    </ul>

                    {/* Medication Refill */}
                    <div className="text-sm font-semibold uppercase tracking-wide mb-4 text-darkprimary">Medication Refill</div>
                    <ul className="space-y-3">
                        {menuData.categories[2]?.items.map((item) => (
                            <li key={item.label}>
                                <Link
                                    href={item.href}
                                    onClick={onNavigate}
                                    className="group relative flex w-full items-center justify-between gap-2 rounded-xl border-l-2 duration-100 ease-in-out border-secondary hover:border-l-4 hover:border-secondary px-3 py-2 text-sm font-medium text-secondary transition-colors hover:text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-300"
                                >
                                    {/* Label */}
                                    <span className="text-lg font-SofiaSans">
                                        {item.label}
                                    </span>
                                    {/* Animated underline (grows from left on hover) */}
                                    <span
                                        aria-hidden="true"
                                        className="pointer-events-none absolute inset-x-3 bottom-1.5 h-px origin-left scale-x-0 bg-gray-300 transition-transform duration-300 group-hover:scale-x-100motion-reduce:hidden"
                                    />
                                </Link>
                            </li>
                        ))}
                    </ul>
                    <div className="relative aspect-[16/11] mt-4 rounded-2xl overflow-hidden bg-gray-100">
                        <img src={menuData.cta?.img} alt="" className="h-full w-full object-cover" />

                        {/* subtle gradient to improve readability */}
                        <div
                            className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/40 via-black/10 to-black/60"
                            aria-hidden="true"
                        />

                        {/* title – top-left */}
                        <div className="absolute left-4 top-4 right-4">
                            <div className="whitespace-pre-line text-xl font-SofiaSans font-bold tracking-tight text-white drop-shadow">
                                {String(menuData?.cta?.title ?? '').replace(/\\n/g, '\n')}
                            </div>
                        </div>

                        {/* button – bottom-left */}
                        <div className="absolute bottom-4 left-4">
                            <Link
                                href={menuData.cta?.button?.href}
                                onClick={onNavigate}
                                className="fx86 inline-flex items-center font-SofiaSans gap-3 rounded-full hover:bg-transparent bg-secondary px-5 py-2 font-semibold text-white hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
                                style={{ "--fx86-base": "transparent" }}
                            >
                                {menuData.cta?.button?.label}
                                <span className="inline-flex h-7 w-7 items-center justify-center">
                                    <ArrowRight />
                                </span>
                            </Link>
                        </div>
                    </div>
                </>
            ) : (
                <>
                    {/* Discover Pill */}
                    <div className="text-sm font-semibold uppercase tracking-wide mb-4 text-darkprimary">Discover</div>
                    <Link
                        href={menuData.discover?.href}
                        onClick={onNavigate}
                        className="fx86 inline-flex w-full items-center font-SofiaSans justify-between border border-darkprimary rounded-3xl bg-transparent text-darkprimary px-5 py-2 text-base font-semibold shadow-sm md:w-auto"
                        style={{ "--fx86-base": "transparent", "--fx86-glow": "#364c781d" }}
                    >
                        {menuData.discover?.label}
                        <span className="ml-3 inline-flex h-8 w-8 items-center justify-center">
                            <ArrowRight />
                        </span>
                    </Link>
                    <Link
                        href={"/underdevelopmentmainpage/healthcoach"}
                        onClick={onNavigate}
                        className="fx86 inline-flex mt-4 font-SofiaSans w-full items-center justify-between border border-darkprimary rounded-3xl bg-transparent text-darkprimary px-5 py-2 text-base font-semibold shadow-sm md:w-auto"
                        style={{ "--fx86-base": "transparent", "--fx86-glow": "#364c781d" }}
                    >
                        Health Coach
                        <span className="ml-3 inline-flex h-8 w-8 items-center justify-center">
                            <ArrowRight />
                        </span>
                    </Link>

                    {
                        menuData.discover?.label === "Weight Loss" && (
                            <>
                                <div className="text-sm font-semibold uppercase tracking-wide mt-4 text-darkprimary">Existing Patients</div>
                                <Link
                                    href={"/refills"}
                                    onClick={onNavigate}
                                    className="fx86 inline-flex mt-4 font-SofiaSans w-full items-center justify-between border border-darkprimary rounded-3xl bg-transparent text-darkprimary px-5 py-2 text-base font-semibold shadow-sm md:w-auto"
                                    style={{ "--fx86-base": "transparent", "--fx86-glow": "#364c781d" }}
                                >
                                    Refills
                                    <span className="ml-3 inline-flex h-8 w-8 items-center justify-center">
                                        <ArrowRight />
                                    </span>
                                </Link>
                            </>
                        )
                    }
                    {/* Treatments */}
                    <div className="mt-8 text-sm font-semibold uppercase tracking-wide text-darkprimary">Treatments</div>
                    <ul className="mt-4 space-y-6">
                        {menuData.treatments?.map((t) => (
                            <li key={t.label} className="flex items-center gap-4">
                                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gray-100">
                                    <img src={t.img} alt="" className="h-12 w-12 object-contain" />
                                </div>
                                <Link href={t.href} onClick={onNavigate} className="flex items-center gap-3 font-SofiaSans text-lg font-medium">
                                    <span>{t.label}</span>
                                    {t.badge && (
                                        <span className="rounded-full bg-darkprimary px-2 py-0.5 text-xs font-semibold text-white">NEW</span>
                                    )}
                                </Link>
                            </li>
                        ))}
                    </ul>

                    {/* CTA */}
                    <div className="mt-8 text-sm font-semibold uppercase tracking-wide text-darkprimary">Get Started</div>
                    <div className="relative aspect-[16/11] mt-4 rounded-2xl overflow-hidden bg-gray-100">
                        <img src={menuData.cta?.img} alt="" className="h-full w-full object-cover" />

                        {/* subtle gradient to improve readability */}
                        <div
                            className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/40 via-black/10 to-black/60"
                            aria-hidden="true"
                        />

                        {/* title – top-left */}
                        <div className="absolute left-4 top-4 right-4">
                            <div className="whitespace-pre-line text-xl font-SofiaSans font-bold tracking-tight text-white drop-shadow">
                                {String(menuData?.cta?.title ?? '').replace(/\\n/g, '\n')}
                            </div>
                        </div>

                        {/* button – bottom-left */}
                        <div className="absolute bottom-4 left-4">
                            <Link
                                href={menuData.cta?.button?.href}
                                onClick={onNavigate}
                                className="fx86 inline-flex items-center font-SofiaSans gap-3 rounded-full hover:bg-transparent bg-secondary px-5 py-2 font-semibold text-white hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
                                style={{ "--fx86-base": "transparent" }}
                            >
                                {menuData.cta?.button?.label}
                                <span className="inline-flex h-7 w-7 items-center justify-center">
                                    <ArrowRight />
                                </span>
                            </Link>
                        </div>
                    </div>
                </>
            )}

        </div>
    ) : null;

    return (
        <div className="fixed inset-0 z-[60] bg-white">
            {/* Top bar inside overlay */}
            <div className="flex items-center justify-between px-4 py-3 md:px-6">
                <button onClick={onClose} aria-label="Close menu" className="p-2">
                    <CloseIcon />
                </button>
                <span className="text-5xl text-secondary font-bold font-tagesschrift tracking-tight">{brand}</span>
                {/* right icons (placeholders to match screenshot) */}
                <div className="flex items-center gap-4">
                    <Link href="/getstarted">
                        <Sparkles />
                    </Link>
                    <Link href="/underdevelopmentmainpage/login">
                        <User />
                    </Link>
                </div>
            </div>

            {/* Sliding stages */}
            <div className="relative h-[calc(100vh-56px)] overflow-hidden">
                <div
                    className={`absolute inset-0 transform transition-transform duration-300 ${stage ? "-translate-x-full" : "translate-x-0"
                        }`}
                >
                    {root}
                </div>
                <div
                    className={`absolute inset-0 transform transition-transform duration-300 ${stage ? "translate-x-0" : "translate-x-full"
                        }`}
                >
                    {detail}
                </div>
            </div>
        </div>
    );
}

/* =================== NAVBAR (white bar) =================== */
export default function Navbar({ brand = "somi" }) {
    const { getNavbarItems, isLoading } = useWebsiteData();
    const [openMenu, setOpenMenu] = useState(null); // desktop
    const [mobileOpen, setMobileOpen] = useState(false);
    const [mobileStage, setMobileStage] = useState(null); // null | key
    const wrapperRef = useRef(null);

    // close desktop panel on outside/Esc
    useEffect(() => {
        function onDocClick(e) {
            if (!wrapperRef.current) return;
            if (!wrapperRef.current.contains(e.target)) setOpenMenu(null);
        }
        function onKey(e) {
            if (e.key === "Escape") {
                setOpenMenu(null);
                setMobileOpen(false);
                setMobileStage(null);
            }
        }
        document.addEventListener("mousedown", onDocClick);
        document.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("mousedown", onDocClick);
            document.removeEventListener("keydown", onKey);
        };
    }, []);

    const navbarItems = getNavbarItems();

    if (isLoading) {
        return <NavbarSkeleton />;
    }

    return (
        <header className="sticky top-0 z-50 bg-white">
            {/* White top bar */}
            <div ref={wrapperRef} className="relative border-b">
                <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6">
                    {/* Left: Hamburger (mobile) */}
                    <button
                        className="inline-flex items-center gap-2 rounded-md p-2 md:hidden"
                        onClick={() => {
                            setMobileOpen(true);
                            setMobileStage(null);
                        }}
                        aria-label="Open menu"
                    >
                        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
                            <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" />
                        </svg>
                    </button>

                    {/* Brand centered on mobile, left on desktop */}
                    <Link href="/underdevelopmentmainpage" className="text-5xl text-secondary font-bold font-tagesschrift tracking-tight md:order-none">
                        {brand}
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden items-center gap-2 md:flex">
                        {navbarItems.map(({ key, menu }) => {
                            const isOpen = openMenu === key;
                            return (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() => setOpenMenu(isOpen ? null : key)}
                                    className={`flex items-center gap-1 rounded-full px-4 py-2 text-sm font-semibold transition
                    ${isOpen ? "text-darkprimary" : "text-gray-900 hover:bg-gray-100"}`}
                                    aria-expanded={isOpen}
                                >
                                    {menu.name}
                                    <Chevron open={isOpen} />
                                </button>
                            );
                        })}
                    </div>

                    {/* Right actions (desktop) */}
                    <div className="hidden items-center gap-3 md:flex">
                        <Link
                            href="/getstarted"
                            className="fx-primary rounded-full font-SofiaSans bg-darkprimary px-5 py-2 text-sm font-semibold text-white hover:opacity-100"
                        >
                            Get Started
                        </Link>


                        <Link
                            href="/underdevelopmentmainpage/login"
                            className="fx-outline rounded-full font-SofiaSans border border-gray-300 px-5 py-2 text-sm font-semibold text-gray-900 hover:border-transparent"
                            style={{ "--fx-fill": "var(--tw-bg-secondary, #16a34a)" }}  // set fill color; or use a hex
                        >
                            Login
                        </Link>
                    </div>

                    {/* Right icons (mobile, for visual parity) */}
                    <div className="flex items-center gap-4 md:hidden">
                        <Link href="/getstarted">
                            <Sparkles />
                        </Link>
                        <Link href="/underdevelopmentmainpage/login">
                            <User />
                        </Link>
                    </div>
                </nav>

                {/* Desktop mega panel */}
                {openMenu && (
                    <div className="absolute left-0 right-0 top-full">
                        <MegaPanel menuKey={openMenu} onNavigate={() => setOpenMenu(null)} />
                    </div>
                )}
            </div>

            {/* Mobile full‑screen overlay */}
            <MobileOverlay
                open={mobileOpen}
                onClose={() => {
                    setMobileOpen(false);
                    setMobileStage(null);
                }}
                stage={mobileStage}
                setStage={setMobileStage}
                onNavigate={() => {
                    setMobileOpen(false);
                    setMobileStage(null);
                }}
                brand={brand}
            />
        </header>
    );
}
