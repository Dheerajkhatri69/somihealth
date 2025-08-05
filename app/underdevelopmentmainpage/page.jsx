import BMICalculator from "@/components/hero/BMICalculator";
import CategoriesGrid from "@/components/hero/CategoriesGrid";
import CompoundedExplainer from "@/components/hero/compounded-glp1";
import Faq from "@/components/hero/Faq";
import Hero from "@/components/hero/Hero";
import HowItWorksGnz from "@/components/hero/HowItworks";
import Navbar from "@/components/hero/Navbar";
import { TabsDemo } from "@/components/hero/Results";
import ClientVideoReviews from "@/components/hero/ReviewVideoCard";
import SomiFooter from "@/components/hero/SomiFooter";
import StoriesWithReviews from "@/components/hero/StoriesWithReviews";

export default async function Home() {

  return (
    <main >
      <Navbar />
      <Hero />
      <CategoriesGrid />
      <ClientVideoReviews />
      <StoriesWithReviews />
      <BMICalculator />
      <CompoundedExplainer />
      <HowItWorksGnz />
      <TabsDemo />
      <Faq />
      <SomiFooter />
    </main>
  );
}