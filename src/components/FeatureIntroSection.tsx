import { siteContent } from "@/config/site-content";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Check } from "lucide-react";
import { useUtmTracking } from "@/hooks/useUtmTracking";

const FeatureIntroSection = () => {
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
    <section className="py-12 px-6 bg-background grid gap-10">
      <div className="max-w-6xl mx-auto w-full">
        <div className="max-w-xl space-y-6">
          {/* Headline */}
          <h1 className="text-[42px] md:text-6xl font-bold text-foreground leading-tight text-left md:text-left">
            {siteContent.featureIntro.title}
          </h1>
          
          {/* Supporting Paragraph */}
          <p className="text-lg md:text-xl text-black font-light leading-relaxed text-left md:text-left">
            {siteContent.featureIntro.description}
          </p>
        </div>
      </div>
      {/* CTA Button Section - Full Width */}
      <div className="max-w-7xl mx-auto space-y-3 text-center md:hidden">
        <Button 
          onClick={handleSignupClick}
          className="px-6 py-2 text-sm font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
        >
          {siteContent.headline.buttonText}<span className="font-light">{siteContent.headline.buttonTextLight}</span>
        </Button>
        <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
          <Check size={14} className="text-primary" />
          {siteContent.headline.disclaimer}
        </p>
      </div>
    </section>
  );
};

export default FeatureIntroSection;