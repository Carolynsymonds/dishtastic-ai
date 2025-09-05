import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import HeroBanner from "./HeroBanner";
import { siteContent } from "@/config/site-content";
import * as icons from 'lucide-react';

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
    return <DynamicSvgIcon url={icon} className={className} />;
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

const AISmartToolsSection = () => {
  const { title, items } = siteContent.featuresPage.features[1];

  return (
    <section className="py-16">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center space-y-12">
          {/* Section Title */}
          <div className="mx-auto max-w-[500px]">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">
              {title}
            </h2>
          </div>

          {/* Integrations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {items.map((integration, index) => (
              <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-shadow duration-300 p-6" style={{ backgroundColor: 'hsl(var(--card-light-green))' }}>
                <CardContent className="p-0 text-center space-y-4">
                  {/* Icon */}
                  <div className="flex justify-center mb-4">
                    <div className="w-8 h-8 flex items-center justify-center">
                      <IconRenderer icon={integration.icon} className="w-6 h-6" />
                    </div>
                  </div>
                  
                  {/* Tool Name */}
                  <h3 className="text-xl font-bold text-foreground">
                    {integration.name}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-muted-foreground leading-relaxed">
                    {integration.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
          <HeroBanner />
        </div>
      </div>
    </section>
  );
};

export default AISmartToolsSection;