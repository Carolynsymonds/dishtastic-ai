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
import ExploreHeader from "@/components/ExploreHeader";
import Footer from "@/components/Footer";
import { VerificationModal } from "@/components/VerificationModal";

const VideoDisplay = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [contentData, setContentData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mediaError, setMediaError] = useState(false);
  const [showSignupDialog, setShowSignupDialog] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationModalPurpose, setVerificationModalPurpose] = useState<'unlock-analysis' | 'download-report'>('unlock-analysis');
  
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
  
  const { url: videoUrl, content, prompt, type, format, parameters } = contentData || {};
  
  // Handle base64 image content
  const mediaUrl = type === 'image' && content ? `data:image/${format || 'png'};base64,${content}` : videoUrl;
  
  const handleUnlock = () => {
    setVerificationModalPurpose('unlock-analysis');
    setShowVerificationModal(true);
  };

  const handleDownload = () => {
    setVerificationModalPurpose('download-report');
    setShowVerificationModal(true);
  };

  const handleSignupConfirm = () => {
    setShowSignupDialog(false);
    navigate('/signup');
  };



  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <Card className="p-8 text-center max-w-md bg-gray-900 border-gray-700">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-white" />
          <h2 className="text-lg font-semibold mb-2 text-white">Loading Content...</h2>
          <p className="text-gray-300">Please wait while we prepare your generated content.</p>
        </Card>
      </div>
    );
  }

  if (!mediaUrl) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <Card className="p-8 text-center max-w-md bg-gray-900 border-gray-700">
          <h1 className="text-2xl font-bold mb-4 text-white">Content Not Found</h1>
          <p className="text-gray-300 mb-6">
            The requested content could not be found or the URL is invalid.
          </p>
          <Button onClick={() => navigate('/')} className="w-full bg-primary hover:bg-primary/90">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <ExploreHeader />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 pt-24">
        <h1 className="text-4xl md:text-6xl font-bold text-center text-white mb-8 leading-tight">
            Results
          </h1>
        <div className="max-w-6xl mx-auto space-y-6">

          {/* Grid of 4 boxes (2x2) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Box 1 - Actual Generated Content */}
            <Card className="overflow-hidden relative bg-gray-900 border-gray-700">

              {mediaError ? (
                <div className="flex flex-col items-center justify-center p-12 bg-gray-800 min-h-[300px]">
                  <p className="text-gray-300 mb-4">Failed to load {type === 'video' ? 'video' : 'image'}</p>
                  <Button 
                    variant="outline" 
                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
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
                  src={mediaUrl} 
                  controls 
                  loop
                  autoPlay
                  muted
                  playsInline
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
                  src={mediaUrl}
                  alt="Generated content"
                  className="w-full h-auto min-h-[300px] object-cover bg-black"
                  onError={() => {
                    console.error('[VIDEO-DISPLAY] Image load error');
                    setMediaError(true);
                  }}
                  onLoad={() => console.log('[VIDEO-DISPLAY] Image loaded successfully')}
                />
              )}
              <div className="p-4 bg-gray-800">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-300">Style: Original</span>
                  <div className="flex gap-2">
                   
                    <Button variant="ghost" size="sm" className="text-white hover:bg-gray-800 border-0" onClick={handleDownload}>
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
              </div>
            </Card>

            {/* Box 2 - Locked Variant */}
            <Card className="overflow-hidden relative opacity-75 bg-black border-gray-800">
              <div className="absolute inset-0 bg-black/70 backdrop-blur-sm z-10 flex flex-col items-center justify-center pointer-events-none">
                <div className="bg-black/90 backdrop-blur-sm rounded-lg p-6 text-center border border-gray-700 pointer-events-auto">
                  <Lock className="w-8 h-8 mx-auto mb-3 text-gray-300" />
                  <h3 className="font-semibold mb-2 text-white">Premium Variant</h3>
                  <p className="text-sm text-gray-300 mb-3">Cinematic Style</p>
                  <Button size="sm" className="bg-white text-black hover:bg-gray-200" onClick={handleUnlock}>
                    Unlock
                  </Button>
                </div>
              </div>
              <div className="min-h-[300px] relative opacity-50">
                {type === 'video' ? (
                  <video 
                    src={mediaUrl} 
                    controls 
                    loop
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-auto min-h-[300px] bg-black"
                    poster="/placeholder.svg"
                    onLoadedData={(e) => {
                      const video = e.target as HTMLVideoElement;
                      video.currentTime = 2; // Start at 2 seconds
                    }}
                    onError={() => {
                      console.error('[VIDEO-DISPLAY] Background video load error');
                    }}
                    onLoadStart={() => console.log('[VIDEO-DISPLAY] Background video load start')}
                    onCanPlay={() => console.log('[VIDEO-DISPLAY] Background video can play')}
                  >
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <img
                    src={mediaUrl}
                    alt="Generated content"
                    className="w-full h-auto min-h-[300px] object-cover bg-black"
                    onError={() => {
                      console.error('[VIDEO-DISPLAY] Background image load error');
                    }}
                    onLoad={() => console.log('[VIDEO-DISPLAY] Background image loaded successfully')}
                  />
                )}
              </div>
              <div className="p-4 bg-gray-800">
                <span className="text-sm font-medium text-gray-400">Style: Cinematic</span>
              </div>
            </Card>

            {/* Box 3 - Locked Variant */}
            <Card className="overflow-hidden relative opacity-75 bg-black border-gray-800">
              <div className="absolute inset-0 bg-black/70 backdrop-blur-sm z-10 flex flex-col items-center justify-center pointer-events-none">
                <div className="bg-black/90 backdrop-blur-sm rounded-lg p-6 text-center border border-gray-700 pointer-events-auto">
                  <Lock className="w-8 h-8 mx-auto mb-3 text-gray-300" />
                  <h3 className="font-semibold mb-2 text-white">Premium Variant</h3>
                  <p className="text-sm text-gray-300 mb-3">Artistic Style</p>
                  <Button size="sm" className="bg-white text-black hover:bg-gray-200" onClick={handleUnlock}>
                    Unlock
                  </Button>
                </div>
              </div>
              <div className="min-h-[300px] relative opacity-50">
                {type === 'video' ? (
                  <video 
                    src={mediaUrl} 
                    controls 
                    loop
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-auto min-h-[300px] bg-black"
                    poster="/placeholder.svg"
                    onLoadedData={(e) => {
                      const video = e.target as HTMLVideoElement;
                      video.currentTime = 4; // Start at 4 seconds
                    }}
                    onError={() => {
                      console.error('[VIDEO-DISPLAY] Background video load error');
                    }}
                    onLoadStart={() => console.log('[VIDEO-DISPLAY] Background video load start')}
                    onCanPlay={() => console.log('[VIDEO-DISPLAY] Background video can play')}
                  >
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <img
                    src={mediaUrl}
                    alt="Generated content"
                    className="w-full h-auto min-h-[300px] object-cover bg-black"
                    onError={() => {
                      console.error('[VIDEO-DISPLAY] Background image load error');
                    }}
                    onLoad={() => console.log('[VIDEO-DISPLAY] Background image loaded successfully')}
                  />
                )}
              </div>
              <div className="p-4 bg-gray-800">
                <span className="text-sm font-medium text-gray-400">Style: Artistic</span>
              </div>
            </Card>

            {/* Box 4 - Locked Variant */}
            <Card className="overflow-hidden relative opacity-75 bg-black border-gray-800">
              <div className="absolute inset-0 bg-black/70 backdrop-blur-sm z-10 flex flex-col items-center justify-center pointer-events-none">
                <div className="bg-black/90 backdrop-blur-sm rounded-lg p-6 text-center border border-gray-700 pointer-events-auto">
                  <Lock className="w-8 h-8 mx-auto mb-3 text-gray-300" />
                  <h3 className="font-semibold mb-2 text-white">Premium Variant</h3>
                  <p className="text-sm text-gray-300 mb-3">Professional Style</p>
                  <Button size="sm" className="bg-white text-black hover:bg-gray-200" onClick={handleUnlock}>
                    Unlock
                  </Button>
                </div>
              </div>
              <div className="min-h-[300px] relative opacity-50">
                {type === 'video' ? (
                  <video 
                    src={mediaUrl} 
                    controls 
                    loop
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-auto min-h-[300px] bg-black"
                    poster="/placeholder.svg"
                    onLoadedData={(e) => {
                      const video = e.target as HTMLVideoElement;
                      video.currentTime = 6; // Start at 6 seconds
                    }}
                    onError={() => {
                      console.error('[VIDEO-DISPLAY] Background video load error');
                    }}
                    onLoadStart={() => console.log('[VIDEO-DISPLAY] Background video load start')}
                    onCanPlay={() => console.log('[VIDEO-DISPLAY] Background video can play')}
                  >
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <img
                    src={mediaUrl}
                    alt="Generated content"
                    className="w-full h-auto min-h-[300px] object-cover bg-black"
                    onError={() => {
                      console.error('[VIDEO-DISPLAY] Background image load error');
                    }}
                    onLoad={() => console.log('[VIDEO-DISPLAY] Background image loaded successfully')}
                  />
                )}
              </div>
              <div className="p-4 bg-gray-800">
                <span className="text-sm font-medium text-gray-400">Style: Professional</span>
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

        {/* Verification Modal */}
        <VerificationModal
          isOpen={showVerificationModal}
          onClose={() => setShowVerificationModal(false)}
          dishesData={[contentData]}
          purpose={verificationModalPurpose}
        />

        <Footer />
      </div>
    );
  };

export default VideoDisplay;