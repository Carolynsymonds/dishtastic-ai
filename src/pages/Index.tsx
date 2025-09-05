import Header from "@/components/Header";
import HeadlineSection from "@/components/HeadlineSection";
import FeaturesSection from "@/components/FeaturesSection";
import TeamRolesSection from "@/components/TeamRolesSection";
import FeatureIntroSection from "@/components/FeatureIntroSection";
import SplitScreenSection from "@/components/SplitScreenSection";
import AllFeaturesSection from "@/components/AllFeaturesSection";
import HeroBanner from "@/components/HeroBanner";
import Footer from "@/components/Footer";
import { useUtmTracking } from "@/hooks/useUtmTracking";

const Index = () => {
  // Initialize UTM tracking to capture parameters from URL
  useUtmTracking();
  return (
    <div className="bg-white min-h-screen">
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