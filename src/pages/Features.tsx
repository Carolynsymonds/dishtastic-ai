import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Check } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { siteContent } from "@/config/site-content";

import AISmartToolsSection from "@/components/AISmartToolsSection";
import ToolIntegrationsSection from "@/components/ToolIntegrationsSection";
import BenefitsSection from "@/components/BenefitsSection";

const Features = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="min-h-[80vh] bg-white flex flex-col justify-between md:px-[125px] md:py-16 p-6 gap-10">
        <div className="flex-1 flex items-center justify-center mt-24">
          <div className="max-w-4xl mx-auto text-center space-y-6 animate-fade-in">
            <div className="space-y-4">
              <h1 className="text-[42px] md:text-6xl font-bold text-foreground leading-tight tracking-tight">
                {siteContent.featuresPage.title}
              </h1>
              
              <h2 style={{ color: '#191918', fontSize: '20px', fontWeight: '300' }} className="mx-auto leading-relaxed">
                {siteContent.featuresPage.subtitle}
              </h2>
            </div>         
          </div>
        </div>
        
        <div className="pb-8">
          <BenefitsSection />
        </div>
      </section>

      {/* Divider */}
      <div className="w-full"></div>
      
      <ToolIntegrationsSection />
      <AISmartToolsSection />

      <Footer />
    </div>
  );
};

export default Features;