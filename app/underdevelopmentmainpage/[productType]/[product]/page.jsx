// app/[productType]/[product]/page.jsx
import { getProduct } from "@/lib/products";
import ProductHero from "@/components/ProductHero";
import HowItWorks from "@/components/HowItWorks";
import BenefitsMosaic from "@/components/BenefitsMosaic";
import { notFound } from "next/navigation";
import ClientVideoReviews from "@/components/hero/ReviewVideoCard";
import CompoundedExplainer from "@/components/hero/compounded-glp1";
import HowItWorksGnz from "@/components/hero/HowItworks";
import { TabsDemo } from "@/components/hero/Results";
import FaqPro from "@/components/hero/Faq";
import SomiFooter from "@/components/hero/SomiFooter";
import Navbar from "@/components/hero/Navbar";

export default function ProductPage({ params }) {
  const { productType, product } = params;
  const productData = getProduct(productType, product);

  if (!productData) return notFound();

  return (
    <>
      <Navbar />
      <main className="px-4 md:px-6">
        <div className="mx-auto max-w-6xl py-12 md:py-16 space-y-16">
          <ProductHero product={productData} />
          <HowItWorks data={productData.howItWorks} />
          <BenefitsMosaic data={productData.benefits} />
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
