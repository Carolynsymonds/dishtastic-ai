import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { siteContent } from "@/config/site-content";
import { useUtmTracking } from "@/hooks/useUtmTracking";
import PromptSuggestions from "@/components/PromptSuggestions";
import { useIsMobile, useIsMobileOrTablet } from "@/hooks/use-mobile";
import { useCallback, useRef, useState } from "react";
import { GenerationParameters } from "@/types/generation";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@radix-ui/react-dialog";
import { DialogHeader } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { Check, Calendar, Shield, Smartphone, Plus, Video, Image, Maximize2, Clock, Camera, MapPin, ChevronDown, ArrowUp, Settings, Loader2, Film } from "lucide-react";
import OptionsDialog from "@/components/OptionsDialog";
import ExploreHeader from "@/components/ExploreHeader";
import Footer from "@/components/Footer";

const ExploreImages = () => {
  const navigate = useNavigate();
  const { navigateWithUtm } = useUtmTracking();
  const isMobile = useIsMobile();
  const isMobileOrTablet = useIsMobileOrTablet();

  const [textareaValue, setTextareaValue] = useState("");
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
  const textareaRef1 = useRef<HTMLTextAreaElement>(null);
  const textareaRef2 = useRef<HTMLTextAreaElement>(null);

  // Type selector state (Image or Video)
  const [generationType, setGenerationType] = useState<"image" | "video">("image");

  const handleLoginClick = () => {
    try {
      // GA4 recommended event
      window.gtag?.('event', 'login', {
        method: 'home_explore_page',
        button_id: 'login-btn',
        button_text: 'Log in',
        page_location: window.location.href,
      });
    } catch (e) {
      // no-op if gtag not available
    }

    // Navigate to login page
    navigateWithUtm('/login');
  };

  const handleSignupClick = () => {
    try {
      // GA4 recommended event
      window.gtag?.('event', 'sign_up', {
        method: 'home_explore_page',
        button_id: 'signup-btn',
        button_text: 'Try for free',
        page_location: window.location.href,
      });
    } catch (e) {
      // no-op if gtag not available
    }

    // Navigate to signup page
    navigateWithUtm('/signup');
  };

  // Type Selector Component
  const TypeSelector = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-1.5 px-2 py-1 text-[10px] rounded-md bg-muted hover:bg-muted/80 text-foreground border border-border shadow-sm">
          <Film className="w-3 h-3" />
          <span>{generationType === "video" ? "Video" : "Image"}</span>
          <ChevronDown className="w-3 h-3" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48 bg-background border border-input text-foreground rounded-lg shadow-lg" align="start">
        <div className="px-3 py-2 text-xs font-medium text-muted-foreground border-b border-border">
          Type
        </div>
        <DropdownMenuItem
          onClick={() => setGenerationType("image")}
          className={`flex items-center gap-2 px-3 py-2 text-sm cursor-pointer ${generationType === "image"
              ? "bg-accent text-accent-foreground"
              : "hover:bg-accent hover:text-accent-foreground"
            }`}
        >
          <Image className="w-4 h-4" />
          <span>Image</span>
          {generationType === "image" && (
            <div className="ml-auto w-2 h-2 bg-primary rounded-full" />
          )}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setGenerationType("video")}
          className={`flex items-center gap-2 px-3 py-2 text-sm cursor-pointer ${generationType === "video"
              ? "bg-accent text-accent-foreground"
              : "hover:bg-accent hover:text-accent-foreground"
            }`}
        >
          <Video className="w-4 h-4" />
          <span>Video</span>
          {generationType === "video" && (
            <div className="ml-auto w-2 h-2 bg-primary rounded-full" />
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

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

  return (
    <div className="min-h-screen bg-black">
      <ExploreHeader />

      {/* Main Content */}
      <main className="pt-16">
        {/* Hero Section - Full Screen Video */}
        <div className="relative h-screen overflow-hidden">
            <img
              src="/lovable-uploads/image1-pizza.png"
              alt="Udon - Ramen & Noodles"
              className="w-full h-full object-cover"
            />

          {/* Optional: Overlay content on video */}
          <div className="absolute inset-0 bg-black bg-opacity-10 flex flex-col items-center justify-center">
            <div className="space-y-6 max-w-[731px] text-center">
              
              <h1 className="hidden md:block text-4xl md:text-6xl font-bold text-white leading-tight tracking-tight px-0">
                Create Food Images for Doordash
              </h1>
              {/* Chat Box */}
              <div className="max-w-5xl mx-auto pt-12 pb-3">
                <div className="relative">
                  <textarea
                    ref={textareaRef2}
                    value={textareaValue}
                    onChange={(e) => setTextareaValue(e.target.value)}
                    placeholder="Describe the food or recipe you want to generate..."
                    className="w-full min-h-[80px] h-[100px] pl-4 font-light pr-12 py-4 pb-12 border border-input bg-background rounded-lg text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
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
                    <TypeSelector />
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

        {/* Additional Images Section */}
        <div className="flex h-screen">
          {/* Left Panel - More Seafood */}
          <div className="flex-1 relative overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1525755662778-989d0524087e?q=80&w=1400&auto=format&fit=crop"
              alt="Shrimp Roll - Seafood Rolls"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Middle Panel - More Noodles */}
          <div className="flex-1 relative overflow-hidden">
            <img
              src="/lovable-uploads/9b776cf4-fad8-4955-a4a2-ccbbd1ce7a96.png"
              alt="Udon - Ramen & Noodles"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Right Panel - More Bowls */}
          <div className="flex-1 relative overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1551183053-bf91a1d81141?q=80&w=1400&auto=format&fit=crop"
              alt="Pho - Ramen & Noodles"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Third Row */}
        <div className="flex h-screen">
          {/* Left Panel - Cupcakes */}
          <div className="flex-1 relative overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1499636136210-6f4ee915583e?q=80&w=1400&auto=format&fit=crop"
              alt="Cupcakes - Desserts & Bakes"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Middle Panel - Tacos */}
          <div className="flex-1 relative overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?q=80&w=1400&auto=format&fit=crop"
              alt="Tacos - Tacos & Wings"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Right Panel - Wings */}
          <div className="flex-1 relative overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=1400&auto=format&fit=crop"
              alt="Wings - Tacos & Wings"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Fourth Row */}
        <div className="flex h-screen">
          {/* Left Panel - Soba */}
          <div className="flex-1 relative overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1526318472351-c75fcf070305?q=80&w=1400&auto=format&fit=crop"
              alt="Soba - Ramen & Noodles"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Middle Panel - Avocado Salad */}
          <div className="flex-1 relative overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1522184216315-dc2f3f3b9f98?q=80&w=1400&auto=format&fit=crop"
              alt="Avocado Salad - Bowls & Salads"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Right Panel - Additional Food */}
          <div className="flex-1 relative overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1516685018646-549198525c1b?q=80&w=1400&auto=format&fit=crop"
              alt="Lasagna - Additional Dishes"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Fifth Row - Desserts & Bakes */}
        <div className="flex h-screen">
          {/* Left Panel - Cookies */}
          <div className="flex-1 relative overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1400&auto=format&fit=crop"
              alt="Cookies - Desserts & Bakes"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Middle Panel - Cheesecake */}
          <div className="flex-1 relative overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?q=80&w=1400&auto=format&fit=crop"
              alt="Cheesecake - Desserts & Bakes"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Right Panel - Brownie */}
          <div className="flex-1 relative overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1540126034813-121bf29033c8?q=80&w=1400&auto=format&fit=crop"
              alt="Brownie - Desserts & Bakes"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Sixth Row - More Desserts & Tacos */}
        <div className="flex h-screen">
          {/* Left Panel - Cupcakes */}
          <div className="flex-1 relative overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1499636136210-6f4ee915583e?q=80&w=1400&auto=format&fit=crop"
              alt="Cupcakes - Desserts & Bakes"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Middle Panel - Tacos */}
          <div className="flex-1 relative overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?q=80&w=1400&auto=format&fit=crop"
              alt="Tacos - Tacos & Wings"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Right Panel - Wings */}
          <div className="flex-1 relative overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=1400&auto=format&fit=crop"
              alt="Wings - Tacos & Wings"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Seventh Row - More Tacos & Wings */}
        <div className="flex h-screen">
          {/* Left Panel - Nachos */}
          <div className="flex-1 relative overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1541542684-4a1a72e1c8a3?q=80&w=1400&auto=format&fit=crop"
              alt="Nachos - Tacos & Wings"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Middle Panel - Quesadilla */}
          <div className="flex-1 relative overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1523986371872-9d3ba2e2f642?q=80&w=1400&auto=format&fit=crop"
              alt="Quesadilla - Tacos & Wings"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Right Panel - Additional Food */}
          <div className="flex-1 relative overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1516685018646-549198525c1b?q=80&w=1400&auto=format&fit=crop"
              alt="Lasagna - Additional Dishes"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ExploreImages;
