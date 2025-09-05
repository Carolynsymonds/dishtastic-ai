import { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Check } from "lucide-react";
import { siteContent } from "@/config/site-content";
import { useIsMobileOrTablet } from "@/hooks/use-mobile";
import { useUtmTracking } from "@/hooks/useUtmTracking";

const SplitScreenSection = () => {
  const isMobileOrTablet = useIsMobileOrTablet();
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

  useEffect(() => {
    // Only apply scroll effects on desktop (not mobile or tablet)
    if (isMobileOrTablet) return;

    const handleScroll = () => {
      const sections = document.querySelectorAll('[data-section]');
      const images = document.querySelectorAll('.scroll-image');
      
      sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        const sectionId = section.getAttribute('data-section');
        
        // Check if section is in viewport (with some offset for better UX)
        if (rect.top <= window.innerHeight * 0.6 && rect.bottom >= window.innerHeight * 0.4) {
          // Hide all images
          images.forEach(img => img.classList.remove('opacity-100'));
          images.forEach(img => img.classList.add('opacity-0'));
          
          // Show the corresponding image
          const activeImage = document.querySelector(`.scroll-image[data-section="${sectionId}"]`);
          if (activeImage) {
            activeImage.classList.remove('opacity-0');
            activeImage.classList.add('opacity-100');
          }
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial call
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMobileOrTablet]);

  // Mobile/Tablet layout: simple vertical sections with image above text
  if (isMobileOrTablet) {
    return (
      <div className="bg-background">
        {siteContent.splitScreen.sections.map((section) => (
          <section key={section.id} className="p-6 bg-background">
            {/* Image */}
            <div className="mb-8 flex justify-center">
              <img 
                src={section.image} 
                alt={section.imageAlt}
                className="w-full max-w-sm h-[400px] rounded-[1.5rem] object-cover"
              />
            </div>
            
            {/* Content */}
            <div className="max-w-lg mx-auto text-left space-y-6">
              <h2 className="text-4xl font-bold leading-tight tracking-tight">
                {section.title}
              </h2>
              
              <p className="text-lg font-light leading-relaxed text-muted-foreground">
                {section.description}
              </p>
              
              <div className="space-y-3 text-muted-foreground">
                {section.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ))}
      </div>
    );
  }

  // Desktop layout: sticky images with scrolling content
  return (
    <div className="relative bg-background">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-0 bg-background">
        {/* Sticky Left Side - Images */}
        <div className="lg:sticky lg:top-0 lg:h-screen flex items-center justify-center p-8 bg-background">
          <div className="relative w-full max-w-md">
            {siteContent.splitScreen.sections.map((section, index) => (
              <div 
                key={section.id}
                className={`scroll-image transition-opacity duration-500 ${
                  index === 0 ? 'opacity-100' : 'absolute inset-0 opacity-0'
                }`} 
                data-section={section.id}
              >
                <img 
                  src={section.image} 
                  alt={section.imageAlt}
                  className="w-full h-[500px] rounded-[1.5rem] object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Right Side - Scrolling Content */}
        <div className="lg:min-h-[300vh] bg-background">
          {siteContent.splitScreen.sections.map((section) => (
            <section 
              key={section.id}
              className="min-h-screen bg-background flex items-center" 
              data-section={section.id}
            >
              <div className="p-8 lg:p-16">
                <div className="space-y-8 max-w-lg">
                  <div className="space-y-6">
                    <h2 className="text-5xl font-bold leading-tight tracking-tight">
                      {section.title}
                    </h2>
                    
                    <p className="text-xl font-light leading-relaxed text-muted-foreground">
                      {section.description}
                    </p>
                  </div>
                  
                  <div className="space-y-3 text-muted-foreground">
                    {section.features.map((feature, index) => (
                      <div key={index} className="flex gap-3 items-center">
                        <div className="w-2 h-2 bg-primary rounded-full" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          ))}
        </div>
      </div>
       {/* CTA Button Section - Full Width */}
      <div className="max-w-7xl mx-auto pb-14 space-y-3 text-center">
        <Button 
          onClick={handleSignupClick}
          className="px-6 py-2 text-sm font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
        >
           Try for free<span className="font-light"> - for 12 months</span>
        </Button>
        <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
          <Check size={14} className="text-primary" />
          {siteContent.headline.disclaimer}
        </p>
      </div>
    </div>
  );
};

export default SplitScreenSection;