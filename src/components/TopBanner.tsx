import { useState } from "react";
import { useUtmTracking } from "@/hooks/useUtmTracking";
import { siteContent } from "@/config/site-content";

const TopBanner = () => {
  const [isVisible, setIsVisible] = useState(true);
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

  if (!isVisible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] bg-muted border-b border-border">
      <div className="container mx-auto px-2 md:px-4">
        <div className="flex items-center justify-center py-2 md:py-3">
          <div className="text-center">
            <span className="text-xs md:text-sm text-foreground leading-tight">
              {siteContent.topBanner.text}
            </span>
            <button 
              onClick={handleSignupClick}
              className="ml-1 md:ml-2 text-xs md:text-sm underline hover:text-primary transition-colors"
            >
              {siteContent.topBanner.buttonText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopBanner;