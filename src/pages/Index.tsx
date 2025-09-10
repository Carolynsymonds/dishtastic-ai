import Header from "@/components/Header";
import HeadlineSection from "@/components/HeadlineSection";
import FeaturesSection from "@/components/FeaturesSection";
import TeamRolesSection from "@/components/TeamRolesSection";
import FeatureIntroSection from "@/components/FeatureIntroSection";
import SplitScreenSection from "@/components/SplitScreenSection";
import AllFeaturesSection from "@/components/AllFeaturesSection";
import HeroBanner from "@/components/HeroBanner";
import Footer from "@/components/Footer";
import { SecurityStatusBanner } from "@/components/SecurityStatusBanner";

const Index = () => {
  // UTM tracking is handled by App.tsx UtmTracker component
  return (
    <div className="bg-white min-h-screen">
      <SecurityStatusBanner />
      <Header />
      <HeadlineSection />
      <FeaturesSection />
      <TeamRolesSection />
      <FeatureIntroSection />
      <SplitScreenSection />
      <AllFeaturesSection />
      <Footer />
    </div>
  );
};

export default Index;