// app/[productType]/[product]/page.jsx
'use client';

import { useWebsiteData } from "@/contexts/WebsiteDataContext";
import ProductHero from "@/components/ProductHero";
import HowItWorks from "@/components/HowItWorks";
import { notFound } from "next/navigation";
import ClientVideoReviews from "@/components/hero/ReviewVideoCard";
import CompoundedExplainer from "@/components/hero/compounded-glp1";
import HowItWorksGnz from "@/components/hero/HowItworks";
import FaqPro from "@/components/hero/Faq";
import SomiFooter from "@/components/hero/SomiFooter";
import Navbar from "@/components/hero/Navbar";
import { LoadingPage, PageLoadingSkeleton } from "@/components/LoadingSkeleton";
import ProductDetails from "@/components/productDetails";
import FeatureBanner from "@/components/FeatureBanner";

export default function ProductPage({ params }) {
  const { productType, product } = params;
  const { getProduct, isLoading, error } = useWebsiteData();

  const productData = getProduct(productType, product);

  if (!isLoading && !productData) return notFound();

  return (
    <LoadingPage isLoading={isLoading} fallback={<PageLoadingSkeleton />}>
      <FeatureBanner queryKey="global" />
      <Navbar />
      <main className="px-4 md:px-6">
        <div className="mx-auto max-w-6xl py-12 md:py-16 space-y-16">
          {productData && (
            <>
              <ProductHero product={productData} />
              <HowItWorks content={productData.howItWorksSection} />
              <ProductDetails content={productData.productDetails} />
            </>
          )}
        </div>
      </main>
      {!["erectile-dysfunction", "skin-hair"].includes((productType || "").trim()) && (
        <ClientVideoReviews />
      )}
      <CompoundedExplainer />
      <HowItWorksGnz />
      <FaqPro />
      <SomiFooter />
    </LoadingPage>
  );
}
