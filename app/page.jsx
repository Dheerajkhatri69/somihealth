import FeatureBanner from "@/components/FeatureBanner";
import CategoriesGrid from "@/components/hero/CategoriesGrid";
import Faq from "@/components/hero/Faq";
import Hero from "@/components/hero/Hero";
import HowItWorksGnz from "@/components/hero/HowItworks";
import Navbar from "@/components/hero/Navbar";
import { TabsDemo } from "@/components/hero/Results";
import ClientVideoReviews from "@/components/hero/ReviewVideoCard";
import SomiFooter from "@/components/hero/SomiFooter";
import StoriesWithReviews from "@/components/hero/StoriesWithReviews";
import WeightLossPlans from "@/components/hero/WeightLossPlans";

export default async function Home() {

  return (
    <main>
      <FeatureBanner queryKey="global" />
      <Navbar />
      <Hero />
      <CategoriesGrid />
      <WeightLossPlans />
      <ClientVideoReviews />
      <StoriesWithReviews />
      <HowItWorksGnz />
      <TabsDemo />
      <Faq />
      <SomiFooter />
    </main>
  );
}