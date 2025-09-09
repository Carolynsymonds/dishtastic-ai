import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import HeroBanner from "@/components/HeroBanner";
import { Badge } from "@/components/ui/badge";
import { Check, Calendar, Shield, Smartphone, Plus, Video, Image, Maximize2, Clock, Camera, MapPin, ChevronDown, ArrowUp } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TopBanner from "@/components/TopBanner";
import FeaturesSection from "@/components/FeaturesSection";
import FeatureIntroSection from "@/components/FeatureIntroSection";
import SplitScreenSection from "@/components/SplitScreenSection";
import { siteContent } from "@/config/site-content";
import { useUtmTracking } from "@/hooks/useUtmTracking";
import { toast } from "sonner";
import { GenerationParameters } from "@/types/generation";
const DynamicSvgIcon = ({
  url,
  className = '',
  ...props
}) => {
  const [svgContent, setSvgContent] = useState('');
  useEffect(() => {
    if (!url) return;
    fetch(url).then(res => res.text()).then(text => {
      // Process SVG to ensure it uses primary color
      const processedSvg = text.replace(/fill="[^"]*"/g, 'fill="currentColor"').replace(/stroke="[^"]*"/g, 'stroke="currentColor"').replace(/<svg([^>]*)>/, '<svg$1 class="w-full h-full">');
      setSvgContent(processedSvg);
    }).catch(err => {
      console.error('Failed to load SVG:', err);
      setSvgContent('');
    });
  }, [url]);
  return <div className={`text-primary ${className}`} dangerouslySetInnerHTML={{
    __html: svgContent
  }} {...props} />;
};
const Home = () => {
  const navigate = useNavigate();
  const { navigateWithUtm } = useUtmTracking();
  const [textareaValue, setTextareaValue] = useState("");
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [generationParameters, setGenerationParameters] = useState<GenerationParameters>({
    Format: 'Video',
    Scale: 'Portrait',
    Length: '5s',
    'Video Style': 'Ingredient Drop',
    Background: "Chef's Pass"
  });

  const handleGenerate = () => {
    if (!textareaValue.trim()) {
      toast.error("Please enter a description for your food dish");
      return;
    }

    // Navigate to generation page with parameters
    const params = new URLSearchParams();
    params.set('prompt', textareaValue);
    params.set('parameters', encodeURIComponent(JSON.stringify(generationParameters)));
    
    navigate(`/generate?${params.toString()}`);
  };

  const handleSignupClick = () => {
    try {
      // GA4 recommended event
      window.gtag?.('event', 'sign_up', {
        method: 'cta_button',
        button_id: 'signup-btn',
        button_text: 'Start Free Trial',
        page_location: window.location.href
      });
    } catch (e) {
      // no-op if gtag not available
    }

    // then navigate (SPA)
    navigateWithUtm('/signup');
  };

  const handleChipClick = (chipText: string, category: string) => {
    setGenerationParameters(prev => ({
      ...prev,
      [category]: chipText
    }));
    setActiveDropdown(null); // Close dropdown after selection
  };

  const toggleDropdown = (category: string) => {
    setActiveDropdown(activeDropdown === category ? null : category);
  };

  const quickReplies = [
    {
      category: "Format",
      icon: <Video className="w-4 h-4" />,
      chips: [
        { text: "Video", icon: <Video className="w-3 h-3" /> },
        { text: "Image", icon: <Image className="w-3 h-3" /> }
      ]
    },
    {
      category: "Scale", 
      icon: <Maximize2 className="w-4 h-4" />,
      chips: [
        { text: "Portrait", icon: <Maximize2 className="w-3 h-3" /> },
        { text: "Square", icon: <Maximize2 className="w-3 h-3" /> },
        { text: "Landscape", icon: <Maximize2 className="w-3 h-3" /> }
      ]
    },
    {
      category: "Length",
      icon: <Clock className="w-4 h-4" />,
      chips: [
        { text: "1s", icon: <Clock className="w-3 h-3" /> },
        { text: "2s", icon: <Clock className="w-3 h-3" /> },
        { text: "5s", icon: <Clock className="w-3 h-3" /> },
        { text: "10s", icon: <Clock className="w-3 h-3" /> },
        { text: "15s", icon: <Clock className="w-3 h-3" /> }
      ]
    },
    {
      category: "Video Style",
      icon: <Camera className="w-4 h-4" />,
      chips: [
        { text: "Push-In Close", icon: <Camera className="w-3 h-3" /> },
        { text: "Pull-Back Reveal", icon: <Camera className="w-3 h-3" /> },
        { text: "Overhead Top-Down", icon: <Camera className="w-3 h-3" /> },
        { text: "360° Dish Orbit", icon: <Camera className="w-3 h-3" /> },
        { text: "Table Slide", icon: <Camera className="w-3 h-3" /> },
        { text: "Tilt-Down Reveal", icon: <Camera className="w-3 h-3" /> },
        { text: "Tilt-Up Reveal", icon: <Camera className="w-3 h-3" /> },
        { text: "Rack Focus Shift", icon: <Camera className="w-3 h-3" /> },
        { text: "Slow-Mo Pour", icon: <Camera className="w-3 h-3" /> },
        { text: "Ingredient Drop", icon: <Camera className="w-3 h-3" /> },
        { text: "Handheld Lifestyle", icon: <Camera className="w-3 h-3" /> },
        { text: "Whip Pan", icon: <Camera className="w-3 h-3" /> },
        { text: "Speed Ramp", icon: <Camera className="w-3 h-3" /> },
        { text: "Drone Establishing", icon: <Camera className="w-3 h-3" /> },
        { text: "Chef POV", icon: <Camera className="w-3 h-3" /> }
      ]
    },
    {
      category: "Background",
      icon: <MapPin className="w-4 h-4" />,
      chips: [
        { text: "Plain", icon: <MapPin className="w-3 h-3" /> },
        { text: "Home Kitchen", icon: <MapPin className="w-3 h-3" /> },
        { text: "Chef's Pass", icon: <MapPin className="w-3 h-3" /> },
        { text: "Street Stall", icon: <MapPin className="w-3 h-3" /> },
        { text: "Fine Dining", icon: <MapPin className="w-3 h-3" /> },
        { text: "Farm Table", icon: <MapPin className="w-3 h-3" /> },
        { text: "Coffee Shop", icon: <MapPin className="w-3 h-3" /> },
        { text: "Garden Picnic", icon: <MapPin className="w-3 h-3" /> },
        { text: "Rooftop Bar", icon: <MapPin className="w-3 h-3" /> },
        { text: "Market Stand", icon: <MapPin className="w-3 h-3" /> },
        { text: "Backyard Grill", icon: <MapPin className="w-3 h-3" /> },
        { text: "Hotel Buffet", icon: <MapPin className="w-3 h-3" /> },
        { text: "Casual Diner", icon: <MapPin className="w-3 h-3" /> }
      ]
    }
  ];
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
      icon: isUrl ? <DynamicSvgIcon url={item.icon} className="w-16 h-16" /> : iconMap[item.icon as keyof typeof iconMap],
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
  return <div className="min-h-screen bg-white">
      <TopBanner />
      <Header />
      
      {/* Hero Section */}
      <section className="relative min-h-[140vh] bg-white flex items-center justify-center px-8 md:px-[125px] py-5 overflow-visible">
        {/* Background Images - Two Rows */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pt-20" style={{ gap: '2px' }}>
          {/* First Row */}
          <div className="flex gap-0.5 w-full max-w-full px-4 opacity-60">
            <img 
              src="/lovable-uploads/ac8c5174-2398-43ea-8ede-9298108eb6cc.png" 
              alt="Wood-fired pizza showcase" 
              className="flex-1 h-56 md:h-72 lg:h-80 xl:h-96 object-cover"
            />
            <img 
              src="/lovable-uploads/414772d4-1bcb-4d32-a2a1-79efdc45cdca.png" 
              alt="Lobster roll showcase" 
              className="flex-1 h-56 md:h-72 lg:h-80 xl:h-96 object-cover"
            />
            <img 
              src="/lovable-uploads/3019963f-d795-4f70-a8a6-9e8a0f85c0ef.png" 
              alt="Ramen preparation showcase" 
              className="flex-1 h-56 md:h-72 lg:h-80 xl:h-96 object-cover"
            />
            <img 
              src="/lovable-uploads/9b776cf4-fad8-4955-a4a2-ccbbd1ce7a96.png" 
              alt="Poke bowl preparation showcase" 
              className="flex-1 h-56 md:h-72 lg:h-80 xl:h-96 object-cover"
            />
          </div>
          
          {/* Second Row */}
          <div className="flex gap-0.5 w-full max-w-full px-4 opacity-60">
            <img 
              src="/lovable-uploads/006ae285-acc6-42fb-a3e2-b2415ed1da30.png" 
              alt="Fine dining steak showcase" 
              className="flex-1 h-56 md:h-72 lg:h-80 xl:h-96 object-cover"
            />
            <img 
              src="/lovable-uploads/a8ad989d-7ec6-494d-83c6-f74aab6a0170.png" 
              alt="Artisan cookies bakery showcase" 
              className="flex-1 h-56 md:h-72 lg:h-80 xl:h-96 object-cover"
            />
            <img 
              src="/lovable-uploads/26136666-4fcb-49fd-b5a9-13b1af964c5d.png" 
              alt="Glazed chicken wings showcase" 
              className="flex-1 h-56 md:h-72 lg:h-80 xl:h-96 object-cover"
            />
            <img 
              src="/lovable-uploads/cba94c88-cf1f-4568-bbdf-43bec434925e.png" 
              alt="Street taco showcase" 
              className="flex-1 h-56 md:h-72 lg:h-80 xl:h-96 object-cover"
            />
          </div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8 flex flex-col items-center justify-center min-h-[80vh]">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight tracking-tight px-0">
              Make A Food Dish Image or Video in Seconds
            </h1>
            
            {/* Chat Box */}
            <div className="max-w-5xl mx-auto mt-8">
              <div className="space-y-4 p-6 bg-background/95 backdrop-blur-sm border border-border rounded-xl shadow-lg">
                <div className="relative">
                  <textarea
                    value={textareaValue}
                    onChange={(e) => setTextareaValue(e.target.value)}
                    placeholder="Describe your food dish or recipe you want to generate..."
                    className="w-full min-h-[140px] pl-14 pr-12 py-4 pb-12 border border-input bg-background rounded-lg text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                    rows={5}
                  />
                  
                  {/* Add image button */}
                  <button
                    onClick={() => document.getElementById('image-upload')?.click()}
                    className="absolute top-4 left-4 p-2 hover:bg-muted rounded-lg transition-colors"
                    title="Add image"
                  >
                    <Plus className="w-5 h-5 text-muted-foreground hover:text-foreground" />
                  </button>
                  
                  {/* Send button */}
                  <button
                    onClick={handleGenerate}
                    disabled={!textareaValue.trim()}
                    className="absolute bottom-8 right-4 p-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Generate"
                  >
                    <ArrowUp className="w-5 h-5" />
                  </button>
                  
                  {/* Quick Reply Chips inside textarea */}
                  <div className="absolute bottom-6 left-3 right-3 flex flex-wrap gap-2">
                      {quickReplies.map((category) => (
                        <div key={category.category} className="relative">
                          <button
                            onClick={() => toggleDropdown(category.category)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md whitespace-nowrap transition-colors border shadow-sm ${
                              generationParameters[category.category] 
                                ? 'bg-primary text-primary-foreground border-primary' 
                                : 'bg-muted hover:bg-muted/80 text-foreground border-border'
                            }`}
                          >
                            {category.icon}
                            <span>{generationParameters[category.category] || category.category}</span>
                            <ChevronDown className="w-3 h-3" />
                          </button>
                          
                          {/* Dropdown menu */}
                          {activeDropdown === category.category && (
                            <div className="absolute bottom-full mb-2 left-0 bg-background border border-border rounded-lg shadow-lg z-50 min-w-[200px] max-h-48 overflow-y-auto">
                              <div className="p-2 space-y-1">
                                {category.chips.map((chip) => (
                                  <button
                                    key={chip.text}
                                    onClick={() => handleChipClick(chip.text, category.category)}
                                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-left transition-colors ${
                                      generationParameters[category.category] === chip.text
                                        ? 'bg-primary text-primary-foreground'
                                        : 'hover:bg-muted'
                                    }`}
                                  >
                                    {chip.icon}
                                    <span>{chip.text}</span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        // Handle image upload logic here
                        console.log('Selected files:', e.target.files);
                      }}
                    />
                </div>
              </div>
            </div>
            
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
                <Button onClick={handleSignupClick} className="px-6 py-2 text-sm font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg shadow-md hover:shadow-lg transition-all duration-300 w-full sm:w-auto">
                  Try for free - <span className="font-light">for 12 months</span>
                </Button>
                <Button onClick={() => navigateWithUtm('/features')} variant="outline" className="px-6 py-2 w-full sm:w-auto">
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
            {plans.map((plan, index) => <Card key={plan.name} className={`relative ${plan.popular ? 'ring-2 ring-primary shadow-lg' : 'border border-gray-200'} transition-all duration-200 hover:shadow-lg`}>
                {plan.popular && <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-white">
                    Most Popular
                  </Badge>}
                
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
                <Button onClick={() => navigateWithUtm(plan.link)} className={`w-full ${plan.popular ? 'bg-primary hover:bg-primary/90' : ''}`} variant={plan.popular ? "default" : "outline"}>
                  {plan.cta}
                </Button>

                  <div className="space-y-3">
                    {plan.features.map((feature, featureIndex) => <div key={featureIndex} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-muted-foreground text-sm">
                          {feature}
                        </span>
                      </div>)}
                  </div>
                </CardContent>
              </Card>)}
          </div>

          <div className="text-center mt-12">
            <Button onClick={() => navigateWithUtm('/pricing')} variant="outline" className="px-6 py-2">
              View more
            </Button>
          </div>
        </div>
      </section>

      
      <SplitScreenSection />

      <HeroBanner />


      <Footer />
    </div>;
};
export default Home;