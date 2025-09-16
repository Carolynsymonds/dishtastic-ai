import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { siteContent } from "@/config/site-content";
import { useUtmTracking } from "@/hooks/useUtmTracking";
import PromptSuggestions from "@/components/PromptSuggestions";
import { useIsMobile, useIsMobileOrTablet } from "@/hooks/use-mobile";
import { useCallback, useRef, useState, useEffect } from "react";
import { GenerationParameters } from "@/types/generation";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@radix-ui/react-dialog";
import { DialogHeader } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { Check, Calendar, Shield, Smartphone, Plus, Video, Image, Maximize2, Clock, Camera, MapPin, ChevronDown, ArrowUp, Settings, Loader2, Film, Square } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
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
  const [generationStartTime, setGenerationStartTime] = useState<number | null>(null);
  const [generationTime, setGenerationTime] = useState(0);
  const [apiProgress, setApiProgress] = useState(0);
  const [generatedContent, setGeneratedContent] = useState<any>(null);
  const [generationParameters, setGenerationParameters] = useState<GenerationParameters>({
    Format: 'Image',
    Scale: 'Landscape',
    Length: '5s',
    'Video Style': 'Ingredient Drop',
    Background: "Chef's Pass"
  });
  const textareaRef1 = useRef<HTMLTextAreaElement>(null);
  const textareaRef2 = useRef<HTMLTextAreaElement>(null);

  // Type selector state (Image or Video)
  const [generationType, setGenerationType] = useState<"image" | "video">("image");

  // Update scale based on generation type
  useEffect(() => {
    setGenerationParameters(prev => ({
      ...prev,
      Scale: generationType === "image" ? "Landscape" : "Portrait"
    }));
  }, [generationType]);

  // Timer effect for generation time tracking
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading && generationStartTime) {
      interval = setInterval(() => {
        setGenerationTime((Date.now() - generationStartTime) / 1000);
      }, 100);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLoading, generationStartTime]);

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

  const handleGenerate = async () => {
    if (!textareaValue.trim()) {
      toast.error("Please enter a description for your food dish");
      return;
    }

    // Set loading state and start timer
    setIsLoading(true);
    setGenerationStartTime(Date.now());
    setGenerationTime(0);
    setApiProgress(0);

    // Include uploaded image in parameters
    const parametersWithImage = {
      ...generationParameters,
      Format: generationType === "image" ? "Image" : "Video",
      uploadedImage: uploadedImages.length > 0 ? uploadedImages[0] : undefined
    };

    // Store dish prompt in database
    try {
      console.log('[PROMPT_SAVE] Attempting to save prompt to database');
      const { data: userData } = await supabase.auth.getUser();
      console.log('[PROMPT_SAVE] User data:', userData.user?.id ? 'authenticated' : 'anonymous');
      
      const insertData = {
        user_id: userData.user?.id || null,
        prompt: textareaValue.trim(),
        generation_type: parametersWithImage.Format === 'Video' ? 'video' : 'image',
        parameters: parametersWithImage,
        user_ip: null, // Could be added later if needed
        user_agent: navigator.userAgent
      };
      
      console.log('[PROMPT_SAVE] Insert data:', insertData);
      
      const { data, error } = await supabase.from('dish_prompts').insert(insertData);
      
      if (error) {
        console.error('[PROMPT_SAVE] Database error:', error);
      } else {
        console.log('[PROMPT_SAVE] Successfully saved prompt:', data);
      }
    } catch (promptError) {
      console.error('[PROMPT_SAVE] Failed to save prompt:', promptError);
      // Continue with generation even if saving prompt fails
    }

    try {
      const isVideo = parametersWithImage.Format === 'Video';
      toast.info(isVideo ? "Generating video... This may take up to 2 minutes" : "Generating image...");

      console.log('[GENERATION] Calling edge function', {
        isVideo,
        promptLength: textareaValue.length,
        parameters: parametersWithImage
      });

      // Simulate progress updates during API call
      const progressInterval = setInterval(() => {
        setApiProgress(prev => {
          const newProgress = prev + Math.random() * 15; // Random progress increments
          return Math.min(newProgress, 90); // Cap at 90% until completion
        });
      }, 500);

      const { data, error } = await supabase.functions.invoke('generate-content', {
        body: {
          prompt: textareaValue,
          parameters: parametersWithImage
        }
      });

      // Clear progress interval and set to 100% on completion
      clearInterval(progressInterval);
      setApiProgress(100);

      if (error) {
        console.error('[GENERATION] Edge function error:', error);

        // Provide more specific error messages
        if (error.message?.includes('non-2xx status code')) {
          toast.error('Generation service is currently unavailable. Please try again later.');
        } else if (error.message?.includes('API key')) {
          toast.error('Generation service configuration error. Please contact support.');
        } else {
          toast.error(`Generation failed: ${error.message}`);
        }

        throw error;
      }

      console.log('[GENERATION] Success', {
        type: data.type,
        format: data.format,
        dataSize: data.content?.length || 0
      });

      toast.success(`${isVideo ? 'Video' : 'Image'} generated successfully!`);

      // Store the generated content for display
      const generationData = {
        url: data.type === 'video' ? data.content : `data:image/${data.format};base64,${data.content}`,
        content: data.content, // Store base64 content for images
        prompt: data.prompt,
        type: data.type,
        format: data.format,
        parameters: data.parameters,
        generatedAt: new Date().toISOString()
      };

      // Store in sessionStorage and redirect to results page
      sessionStorage.setItem('generatedContent', JSON.stringify(generationData));
      navigate('/video?id=' + Date.now());

    } catch (error: any) {
      console.error('[GENERATION] Error:', error);

      // Reset loading state
      setIsLoading(false);
      setGenerationStartTime(null);
      setGenerationTime(0);

      // Don't show duplicate error messages
      if (!error.message?.includes('Generation service')) {
        toast.error(error.message || 'Failed to generate content');
      }
    }
  };

  const handleCancelGeneration = () => {
    setIsLoading(false);
    setGenerationStartTime(null);
    setGenerationTime(0);
    toast.success("Generation cancelled");
  };

  return (
    <div className="min-h-screen bg-black">
      <ExploreHeader />

      {/* Main Content */}
      <main className="pt-16">
        {/* Hero Section - Full Screen Video */}
        <div className="relative h-screen overflow-hidden">
            <img
              src="/lovable-uploads/pizza_converted.webp"
              alt="Udon - Ramen & Noodles"
              className="w-full h-full object-cover"
            />

          {/* Optional: Overlay content on video */}
          <div className="absolute inset-0 bg-black bg-opacity-10 flex flex-col items-center justify-center">
          <div className="space-y-6 max-w-[731px] text-center">

            <h1 className="block text-center text-4xl md:text-6xl font-bold text-white leading-tight tracking-tight px-0">
            Create Mouth-Watering DoorDash Images
              </h1>
              {/* Chat Box */}
              <div className="w-full px-4 md:max-w-5xl md:mx-auto md:px-0 pt-12 pb-3">
                <div className="relative">
                  <textarea
                    ref={textareaRef2}
                    value={textareaValue}
                    onChange={(e) => setTextareaValue(e.target.value)}
                    placeholder="Describe the food or recipe you want to generate..."
                    className="w-full min-h-[70px] h-[85px] md:min-h-[80px] md:h-[100px] pl-3 md:pl-4 font-light pr-10 md:pr-12 py-3 md:py-4 pb-8 md:pb-12 border border-input bg-background rounded-lg text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none text-sm md:text-base"
                    rows={4}
                  />

                  <PromptSuggestions
                    onSelect={(prompt) => setTextareaValue(prompt)}
                    textareaRef={textareaRef2}
                    className="w-full"
                  />



                  {/* Send button */}
                  <button
                    onClick={isLoading ? handleCancelGeneration : handleGenerate}
                    disabled={!textareaValue.trim() && !isLoading}
                    className={`absolute bottom-6 md:bottom-8 right-3 md:right-4 transition-all duration-200 ${isLoading
                        ? "px-3 py-1.5 md:px-4 md:py-2 bg-white hover:bg-gray-100 text-black rounded-full shadow-lg border border-gray-200 cursor-pointer"
                        : "p-2 md:p-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg"
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    title={isLoading ? "Cancel generation" : "Generate"}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2 md:gap-3">
                        <div className="relative w-5 h-5 md:w-6 md:h-6">
                          {/* Progress Ring */}
                          <svg className="w-5 h-5 md:w-6 md:h-6" viewBox="0 0 100 100">
                            {/* Track */}
                            <circle
                              cx="50"
                              cy="50"
                              r="42"
                              stroke="currentColor"
                              strokeWidth="8"
                              fill="none"
                              className="text-gray-300 opacity-20"
                            />
                            {/* Progress */}
                            <circle
                              cx="50"
                              cy="50"
                              r="42"
                              stroke="currentColor"
                              strokeWidth="8"
                              fill="none"
                              strokeLinecap="round"
                              transform="rotate(-90 50 50)"
                              className="text-black"
                              style={{
                                strokeDasharray: '264px',
                                strokeDashoffset: `${264 * (1 - apiProgress / 100)}px`
                              }}
                            />
                          </svg>
                        </div>
                        <span className="text-xs md:text-sm text-foreground">Running {generationTime.toFixed(1)}s</span>
                      </div>
                    ) : (
                      <ArrowUp className="w-4 h-4 md:w-5 md:h-5" />
                    )}
                  </button>

                  {/* Quick Reply Chips inside textarea - Responsive */}
                  <div className="absolute bottom-4 md:bottom-6 left-3 right-3 flex flex-wrap gap-1">
                    <TypeSelector />
                    <OptionsDialog generationType={generationType} />
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

        {/* Generated Content Display */}
        {generatedContent && (
          <div className="relative h-screen overflow-hidden bg-black">
            <div className="absolute inset-0 flex items-center justify-center">
              {generatedContent.type === 'video' ? (
                <video
                  className="w-full h-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                  controls
                >
                  <source src={generatedContent.url} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <img
                  src={generatedContent.url}
                  alt="Generated content"
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            
            {/* Overlay with prompt and controls */}
            <div className="absolute inset-0 bg-black bg-opacity-20 flex flex-col items-center justify-center">
              <div className="bg-black/80 backdrop-blur-sm rounded-lg p-6 max-w-md mx-auto text-center">
                <h3 className="text-xl font-semibold text-white mb-2">
                  {generatedContent.type === 'video' ? 'Video Generated!' : 'Image Generated!'}
                </h3>
                <p className="text-sm text-gray-300 mb-4">
                  {generatedContent.prompt}
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => setGeneratedContent(null)}
                    className="px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Generate Another
                  </button>
                  <button
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = generatedContent.url;
                      link.download = `generated-${generatedContent.type}-${Date.now()}`;
                      link.click();
                    }}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Download
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

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
                            src="/lovable-uploads/avocado.webp"

              alt="Soba - Ramen & Noodles"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Middle Panel - Avocado Salad */}
          <div className="flex-1 relative overflow-hidden">
            <img
              src="/lovable-uploads/3019963f-d795-4f70-a8a6-9e8a0f85c0ef.png"
              alt="Avocado Salad - Bowls & Salads"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Right Panel - Additional Food */}
          <div className="flex-1 relative overflow-hidden">
            <img
              src="/lovable-uploads/414772d4-1bcb-4d32-a2a1-79efdc45cdca.png"
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
