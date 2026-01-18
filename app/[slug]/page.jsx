'use client';

import { useCallback, useEffect, useState } from "react";
import { notFound } from "next/navigation";
import { useWebsiteData } from "@/contexts/WebsiteDataContext";

// Components
import Navbar from "@/components/hero/Navbar";
import SomiFooter from "@/components/hero/SomiFooter";
import ProductCard from "@/components/ProductCard";
import ClientVideoReviews from "@/components/hero/ReviewVideoCard";
import HowItWorksGnz from "@/components/hero/HowItworks";
import { TabsDemo } from "@/components/hero/Results";
import FaqPro from "@/components/hero/Faq";
import { LoadingPage, PageLoadingSkeleton } from "@/components/LoadingSkeleton";
import ProTypeHero from "@/components/hero/proTypeHero";
import ExpectSection from "@/components/hero/ExpectSection";
import Banner from "@/components/hero/banner";
import FeatureBanner from "@/components/FeatureBanner";
import { Skeleton } from "@/components/ui/skeleton";

// Helper function to enrich treatment data
function enrichTreatment(t, getProduct) {
    // Expect href like: /underdevelopmentmainpage/{category}/{slug}
    const parts = (t?.href || "").split("/").filter(Boolean); // ["underdevelopmentmainpage","{category}","{slug}"]
    const category = parts[1] || "";
    const slug = parts[2] || "";

    const p = category && slug ? getProduct(category, slug) : null;

    const primary = {
        label: p?.ctas?.primary?.label || "Get Started",
        href: p?.ctas?.primary?.href || "/pricing",
    };
    const secondary = {
        label: p?.ctas?.secondary?.label || "Learn More",
        href: p?.ctas?.secondary?.href || t?.href || "#",
    };
    const plansNote = p?.plansNote || "";

    // Optional: compute a "Starting at" line from product price/unit if you want to show it
    const startingAt = (p?.price && p?.unit) ? `$${p.price} ${p.unit}` : t?.startingAt;

    return {
        ...t,
        primary,
        secondary,
        plansNote,
        startingAt,
    };
}

// Footer Component: Block Renderer
function Block({ block }) {
    switch (block.type) {
        case "heading":
            return (
                <h1 className="text-3xl text-secondary my-4 font-SofiaSans font-bold">
                    {block.text}
                </h1>
            );

        case "subheading":
            return (
                <h2 className="mt-6 text-xl font-SofiaSans font-semibold">
                    {block.text}
                </h2>
            );

        case "paragraph": {
            const html = block.text.replace(
                /\*\*(.+?)\*\*/g,
                (_, boldText) => `<strong>${boldText}</strong>`
            );
            return (
                <p
                    className="mt-4 leading-relaxed text-gray-500 font-SofiaSans"
                    dangerouslySetInnerHTML={{ __html: html }}
                />
            );
        }

        case "list":
            return (
                <ul className="mt-4 list-disc space-y-1 pl-6 text-gray-500 font-SofiaSans">
                    {block.items?.map((item, i) => (
                        <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
                    ))}
                </ul>
            );

        default:
            return null;
    }
}

// Footer Skeleton Component
function FooterSkeleton() {
    return (
        <div className="mx-auto max-w-7xl px-4 py-12 space-y-6">
            <Skeleton className="h-8 w-1/3" />
            <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/6" />
            </div>
            <Skeleton className="h-6 w-1/4 mt-10" />
            <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/6" />
                <Skeleton className="h-4 w-3/6" />
            </div>
            <div className="mt-6 space-y-2 pl-6">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/3" />
            </div>
        </div>
    );
}

