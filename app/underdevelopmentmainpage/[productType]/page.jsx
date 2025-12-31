// app/[productType]/page.jsx
'use client';

import { useWebsiteData } from "@/contexts/WebsiteDataContext";
import ProductCard from "@/components/ProductCard";
import { notFound } from "next/navigation";
import ClientVideoReviews from "@/components/hero/ReviewVideoCard";
import HowItWorksGnz from "@/components/hero/HowItworks";
import { TabsDemo } from "@/components/hero/Results";
import FaqPro from "@/components/hero/Faq";
import SomiFooter from "@/components/hero/SomiFooter";
import Navbar from "@/components/hero/Navbar";
import { LoadingPage, PageLoadingSkeleton } from "@/components/LoadingSkeleton";
import ProTypeHero from "@/components/hero/proTypeHero";
import ExpectSection from "@/components/hero/ExpectSection";
import Banner from "@/components/hero/banner";
import FeatureBanner from "@/components/FeatureBanner";

export default function ProductTypePage({ params }) {
    const { productType } = params;
    const { getMenuBySlug, getProduct, isLoading, error } = useWebsiteData();

    const menu = getMenuBySlug(productType);

    if (!isLoading && !menu) return notFound();

    const title = menu ? `${menu.discover?.label || menu.name}` : "Loading...";

    // ---- Enrich a menu treatment with product CTAs & plansNote from DB ----
    function enrichTreatment(t) {
        // Expect href like: /underdevelopmentmainpage/{category}/{slug}
        const parts = (t?.href || "").split("/").filter(Boolean); // ["underdevelopmentmainpage","{category}","{slug}"]
        const category = parts[1] || "";
        const slug = parts[2] || "";

        const p = category && slug ? getProduct(category, slug) : null;

        const primary = {
            label: p?.ctas?.primary?.label || "Get Started",
            href: p?.ctas?.primary?.href || "/getstarted",
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

    // Build the list(s) that ProductCard will consume
    const categorized =
        menu?.type === "categorized"
            ? (menu.categories || []).map((cat) => ({
                ...cat,
                items: (cat.items || []).map(enrichTreatment),
            }))
            : null;

    const flatList =
        menu?.type !== "categorized"
            ? (menu?.treatments || []).map(enrichTreatment)
            : null;

    return (
        <LoadingPage isLoading={isLoading} fallback={<PageLoadingSkeleton />}>
            <FeatureBanner queryKey="global" />
            <Navbar />
            <main
                className="px-4 md:px-6"
            >
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
