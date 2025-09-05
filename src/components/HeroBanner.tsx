import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Check } from "lucide-react";
import { siteContent } from "@/config/site-content";
import { useUtmTracking } from "@/hooks/useUtmTracking";

const HeroBanner = () => {
  const { navigateWithUtm } = useUtmTracking();
  const handleSignupClick = () => {

    console.log("sending gtag")
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
    <div className="bg-white py-20 my-2">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-[42px] md:text-5xl font-bold text-gray-900 mb-6 leading-tight max-w-[600px] mx-auto pb-3">
          {siteContent.heroBanner.title}
        </h1>
        <p className="text-lg font-light text-black/70 mb-8 max-w-[500px] mx-auto leading-relaxed p-2">
          {siteContent.heroBanner.description}
        </p>
        <div className="flex flex-col justify-center items-center gap-3 md:flex-row md:gap-4">
          <Button 
            onClick={() => handleSignupClick()}
            className="px-6 py-2 text-sm font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg shadow-md hover:shadow-lg transition-all duration-300 w-full md:w-auto"
          >
           Try for free<span className="font-light"> - for 12 months</span>
          </Button>
          <Button 
            onClick={() => navigateWithUtm('/pricing')}
            variant="outline"
            className="px-6 py-2 text-sm font-semibold border-2 rounded-lg hover:shadow-lg transition-all duration-300 w-full md:w-auto"
          >
            View plans
          </Button>
        </div>
        <p className="text-sm text-muted-foreground flex items-center justify-center gap-1 mt-3">
          <Check size={16} className="text-primary" />
          No credit card required
        </p>
      </div>
    </div>
  );
};

export default HeroBanner;