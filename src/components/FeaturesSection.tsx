import { useState, useEffect } from "react";
import { Calendar, Shield, Smartphone } from "lucide-react";
import { siteContent } from "@/config/site-content";

const iconMap = {
  Calendar,
  Shield,
  Smartphone
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

  if (!svgContent) {
    return null;
  }

  return (
    <div
      className={`text-primary ${className}`}
      dangerouslySetInnerHTML={{ __html: svgContent }}
      {...props}
    />
  );
};

const FeaturesSection = () => {
  return (
    <section className="py-16 px-6 bg-background">
      <div className="mx-auto text-center space-y-12">
        {/* Headline */}
        <div className="space-y-4 text-center max-w-5xl m-auto">
          <h2 className="font-bold text-foreground leading-tight max-w-[800px] text-[3rem] text-center mx-auto">
            {siteContent.features.title}
          </h2>
          <p className="text-lg text-black mx-auto max-w-3xl leading-relaxed text-center font-light">
            {siteContent.features.subtitle}
          </p>
        </div>

        {/* Feature Blocks */}
        <div className="grid md:grid-cols-3 gap-8 pt-8 max-w-[900px] self-center m-auto">
          {siteContent.features.items.map((feature, index) => {
            // Check if icon is a URL (SVG/PNG) or lucide icon name
            const isUrl = feature.icon.startsWith('http') || feature.icon.startsWith('/');
            
            return (
              <div key={index} className="space-y-4 text-center">
                {isUrl ? (
                  <div className="flex justify-center mb-4">
                    <div className="w-20 h-20 flex items-center justify-center">
                      {feature.icon.endsWith('.png') ? (
                        <img src={feature.icon} alt={feature.title} className="w-16 h-16 object-contain" />
                      ) : (
                        <DynamicSvgIcon url={feature.icon} className="w-16 h-16" />
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="w-16 h-16 mx-auto flex items-center justify-center">
                    {(() => {
                      const IconComponent = iconMap[feature.icon as keyof typeof iconMap];
                      return IconComponent ? <IconComponent className="w-8 h-8 text-primary" /> : null;
                    })()}
                  </div>
                )}
                <h3 className="text-xl font-semibold text-foreground">{feature.title}</h3>
                <p className="leading-relaxed text-black font-light">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;