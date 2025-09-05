import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import HeroBanner from "@/components/HeroBanner";
import { Badge } from "@/components/ui/badge";
import { Check, Calendar, Shield, Smartphone } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TopBanner from "@/components/TopBanner";
import FeaturesSection from "@/components/FeaturesSection";
import FeatureIntroSection from "@/components/FeatureIntroSection";
import SplitScreenSection from "@/components/SplitScreenSection";
import { siteContent } from "@/config/site-content";
import { useUtmTracking } from "@/hooks/useUtmTracking";

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

const Home = () => {
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
  // Get features from site content - taking first 3 from the features section
  const features = siteContent.features.items.map(item => {
    const iconMap = {
      Calendar: <Calendar className="w-16 h-16 text-primary" />,
      Shield: <Shield className="w-16 h-16 text-primary" />,
      Smartphone: <Smartphone className="w-16 h-16 text-primary" />
    };
    
    // Check if icon is a URL (SVG) or lucide icon name
    const isUrl = item.icon.startsWith('http');
    
    return {
      icon: isUrl ? (
        <DynamicSvgIcon url={item.icon} className="w-16 h-16" />
      ) : (
        iconMap[item.icon as keyof typeof iconMap]
      ),
      title: item.title,
      description: item.description
    };
  });

  // Get pricing plans from site content
  const plans = siteContent.pricing.plans.map(plan => ({
    name: plan.name,
    price: plan.price,
    period: "per month",
    description: plan.description,
    features: plan.features,
    cta: plan.cta,
    popular: plan.popular,
    link: plan.name === "Free trial" ? "/free-plan" : "/signup"
  }));

  return (
    <div className="min-h-screen bg-white">
      <TopBanner />
      <Header />
      
      {/* Hero Section */}
      <section className="min-h-[80vh] bg-white flex items-center justify-center px-8 md:px-[125px] py-5">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-6 mt-24">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight tracking-tight px-0">
              {siteContent.homePage.title}
            </h1>
            
            <p className="text-xl text-muted-foreground mx-auto leading-relaxed max-w-3xl font-light px-0">
              {siteContent.homePage.subtitle}
            </p>
          </div>

          <div className="pt-8 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
               <Button 
                onClick={handleSignupClick}
                className="px-6 py-2 text-sm font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg shadow-md hover:shadow-lg transition-all duration-300 w-full sm:w-auto"
              >
                Try for free - <span className="font-light">for 12 months</span>
              </Button>
              <Button 
                onClick={() => navigateWithUtm('/pricing')}
                variant="outline" 
                className="px-6 py-2 w-full sm:w-auto"
              >
                View plans
              </Button>
            </div>
            <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
              <Check size={16} className="text-primary" />
              No credit card required
            </p>
          </div>
        </div>
      </section>

      <FeaturesSection />

      {/* CTA Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button 
                  onClick={handleSignupClick}
                  className="px-6 py-2 text-sm font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg shadow-md hover:shadow-lg transition-all duration-300 w-full sm:w-auto"
                >
                  Try for free - <span className="font-light">for 12 months</span>
                </Button>
                <Button 
                  onClick={() => navigateWithUtm('/features')}
                  variant="outline" 
                  className="px-6 py-2 w-full sm:w-auto"
                >
                  View features
                </Button>
              </div>
              <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                <Check size={16} className="text-primary" />
                No credit card required
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 max-w-4xl mx-auto">
              Simple, transparent pricing
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Start free and scale as you grow. No hidden fees, no surprises.
            </p>
          </div>

          <div className={`grid gap-8 max-w-6xl mx-auto ${plans.length === 2 ? 'md:grid-cols-2 justify-center px-16' : 'md:grid-cols-3'}`}>
            {plans.map((plan, index) => (
              <Card 
                key={plan.name} 
                className={`relative ${plan.popular ? 'ring-2 ring-primary shadow-lg' : 'border border-gray-200'} transition-all duration-200 hover:shadow-lg`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-white">
                    Most Popular
                  </Badge>
                )}
                
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-2xl font-bold text-foreground">
                    {plan.name}
                  </CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-foreground">
                      ${plan.price}
                    </span>
                    <span className="text-muted-foreground">
                      {plan.price === 0 ? '' : `/${plan.period}`}
                    </span>
                  </div>
                  <p className="text-muted-foreground mt-3">
                    {plan.description}
                  </p>
                </CardHeader>

                <CardContent className="space-y-6">
                <Button 
                  onClick={() => navigateWithUtm(plan.link)}
                  className={`w-full ${plan.popular ? 'bg-primary hover:bg-primary/90' : ''}`}
                  variant={plan.popular ? "default" : "outline"}
                >
                  {plan.cta}
                </Button>

                  <div className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-muted-foreground text-sm">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button 
              onClick={() => navigateWithUtm('/pricing')}
              variant="outline" 
              className="px-6 py-2"
            >
              View more
            </Button>
          </div>
        </div>
      </section>

      
      <SplitScreenSection />

      <HeroBanner />


      <Footer />
    </div>
  );
};

export default Home;