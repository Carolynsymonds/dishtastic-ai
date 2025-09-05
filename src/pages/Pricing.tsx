import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroBanner from "@/components/HeroBanner";
import { siteContent } from "@/config/site-content";
import { useUtmTracking } from "@/hooks/useUtmTracking";

const Pricing = () => {
  const { pricing } = siteContent;
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
    <div className="min-h-screen bg-white">
      <Header />
      
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center my-16 mx-auto  max-w-[600px]">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-8 leading-tight">
            {pricing.title}
          </h1>
          <h2 style={{ color: '#191918', fontSize: '20px', fontWeight: '300' }} className="mx-auto leading-relaxed">
            {pricing.subtitle}
          </h2>
        </div>

        {/* Pricing Cards */}
        <div className={`grid gap-8 max-w-6xl mx-auto ${pricing.plans.length === 2 ? 'md:grid-cols-2 justify-center px-16' : 'md:grid-cols-2 lg:grid-cols-3'}`}>

          {pricing.plans.map((plan, index) => (
            <Card 
              key={plan.name} 
              className={`relative ${plan.popular ? 'ring-2 ring-primary shadow-lg' : 'border border-gray-200'} transition-all duration-200 hover:shadow-lg`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-white">
                  Recommended
                </Badge>
              )}
              
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold text-gray-900">
                  {plan.name}
                </CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900">
                    ${plan.price}
                  </span>
                  <span>
                    /mo
                  </span>
                </div>
                <p className="text-gray-600 mt-3">
                  {plan.description}
                </p>
              </CardHeader>

               <CardContent className="space-y-6">
                <Button 
                  onClick={handleSignupClick}
                  className={`w-full ${plan.popular ? 'bg-primary hover:bg-primary/90' : ''}`}
                  variant={plan.popular ? "default" : "outline"}
                >
                  {plan.cta}
                </Button>

                {/* Features List */}
                <div className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 text-sm">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <HeroBanner />
      </div>
      <Footer />
    </div>
  );
};

export default Pricing;