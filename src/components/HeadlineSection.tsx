import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Check } from "lucide-react";
import { siteContent } from "@/config/site-content";
import BenefitsSection from "@/components/BenefitsSection";
import { useUtmTracking } from "@/hooks/useUtmTracking";

const HeadlineSection = () => {
  const { navigateWithUtm } = useUtmTracking();
   const handleSignupClick = () => {
    try {
      // GA4 recommended event
       window.gtag?.('event', 'sign_up', {
        method: 'cta_button',
        button_id: 'signup-btn',
        button_text: 'Start Free Trial',
        page_location: window.location.href,
      });
    } catch (e) {
      // no-op if gtag not available
    }

    // then navigate (SPA)
    navigateWithUtm('/signup');
  };
  return (
    <section className="min-h-[80vh] bg-white flex items-center justify-center px-5 md:px-[125px] py-5">
      <div className="max-w-4xl mx-auto text-center flex flex-col md:space-y-8 animate-fade-in">
        <div className="space-y-6 mt-32 sm:mt-32 order-1">
          <h1 className="text-[42px] md:text-6xl font-bold text-foreground leading-tight tracking-tight px-0">
            {siteContent.headline.title}<span className="text-primary">{siteContent.headline.titleHighlight}</span>
          </h1>
          
          <h2 style={{ color: '#191918', fontSize: '20px', fontWeight: '300' }} className="mx-auto leading-relaxed px-0">
            {siteContent.headline.subtitle}
          </h2>
        </div>

        <div className="py-8 space-y-3 !mt-0 order-2 md:order-3">
           <Button 
                onClick={() => handleSignupClick()}
                className="px-6 py-2 text-sm font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
               >
                 {siteContent.headline.buttonText} - <span className="font-light">for 12 months</span>
               </Button>
          <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
            <Check size={14} className="text-primary" />
            {siteContent.headline.disclaimer}
          </p>
        </div>

        <div className="pb-4 order-3 md:order-2">
          <BenefitsSection />
        </div>
      </div>
    </section>
  );
};

export default HeadlineSection;