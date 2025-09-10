import { useSearchParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Download, Share2, Loader2, Lock, Crown } from "lucide-react";
import { toast } from "sonner";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const VideoDisplay = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [contentData, setContentData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mediaError, setMediaError] = useState(false);
  const [showSignupDialog, setShowSignupDialog] = useState(false);
  
  useEffect(() => {
    console.log('[VIDEO-DISPLAY] Component mounted');
    
    // Try to get data from sessionStorage first (optimized approach)
    const storedData = sessionStorage.getItem('generatedContent');
    if (storedData) {
      try {
        const data = JSON.parse(storedData);
        console.log('[VIDEO-DISPLAY] Using stored data', { type: data.type, size: data.url?.length });
        setContentData(data);
        setIsLoading(false);
        return;
      } catch (error) {
        console.error('[VIDEO-DISPLAY] Failed to parse stored data:', error);
      }
    }
    
    // Fallback to URL parameters
    const videoUrl = searchParams.get('url');
    const prompt = searchParams.get('prompt');
    const type = searchParams.get('type');
    const format = searchParams.get('format');
    const parametersString = searchParams.get('parameters');
    
    if (videoUrl && prompt) {
      try {
        const parameters = parametersString ? JSON.parse(decodeURIComponent(parametersString)) : null;
        setContentData({ url: videoUrl, prompt, type, format, parameters });
        console.log('[VIDEO-DISPLAY] Using URL parameters', { type, size: videoUrl.length });
      } catch (error) {
        console.error('[VIDEO-DISPLAY] Failed to parse URL parameters:', error);
      }
    }
    
    setIsLoading(false);
  }, [searchParams]);
  
  const { url: videoUrl, prompt, type, format, parameters } = contentData || {};
  
  const handleDownload = () => {
    if (videoUrl) {
      const a = document.createElement('a');
      a.href = videoUrl;
      if (type === 'video') {
        a.download = `generated-video.${format || 'mp4'}`;
      } else {
        a.download = `generated-image.${format || 'jpg'}`;
      }
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const handleUnlock = () => {
    setShowSignupDialog(true);
  };

  const handleSignupConfirm = () => {
    setShowSignupDialog(false);
    navigate('/signup');
  };

  const handleShare = async () => {
    if (navigator.share && videoUrl) {
      try {
        await navigator.share({
          title: `Generated ${type === 'video' ? 'Video' : 'Image'}`,
          text: prompt || `Check out this AI-generated ${type}!`,
          url: window.location.href
        });
      } catch (error) {
        // Fallback to copying URL
        navigator.clipboard.writeText(window.location.href);
        toast.success(`${type === 'video' ? 'Video' : 'Content'} link copied to clipboard!`);
      }
    } else if (videoUrl) {
      navigator.clipboard.writeText(window.location.href);
      toast.success(`${type === 'video' ? 'Video' : 'Content'} link copied to clipboard!`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="p-8 text-center max-w-md">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-2">Loading Content...</h2>
          <p className="text-muted-foreground">Please wait while we prepare your generated content.</p>
        </Card>
      </div>
    );
  }

  if (!videoUrl) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="p-8 text-center max-w-md">
          <h1 className="text-2xl font-bold mb-4">Content Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The requested content could not be found or the URL is invalid.
          </p>
          <Button onClick={() => navigate('/')} className="w-full">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Button>
            
            <Button variant="outline" size="sm" onClick={() => navigate('/')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Generate Another
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Generated Results</h1>
            <p className="text-muted-foreground">Your AI-generated content is ready!</p>
          </div>

          {/* Grid of 4 boxes (2x2) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Box 1 - Actual Generated Content */}
            <Card className="overflow-hidden relative">
              <div className="absolute top-4 left-4 z-10">
                <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                  ✓ Generated
                </span>
              </div>
              {mediaError ? (
                <div className="flex flex-col items-center justify-center p-12 bg-muted/50 min-h-[300px]">
                  <p className="text-muted-foreground mb-4">Failed to load {type === 'video' ? 'video' : 'image'}</p>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setMediaError(false);
                      window.location.reload();
                    }}
                  >
                    Try Again
                  </Button>
                </div>
              ) : type === 'video' ? (
                <video 
                  src={videoUrl} 
                  controls 
                  loop
                  className="w-full h-auto min-h-[300px] bg-black"
                  poster="/placeholder.svg"
                  onError={() => {
                    console.error('[VIDEO-DISPLAY] Video load error');
                    setMediaError(true);
                  }}
                  onLoadStart={() => console.log('[VIDEO-DISPLAY] Video load start')}
                  onCanPlay={() => console.log('[VIDEO-DISPLAY] Video can play')}
                >
                  Your browser does not support the video tag.
                </video>
              ) : (
                <img
                  src={videoUrl}
                  alt="Generated content"
                  className="w-full h-auto min-h-[300px] object-cover bg-black"
                  onError={() => {
                    console.error('[VIDEO-DISPLAY] Image load error');
                    setMediaError(true);
                  }}
                  onLoad={() => console.log('[VIDEO-DISPLAY] Image loaded successfully')}
                />
              )}
              <div className="p-4 bg-white">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Style: Original</span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleShare}>
                      <Share2 className="w-4 h-4 mr-1" />
                      Share
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleDownload}>
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
              </div>
            </Card>

            {/* Box 2 - Locked Variant */}
            <Card className="overflow-hidden relative opacity-75">
              <div className="absolute inset-0 bg-black/20 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
                <div className="bg-white/90 backdrop-blur-sm rounded-lg p-6 text-center">
                  <Lock className="w-8 h-8 mx-auto mb-3 text-gray-600" />
                  <h3 className="font-semibold mb-2">Premium Variant</h3>
                  <p className="text-sm text-gray-600 mb-3">Cinematic Style</p>
                  <Button size="sm" className="bg-primary hover:bg-primary/90" onClick={handleUnlock}>
                    <Crown className="w-4 h-4 mr-2" />
                    Unlock
                  </Button>
                </div>
              </div>
              <div className="min-h-[300px] bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                <div className="text-6xl opacity-20">🎬</div>
              </div>
              <div className="p-4 bg-white">
                <span className="text-sm font-medium text-gray-500">Style: Cinematic</span>
              </div>
            </Card>

            {/* Box 3 - Locked Variant */}
            <Card className="overflow-hidden relative opacity-75">
              <div className="absolute inset-0 bg-black/20 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
                <div className="bg-white/90 backdrop-blur-sm rounded-lg p-6 text-center">
                  <Lock className="w-8 h-8 mx-auto mb-3 text-gray-600" />
                  <h3 className="font-semibold mb-2">Premium Variant</h3>
                  <p className="text-sm text-gray-600 mb-3">Artistic Style</p>
                  <Button size="sm" className="bg-primary hover:bg-primary/90" onClick={handleUnlock}>
                    <Crown className="w-4 h-4 mr-2" />
                    Unlock
                  </Button>
                </div>
              </div>
              <div className="min-h-[300px] bg-gradient-to-br from-blue-100 to-teal-100 flex items-center justify-center">
                <div className="text-6xl opacity-20">🎨</div>
              </div>
              <div className="p-4 bg-white">
                <span className="text-sm font-medium text-gray-500">Style: Artistic</span>
              </div>
            </Card>

            {/* Box 4 - Locked Variant */}
            <Card className="overflow-hidden relative opacity-75">
              <div className="absolute inset-0 bg-black/20 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
                <div className="bg-white/90 backdrop-blur-sm rounded-lg p-6 text-center">
                  <Lock className="w-8 h-8 mx-auto mb-3 text-gray-600" />
                  <h3 className="font-semibold mb-2">Premium Variant</h3>
                  <p className="text-sm text-gray-600 mb-3">Professional Style</p>
                  <Button size="sm" className="bg-primary hover:bg-primary/90" onClick={handleUnlock}>
                    <Crown className="w-4 h-4 mr-2" />
                    Unlock
                  </Button>
                </div>
              </div>
              <div className="min-h-[300px] bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                <div className="text-6xl opacity-20">💼</div>
              </div>
              <div className="p-4 bg-white">
                <span className="text-sm font-medium text-gray-500">Style: Professional</span>
              </div>
            </Card>
          </div>
        </div>
      </main>

      {/* Signup Dialog */}
      <AlertDialog open={showSignupDialog} onOpenChange={setShowSignupDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-semibold">
              🔒 Premium Feature
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              To access additional generated videos with different styles, you'll need to sign up for an account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowSignupDialog(false)}
            >
              Maybe Later
            </Button>
            <AlertDialogAction 
              onClick={handleSignupConfirm}
              className="bg-primary hover:bg-primary/90"
            >
              Sign Up Now
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default VideoDisplay;