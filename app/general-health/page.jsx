'use client';

import { useEffect, useState } from 'react';
import FaqPro from "@/components/hero/Faq";
import SomiFooter from "@/components/hero/SomiFooter";
import Navbar from "@/components/hero/Navbar";
import PrimaryCareHero from "@/components/GeneralHealth/HeroGH";
import PartnerWithDoctor from "@/components/GeneralHealth/partnerWithDoctor";
import PrimaryCareFeatures from "@/components/GeneralHealth/primaryCareFeatures";
import GlowCompare from '@/components/GeneralHealth/ComparisonGrid';
import HealthPlans from '@/components/GeneralHealth/HealthPlans';

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
        className="px-4 md:px-6"
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
            {/* <GlowCompare {...content?.glowCompare} /> */}
            <HealthPlans {...content?.healthPlans} />
          </>
        )}
      </main>

      <FaqPro />
      <SomiFooter />
    </>
  );
}
