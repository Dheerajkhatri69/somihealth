// app/[productType]/page.jsx
'use client';

import { useWebsiteData } from "@/contexts/WebsiteDataContext";
import SectionHeader from "@/components/SectionHeader";
import ProductCard from "@/components/ProductCard";
import { notFound } from "next/navigation";
import ClientVideoReviews from "@/components/hero/ReviewVideoCard";
import CompoundedExplainer from "@/components/hero/compounded-glp1";
import HowItWorksGnz from "@/components/hero/HowItworks";
import { TabsDemo } from "@/components/hero/Results";
import FaqPro from "@/components/hero/Faq";
import SomiFooter from "@/components/hero/SomiFooter";
import Navbar from "@/components/hero/Navbar";
import { LoadingPage, PageLoadingSkeleton } from "@/components/LoadingSkeleton";
import ProTypeHero from "@/components/hero/proTypeHero";
import ExpectSection from "@/components/hero/ExpectSection";
import Banner from "@/components/hero/banner";

export default function ProductTypePage({ params }) {
    const { productType } = params;
    const { getMenuBySlug, isLoading, error } = useWebsiteData();

    const menu = getMenuBySlug(productType);

    if (!isLoading && !menu) return notFound();

    // Headline logic (adjust per category if you want)
    const title = menu ? `${menu.discover?.label || menu.name}` : "Loading...";

    return (
        <LoadingPage isLoading={isLoading} fallback={<PageLoadingSkeleton />}>
            <Navbar />
            <main className="px-4 md:px-6 watermark"
                data-text="somi"
                style={{
                    '--wm-size': '250px',     // text size
                    '--wm-stroke-c': '#364c781d',                   // outline color
                    '--wm-stroke-w': '2px',                       // outline width
                    '--wm-fill': 'transparent',                   // set e.g. 'rgba(0,0,0,.06)' for filled text
                    '--wm-font': '"Sofia Sans", ui-sans-serif',      // font family
                    '--wm-weight': 700,                           // font weight
                    '--wm-tracking': '0em',                    // letter spacing
                    '--wm-opacity': 1,                         // overall opacity
                    '--wm-left': '-10rem',                         // horizontal offset
                    '--wm-rotate': '90deg',                       // rotate; use '0deg' for horizontal
                }}
            >
                <div className="mx-auto max-w-6xl font-SofiaSans ">
                    <ProTypeHero content={{
                        eyebrow: menu?.proTypeHero?.eyebrow || '',
                        headingLine1: menu?.proTypeHero?.headingLine1 || '',
                        lines: Array.isArray(menu?.proTypeHero?.lines) ? menu.proTypeHero.lines : [],
                        body: menu?.proTypeHero?.body || '',
                        ctaText: menu?.proTypeHero?.ctaText || 'Get started',
                        heroImage: menu?.proTypeHero?.heroImage || '',
                        heroAlt: menu?.proTypeHero?.heroAlt || 'Hero image',
                        disclaimer: menu?.proTypeHero?.disclaimer || '',
                    }} />
                    {menu?.type === "categorized" ? (
                        <div className="mt-10 space-y-12 md:mt-14">
                            {menu.categories?.map((category, index) => (
                                <div key={index}>
                                    <h2 className="text-2xl font-bold text-darkprimary mb-6">{category.title}</h2>
                                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                        {category.items?.map((item) => (
                                            <ProductCard
                                                key={item.href}
                                                item={item}
                                                ctaHref={menu.cta?.button?.href || "#"}
                                                isLink={item.isLink}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="mt-10 grid gap-6 md:mt-14 md:grid-cols-3">
                            {menu?.treatments?.map((item) => (
                                <ProductCard key={item.href} item={item} ctaHref={menu.cta?.button?.href || "#"} />
                            ))}
                        </div>
                    )}
                    <ExpectSection content={{
                        title: menu?.expectSection?.title || '',
                        image: menu?.expectSection?.image,
                        items: (menu?.expectSection?.items || []).map(it => ({ heading: it.heading || it.title, description: it.description })),
                    }} />
                    <Banner content={{
                        image: { src: menu?.banner?.image?.src || '', alt: menu?.banner?.image?.alt || '' },
                        headline: { line1: menu?.banner?.headline?.line1 || '', line2: menu?.banner?.headline?.line2 || '' },
                        cta: { text: menu?.banner?.cta?.text || 'Get started', href: menu?.banner?.cta?.href || '#' },
                        footnote: menu?.banner?.footnote || ''
                    }} />
                </div>
            </main>
            <ClientVideoReviews />
            <CompoundedExplainer />
            <HowItWorksGnz />
            <TabsDemo />
            <FaqPro />
            <SomiFooter />
        </LoadingPage>
    );
}