export default function DynamicPage({ params }) {
    const { slug } = params;
    const { getMenuBySlug, getProduct, isLoading: isProductLoading } = useWebsiteData();

    // 1. Try to find a Product Menu
    const menu = getMenuBySlug(slug);

    // State for Footer Page (fallback)
    const [footerPage, setFooterPage] = useState(null);
    const [footerLoading, setFooterLoading] = useState(true);
    const [triedFooter, setTriedFooter] = useState(false);

    useEffect(() => {
        // If product data is loaded and NO menu found, try fetching footer content
        if (!isProductLoading && !menu) {
            fetch(`/api/footer/${slug}`)
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        setFooterPage(data.result);
                    }
                })
                .catch(err => {
                    console.error("Error fetching footer/dynamic page content:", err);
                })
                .finally(() => {
                    setFooterLoading(false);
                    setTriedFooter(true);
                });
        }
    }, [isProductLoading, menu, slug]);

    // A. Loading State (Initial Product Check)
    if (isProductLoading) {
        return <PageLoadingSkeleton />;
    }

    // B. Product Page Found
    if (menu) {
        const title = menu ? `${menu.discover?.label || menu.name}` : "Loading...";

        // Build the list(s) that ProductCard will consume
        const categorized =
            menu?.type === "categorized"
                ? (menu.categories || []).map((cat) => ({
                    ...cat,
                    items: (cat.items || []).map(item => enrichTreatment(item, getProduct)),
                }))
                : null;

        const flatList =
            menu?.type !== "categorized"
                ? (menu?.treatments || []).map(item => enrichTreatment(item, getProduct))
                : null;

        return (
            <LoadingPage isLoading={isProductLoading} fallback={<PageLoadingSkeleton />}>
                <FeatureBanner queryKey="global" />
                <Navbar />
                <main className="px-4 md:px-6">
                    <div className="mx-auto max-w-6xl font-SofiaSans ">
                        <ProTypeHero
                            content={{
                                eyebrow: menu?.proTypeHero?.eyebrow || '',
                                headingLine1: menu?.proTypeHero?.headingLine1 || '',
                                lines: Array.isArray(menu?.proTypeHero?.lines) ? menu.proTypeHero.lines : [],
                                body: menu?.proTypeHero?.body || '',
                                ctaText: menu?.proTypeHero?.ctaText || 'Get started',
                                heroImage: menu?.proTypeHero?.heroImage || '',
                                heroAlt: menu?.proTypeHero?.heroAlt || 'Hero image',
                                disclaimer: menu?.proTypeHero?.disclaimer || '',
                            }}
                        />

                        {menu?.type === "categorized" ? (
                            <div className="mt-10 space-y-12 md:mt-14">
                                {categorized?.map((category, index) => (
                                    <div key={index}>
                                        <h2 className="text-2xl font-bold text-darkprimary mb-6">
                                            {category.title}
                                        </h2>
                                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                            {category.items?.map((item) => (
                                                <ProductCard
                                                    key={item.href}
                                                    item={item}
                                                    isLink={item.isLink}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="mt-10 grid gap-6 md:mt-14 md:grid-cols-3">
                                {flatList?.map((item) => (
                                    <ProductCard key={item.href} item={item} />
                                ))}
                            </div>
                        )}

                        <ExpectSection
                            content={{
                                title: menu?.expectSection?.title || '',
                                image: menu?.expectSection?.image,
                                items: (menu?.expectSection?.items || []).map((it) => ({
                                    heading: it.heading || it.title,
                                    description: it.description,
                                })),
                            }}
                        />

                        <Banner
                            content={{
                                image: {
                                    src: menu?.banner?.image?.src || '',
                                    alt: menu?.banner?.image?.alt || '',
                                },
                                headline: {
                                    line1: menu?.banner?.headline?.line1 || '',
                                    line2: menu?.banner?.headline?.line2 || '',
                                },
                                cta: {
                                    text: menu?.banner?.cta?.text || 'Get started',
                                    href: menu?.banner?.cta?.href || '#',
                                },
                                footnote: menu?.banner?.footnote || '',
                            }}
                        />
                    </div>
                </main>

                {!["Erectile Dysfunction", "Skin+Hair"].includes((title || "").trim()) && (
                    <ClientVideoReviews />
                )}
                <HowItWorksGnz />
                {title === "Weight Loss" ? <></> : <TabsDemo />}
                <FaqPro />
                <SomiFooter />
            </LoadingPage>
        );
    }

    // C. Footer Page / Generic Page Check
    if (!triedFooter || footerLoading) {
        return (
            <>
                <Navbar />
                <FooterSkeleton />
                <SomiFooter />
            </>
        );
    }

    if (footerPage) {
        return (
            <>
                <Navbar />
                <main className="mx-auto max-w-7xl px-4 py-12">
                    {footerPage.blocks?.map((block, i) => (
                        <Block key={i} block={block} />
                    ))}
                </main>
                <SomiFooter />
            </>
        );
    }

    // D. Not Found
    return notFound();
}
