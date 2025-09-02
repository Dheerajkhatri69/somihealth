// app/[productType]/page.jsx
import { getMenuBySlug } from "@/lib/menus";
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

export default function ProductTypePage({ params }) {
    const { productType } = params;
    const res = getMenuBySlug(productType);

    if (!res) return notFound();

    const { key, menu } = res;

    // Headline logic (adjust per category if you want)
    const title =
        key === "Weight Loss"
            ? "Science Backed GLP-1 Medications"
            : `${menu.discover.label} Treatments`;

    return (
        <>
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
                <div className="mx-auto max-w-6xl py-12 font-SofiaSans md:py-16">
                    <SectionHeader title={title} />

                    {menu.type === "categorized" ? (
                        <div className="mt-10 space-y-12 md:mt-14">
                            {menu.categories.map((category, index) => (
                                <div key={index}>
                                    <h2 className="text-2xl font-bold text-darkprimary mb-6">{category.title}</h2>
                                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                        {category.items.map((item) => (
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
                            {menu.treatments.map((item) => (
                                <ProductCard key={item.href} item={item} ctaHref={menu.cta?.button?.href || "#"} />
                            ))}
                        </div>
                    )}
                </div>
            </main>
            <ClientVideoReviews />
            <CompoundedExplainer />
            <HowItWorksGnz />
            <TabsDemo />
            <FaqPro />
            <SomiFooter />
        </>

    );
}
