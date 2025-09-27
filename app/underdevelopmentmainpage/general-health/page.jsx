'use client';

import { useEffect, useState } from 'react';

import ClientVideoReviews from "@/components/hero/ReviewVideoCard";
import CompoundedExplainer from "@/components/hero/compounded-glp1";
import HowItWorksGnz from "@/components/hero/HowItworks";
import { TabsDemo } from "@/components/hero/Results";
import FaqPro from "@/components/hero/Faq";
import SomiFooter from "@/components/hero/SomiFooter";
import Navbar from "@/components/hero/Navbar";
import PrimaryCareHero from "@/components/GeneralHealth/HeroGH";
import PartnerWithDoctor from "@/components/GeneralHealth/partnerWithDoctor";
import PrimaryCareFeatures from "@/components/GeneralHealth/primaryCareFeatures";

function SkeletonSection() {
  return (
    <div className="max-w-6xl mx-auto py-12 animate-pulse space-y-8">
      {/* Title */}
      <div className="h-8 w-1/3 bg-gray-200 rounded" />
      {/* Subtitle */}
      <div className="h-4 w-2/3 bg-gray-200 rounded" />
      {/* Image or content */}
      <div className="h-64 bg-gray-200 rounded" />
    </div>
  );
}

export default function GeneralHealthPage() {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { 
    (async () => {
      try {
        const res = await fetch('/api/gh-content', { cache: 'no-store' });
        const data = await res.json();
        if (data?.success) setContent(data.result);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })(); 
  }, []);

  return (
    <>
      <Navbar />
      <main
        className="px-4 md:px-6 watermark"
        data-text="somi"
        style={{
          '--wm-size': '250px',
          '--wm-stroke-c': '#364c781d',
          '--wm-stroke-w': '2px',
          '--wm-fill': 'transparent',
          '--wm-font': '"Sofia Sans", ui-sans-serif',
          '--wm-weight': 700,
          '--wm-tracking': '0em',
          '--wm-opacity': 1,
          '--wm-left': '-10rem',
          '--wm-rotate': '90deg',
        }}
      >
        {loading ? (
          <>
            <SkeletonSection />
            <SkeletonSection />
            <SkeletonSection />
          </>
        ) : (
          <>
            <PrimaryCareHero content={content?.hero} />
            <PartnerWithDoctor content={content?.partner} />
            <PrimaryCareFeatures content={content?.features} />
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
