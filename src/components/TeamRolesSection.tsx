import { ChefHat, UserCheck, Users, ShoppingCart, BarChart3, Check } from "lucide-react";
import { siteContent } from "@/config/site-content";
import * as icons from 'lucide-react';
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useUtmTracking } from "@/hooks/useUtmTracking";

const iconMap = {
  ChefHat,
  UserCheck,
  Users
};

const DynamicSvgIcon = ({ url, className = '', ...props }) => {
  const [svgContent, setSvgContent] = useState('');

  useEffect(() => {
    if (!url) return;

    fetch(url)
      .then((res) => res.text())
      .then((text) => {
        // Process SVG to ensure it uses primary color
        const processedSvg = text
          .replace(/fill="[^"]*"/g, 'fill="currentColor"')
          .replace(/stroke="[^"]*"/g, 'stroke="currentColor"')
          .replace(/<svg([^>]*)>/, '<svg$1 class="w-full h-full">');
        setSvgContent(processedSvg);
      })
      .catch((err) => {
        console.error('Failed to load SVG:', err);
        setSvgContent('');
      });
  }, [url]);

  return (
    <div
      className={`text-primary ${className}`}
      dangerouslySetInnerHTML={{ __html: svgContent }}
      {...props}
    />
  );
};
const toPascalCase = (kebab: string): string =>
  kebab
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');

function FeatureIcon({ icon, className = '' }: { icon: string; className?: string }) {
  const iconName = toPascalCase(icon); // Convert "alert-triangle" to "AlertTriangle"
  const LucideIcon = (icons as any)[iconName];

  if (LucideIcon) {
    return <LucideIcon className={`${className} text-primary`} />;
  }

  return null;
}
const IconRenderer = ({ icon, className = '' }) => {
  // Check if it's a URL (external SVG)
  if (icon.startsWith('http')) {
    return <DynamicSvgIcon url={icon} className="w-[4.75rem] h-[4.75rem]" />;
  }
  
  // Check if it's a Lucide icon name
  const iconName = toPascalCase(icon);
  const LucideIcon = (icons as any)[iconName];
  console.log('iconName:', iconName, 'exists?', !!LucideIcon);

  if (LucideIcon) {
    return <LucideIcon className={`${className} text-primary`} />;
  }
  console.log(icon)
  
  // Fallback
  return <div className={`${className} bg-muted`} />;
};

const TeamRolesSection = () => {
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
     <section className="py-9 px-8 bg-white">
      <div className="max-w-6xl mx-auto grid gap-10 text-center md:p-[46px] rounded-[1.875rem]">
      
        {/* Section Title and Subtitle */}
        <div className="space-y-6 mx-auto text-left order-1 w-full">
          <h2 className="font-bold text-foreground leading-tight max-w-[600px] text-[3rem]">
            {siteContent.teamRoles.title}
          </h2>
          <p className="text-lg text-black font-light leading-relaxed max-w-[600px]">
            {siteContent.teamRoles.subtitle}
          </p>
        </div>

        {/* Role Blocks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 text-left order-3 md:order-2">
          {siteContent.teamRoles.roles.map((role, index) => {
            const IconComponent = iconMap[role.icon as keyof typeof iconMap];
            return (
              <div key={index} className="space-y-4 bg-[#f2f8f3] p-8 rounded-[1rem]">
                {/* Icon */}
                  <div className="flex mb-4">
                    <div className="w-15 h-15 flex items-center">
                      <IconRenderer icon={role.icon} className="w-10 h-10" />
                    </div>
                  </div>
                
                {/* Title */}
                <h3 className="font-visual-sans text-2xl font-bold text-foreground mb-3">
                  {role.title}
                </h3>
                
                {/* Description */}
                <p className="text-role-description font-light leading-relaxed text-black font-light">
                  {role.description}
                </p>
              </div>
            );
          })}
        </div>
        
        {/* Action buttons */}
        <div className="space-y-3 text-center order-2 md:order-3">
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
    </section>
  );
};

export default TeamRolesSection;