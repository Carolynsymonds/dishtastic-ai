import { useState, useEffect, memo, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import HeroBanner from "@/components/HeroBanner";
import { Badge } from "@/components/ui/badge";
import { Check, Calendar, Shield, Smartphone, Plus, Video, Image, Maximize2, Clock, Camera, MapPin, ChevronDown, ArrowUp, Settings, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import ExploreHeader from "@/components/ExploreHeader";
import Footer from "@/components/Footer";
import FeaturesSection from "@/components/FeaturesSection";
import FeatureIntroSection from "@/components/FeatureIntroSection";
import SplitScreenSection from "@/components/SplitScreenSection";
import { siteContent } from "@/config/site-content";
import { useUtmTracking } from "@/hooks/useUtmTracking";
import { toast } from "sonner";
import { GenerationParameters } from "@/types/generation";
import { createSafeInnerHTML } from "@/lib/sanitize";
import { useIsMobile, useIsMobileOrTablet } from "@/hooks/use-mobile";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import ArtStylesShowcase from "@/components/ArtStylesShowcase";
import PromptSuggestions from "@/components/PromptSuggestions";

interface DynamicSvgIconProps {
  url: string;
  className?: string;
  [key: string]: any;
}

const DynamicSvgIcon = memo(({
  url,
  className = '',
  ...props
}: DynamicSvgIconProps) => {
  const [svgContent, setSvgContent] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!url) return;
    
    let isCancelled = false;
    setLoading(true);

    fetch(url)
      .then(res => res.text())
      .then(text => {
        if (isCancelled) return;
        
        // Process SVG to ensure it uses primary color
        const processedSvg = text
          .replace(/fill="[^"]*"/g, 'fill="currentColor"')
          .replace(/stroke="[^"]*"/g, 'stroke="currentColor"')
          .replace(/<svg([^>]*)>/, '<svg$1 class="w-full h-full">');
        setSvgContent(processedSvg);
        setLoading(false);
      })
      .catch(err => {
        if (isCancelled) return;
        console.error('Failed to load SVG:', err);
        setSvgContent('');
        setLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [url]);

  if (loading || !svgContent) {
    return <div className={`w-full h-full ${className}`} />;
  }

  return (
    <div 
      className={`text-primary ${className}`} 
      dangerouslySetInnerHTML={createSafeInnerHTML(svgContent, 'svg')} 
      {...props} 
    />
  );
});
const Home = () => {
  const navigate = useNavigate();
  const { navigateWithUtm } = useUtmTracking();
  const isMobile = useIsMobile();
  const isMobileOrTablet = useIsMobileOrTablet();
  
  const [textareaValue, setTextareaValue] = useState("");
  const textareaRef1 = useRef<HTMLTextAreaElement>(null);
  const textareaRef2 = useRef<HTMLTextAreaElement>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("Evaluating competitor menus");
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [mobileOptionsOpen, setMobileOptionsOpen] = useState(false);
  const [generationParameters, setGenerationParameters] = useState<GenerationParameters>({
    Format: 'Video',
    Scale: 'Portrait',
    Length: '5s',
    'Video Style': 'Ingredient Drop',
    Background: "Chef's Pass"
  });

  // Loading text rotation effect
  useEffect(() => {
    if (!isLoading) return;

    const messages = ["Evaluating competitor menus", "Finding highest margin recipes"];
    let currentIndex = 0;

    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % messages.length;
      setLoadingText(messages[currentIndex]);
    }, 2000);

    return () => clearInterval(interval);
  }, [isLoading]);

  const handleGenerate = () => {
    if (!textareaValue.trim()) {
      toast.error("Please enter a description for your food dish");
      return;
    }

    // Include uploaded image in parameters
    const parametersWithImage = {
      ...generationParameters,
      uploadedImage: uploadedImages.length > 0 ? uploadedImages[0] : undefined
    };

    // Navigate to generation page with parameters
    const params = new URLSearchParams();
    params.set('prompt', textareaValue);
    params.set('parameters', encodeURIComponent(JSON.stringify(parametersWithImage)));
    
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

  const handleChipClick = useCallback((chipText: string, category: string) => {
    setGenerationParameters(prev => ({
      ...prev,
      [category]: chipText
    }));
    setActiveDropdown(null); // Close dropdown after selection
  }, []);

  const toggleDropdown = useCallback((category: string) => {
    setActiveDropdown(activeDropdown === category ? null : category);
  }, [activeDropdown]);

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

  // Unified Options Dialog Component for all screen sizes
  const OptionsDialog = () => (
    <Dialog open={mobileOptionsOpen} onOpenChange={setMobileOptionsOpen}>
      <DialogTrigger asChild>
        <button className="flex items-center gap-1.5 px-2 py-1 text-[10px] rounded-md bg-muted hover:bg-muted/80 text-foreground border border-border shadow-sm">
          <Settings className="w-3 h-3" />
          <span>Options</span>
        </button>
      </DialogTrigger>
      <DialogContent className={`${isMobile ? 'max-w-sm' : isMobileOrTablet ? 'max-w-md' : 'max-w-lg'}`}>
        <DialogHeader>
          <DialogTitle>Generation Options</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {quickReplies.map((category) => (
            <div key={category.category} className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                {category.icon}
                <span>{category.category}</span>
              </div>
              <div className={`grid gap-2 ${isMobile ? 'grid-cols-2' : isMobileOrTablet ? 'grid-cols-3' : 'grid-cols-4'}`}>
                {category.chips.map((chip) => (
                  <button
                    key={chip.text}
                    onClick={() => {
                      handleChipClick(chip.text, category.category);
                    }}
                    className={`flex items-center gap-2 px-2 py-2 rounded-md text-xs text-left transition-colors ${
                      generationParameters[category.category] === chip.text
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted hover:bg-muted/80'
                    }`}
                  >
                    {chip.icon}
                    <span className="truncate">{chip.text}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );

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
      <ExploreHeader />
      
      {/* Hero Section */}
      <section className=" hidden relative min-h-[110vh] bg-white flex items-center justify-center px-8 md:px-[125px] py-5 overflow-visible">
       

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8 flex flex-col items-center justify-center min-h-[80vh]">
          <div className="space-y-6">
            <h1 className="hidden md:block text-4xl md:text-6xl font-bold text-foreground leading-tight tracking-tight px-0">
              Create AI Food Videos & Images in 1-click
            </h1>
            
            {/* Chat Box */}
            <div className="max-w-5xl mx-auto mt-8">
              <div className="space-y-4 p-6 bg-background/95 backdrop-blur-sm border border-border rounded-xl shadow-lg">
                {/* Mobile-only headline inside chat box */}
                <h2 className="md:hidden text-xl font-semibold text-foreground text-center mb-4">
                  Generate Stunning Food ...
                </h2>
                
                <div className="relative">
                  <textarea
                    ref={textareaRef1}
                    value={textareaValue}
                    onChange={(e) => setTextareaValue(e.target.value)}
                    placeholder="Describe the food or recipe you want to generate..."
                    className="w-full min-h-[140px] pl-14 pr-12 py-4 pb-12 border border-input bg-background rounded-lg text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                    rows={5}
                  />
                  
                  <PromptSuggestions 
                    onSelect={(prompt) => setTextareaValue(prompt)}
                    textareaRef={textareaRef1}
                    className="w-full"
                  />
                  
                  {/* Loading overlay */}
                  {isLoading && (
                    <div className="absolute inset-0 backdrop-blur-sm bg-white/50 rounded-xl flex items-center justify-center z-20">
                      <div className="flex flex-col items-center gap-6 my-12">
                        <Loader2 className="h-10 w-10 animate-spin text-primary" />
                        <div className="text-center">
                          <h3 className="text-lg font-semibold text-foreground mb-2">Analyzing your dish...</h3>
                          <p className="text-base text-muted-foreground animate-pulse">{loadingText}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
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
                    className="absolute bottom-8 right-4 p-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Generate"
                  >
                    <ArrowUp className="w-5 h-5" />
                  </button>
                  
                  {/* Quick Reply Chips inside textarea - Responsive */}
                  <div className="absolute bottom-6 left-3 right-3 flex flex-wrap gap-1">
                    <OptionsDialog />
                  </div>
                    
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const files = e.target.files;
                        if (files && files.length > 0) {
                          const file = files[0];
                          // Check file size (max 10MB)
                          if (file.size > 10 * 1024 * 1024) {
                            toast.error("Image must be smaller than 10MB");
                            return;
                          }
                          
                          // Start loading
                          setIsLoading(true);
                          
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            const result = event.target?.result as string;
                            setUploadedImages([result]);
                            
                            // Simulate processing time and stop loading
                            setTimeout(() => {
                              setIsLoading(false);
                            }, 3000);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                    
                    {/* Image preview */}
                    {uploadedImages.length > 0 && (
                      <div className="absolute top-12 left-3 right-3">
                        <div className="bg-muted p-2 rounded-lg flex items-center gap-2">
                          <img 
                            src={uploadedImages[0]} 
                            alt="Uploaded dish"
                            className="w-12 h-12 object-cover rounded"
                          />
                          <span className="text-sm text-muted-foreground flex-1">
                            {uploadedImages.length > 0 && 'Image uploaded - will use Image-to-Video'}
                          </span>
                          <button
                            onClick={() => setUploadedImages([])}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    )}
                </div>
              </div>
            </div>
            
          </div>

          
        </div>
      </section>
     {/* Hero Section V2 */}
     <section className="relative min-h-[20vh] bg-white flex items-center justify-end px-8 md:px-[125px] py-5 overflow-visible">
        <div className="relative z-10 max-w-2xl mx-auto text-center space-y-8 flex flex-col items-center justify-end min-h-[60vh]">
          <div className="space-y-6">
            <h1 className="hidden md:block text-4xl md:text-6xl font-bold text-foreground leading-tight tracking-tight px-0">
              Create AI Food Videos & Images in 1-click
            </h1>
            
            {/* Chat Box */}
            <div className="max-w-5xl mx-auto pt-12 pb-3">
              <div>
                {/* Mobile-only headline inside chat box */}
                <h2 className="md:hidden text-xl font-semibold text-foreground text-center mb-4">
                  Generate Stunning Food ...
                </h2>
                
                <div className="relative">
                  <textarea
                    ref={textareaRef2}
                    value={textareaValue}
                    onChange={(e) => setTextareaValue(e.target.value)}
                    placeholder="Describe the food or recipe you want to generate..."
                    className="w-full min-h-[80px] h-[100px] pl-4 pr-12 py-4 pb-12 border border-input bg-background rounded-lg text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                    rows={5}
                  />
                  
                  <PromptSuggestions 
                    onSelect={(prompt) => setTextareaValue(prompt)}
                    textareaRef={textareaRef2}
                    className="w-full"
                  />
                  
                  {/* Loading overlay */}
                  {isLoading && (
                    <div className="absolute inset-0 backdrop-blur-sm bg-white/50 rounded-xl flex items-center justify-center z-20">
                      <div className="flex flex-col items-center gap-6 my-12">
                        <Loader2 className="h-10 w-10 animate-spin text-primary" />
                        <div className="text-center">
                          <h3 className="text-lg font-semibold text-foreground mb-2">Analyzing your dish...</h3>
                          <p className="text-base text-muted-foreground animate-pulse">{loadingText}</p>
                        </div>
                      </div>
                    </div>
                  )}
                
                  
                  {/* Send button */}
                  <button
                    onClick={handleGenerate}
                    disabled={!textareaValue.trim()}
                    className="absolute bottom-8 right-4 p-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Generate"
                  >
                    <ArrowUp className="w-5 h-5" />
                  </button>
                  
                  {/* Quick Reply Chips inside textarea - Responsive */}
                  <div className="absolute bottom-6 left-3 right-3 flex flex-wrap gap-1">
                    <OptionsDialog />
                  </div>
                    
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const files = e.target.files;
                        if (files && files.length > 0) {
                          const file = files[0];
                          // Check file size (max 10MB)
                          if (file.size > 10 * 1024 * 1024) {
                            toast.error("Image must be smaller than 10MB");
                            return;
                          }
                          
                          // Start loading
                          setIsLoading(true);
                          
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            const result = event.target?.result as string;
                            setUploadedImages([result]);
                            
                            // Simulate processing time and stop loading
                            setTimeout(() => {
                              setIsLoading(false);
                            }, 3000);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                    
                    {/* Image preview */}
                    {uploadedImages.length > 0 && (
                      <div className="absolute top-12 left-3 right-3">
                        <div className="bg-muted p-2 rounded-lg flex items-center gap-2">
                          <img 
                            src={uploadedImages[0]} 
                            alt="Uploaded dish"
                            className="w-12 h-12 object-cover rounded"
                          />
                          <span className="text-sm text-muted-foreground flex-1">
                            {uploadedImages.length > 0 && 'Image uploaded - will use Image-to-Video'}
                          </span>
                          <button
                            onClick={() => setUploadedImages([])}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    )}
                </div>
              </div>
            </div>            
          </div>

        </div>
      </section>
      <ArtStylesShowcase />

      
      <div>
        <FeaturesSection />
      </div>

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