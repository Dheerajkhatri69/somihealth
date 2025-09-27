'use client';

import { useEffect, useState } from "react";
import Navbar from "@/components/hero/Navbar";
import SubHero from "@/components/GeneralHealth/subHero";
import Steps from "@/components/GeneralHealth/steps";
import Treatment from "@/components/GeneralHealth/Treatment";
import MultiComponent from "@/components/GeneralHealth/MultiComponent";
import ClientVideoReviews from "@/components/hero/ReviewVideoCard";
import CompoundedExplainer from "@/components/hero/compounded-glp1";
import HowItWorksGnz from "@/components/hero/HowItworks";
import { TabsDemo } from "@/components/hero/Results";
import FaqPro from "@/components/hero/Faq";
import SomiFooter from "@/components/hero/SomiFooter";

function SkeletonBlock() {
    return (
        <div className="max-w-6xl mx-auto py-10 animate-pulse space-y-6">
            <div className="h-6 w-1/4 bg-gray-200 rounded" />
            <div className="h-8 w-2/3 bg-gray-200 rounded" />
            <div className="h-48 bg-gray-200 rounded" />
        </div>
    );
}

export default function GeneralHealthPage({ params }) {
    const slug = params["general-health"];
    const [entry, setEntry] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch(`/api/gh-entries/${slug}`, { cache: "no-store" });
                const data = await res.json();
                if (data?.success) setEntry(data.result);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        })();
    }, [slug]);

    const ctx = entry?.context;

    return (
        <>
            <Navbar />
            <main className="px-4 md:px-6">
                {loading && (
                    <>
                        <SkeletonBlock />
                        <SkeletonBlock />
                        <SkeletonBlock />
                    </>
                )}
                {!loading && !entry && (
                    <div className="max-w-6xl mx-auto py-20 text-center">
                        <h1 className="text-2xl font-bold">Content not found</h1>
                        <p>No content is available for “{slug}”.</p>
                    </div>
                )}
                {!loading && entry && (
                    <>
                        <SubHero content={ctx?.subHero} />
                        <Steps content={ctx?.steps} />
                        <Treatment content={ctx?.treatment} />
                        <MultiComponent content={ctx?.sections} />
                    </>
                )}
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
