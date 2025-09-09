import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Download, Share2 } from "lucide-react";
import { toast } from "sonner";

const VideoDisplay = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const videoUrl = searchParams.get('url');
  const prompt = searchParams.get('prompt');
  const scale = searchParams.get('scale');
  
  const handleDownload = () => {
    if (videoUrl) {
      const a = document.createElement('a');
      a.href = videoUrl;
      a.download = 'generated-video.mp4';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const handleShare = async () => {
    if (navigator.share && videoUrl) {
      try {
        await navigator.share({
          title: 'Generated Video',
          text: prompt || 'Check out this AI-generated video!',
          url: window.location.href
        });
      } catch (error) {
        // Fallback to copying URL
        navigator.clipboard.writeText(window.location.href);
        toast.success("Video link copied to clipboard!");
      }
    } else if (videoUrl) {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Video link copied to clipboard!");
    }
  };

  if (!videoUrl) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="p-8 text-center max-w-md">
          <h1 className="text-2xl font-bold mb-4">Video Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The requested video could not be found or the URL is invalid.
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
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Video Player */}
          <Card className="overflow-hidden">
            <video 
              src={videoUrl} 
              controls 
              className="w-full h-auto max-h-[70vh] bg-black"
              poster="/placeholder.svg"
            >
              Your browser does not support the video tag.
            </video>
          </Card>

          {/* Video Details */}
          {(prompt || scale) && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Video Details</h2>
              <div className="space-y-3">
                {prompt && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Prompt</label>
                    <p className="mt-1 text-sm bg-muted p-3 rounded-md">{prompt}</p>
                  </div>
                )}
                {scale && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Scale</label>
                    <p className="mt-1 text-sm">{scale}</p>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default VideoDisplay;