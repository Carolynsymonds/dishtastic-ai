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
  const type = searchParams.get('type');
  const format = searchParams.get('format');
  const parametersString = searchParams.get('parameters');
  const parameters = parametersString ? JSON.parse(decodeURIComponent(parametersString)) : null;
  
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
          {/* Content Display */}
          <Card className="overflow-hidden">
            {type === 'video' ? (
              <video 
                src={videoUrl} 
                controls 
                autoPlay
                loop
                className="w-full h-auto max-h-[70vh] bg-black"
                poster="/placeholder.svg"
              >
                Your browser does not support the video tag.
              </video>
            ) : (
              <img
                src={videoUrl}
                alt="Generated content"
                className="w-full h-auto max-h-[70vh] object-contain bg-black"
              />
            )}
          </Card>

          {/* Generation Details */}
          {(prompt || parameters) && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Generation Details</h2>
              <div className="space-y-4">
                {prompt && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Prompt</label>
                    <p className="mt-1 text-sm bg-muted p-3 rounded-md">{prompt}</p>
                  </div>
                )}
                {parameters && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Parameters</label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {Object.entries(parameters).map(([key, value]) => (
                        <span key={key} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                          {key}: {String(value)}
                        </span>
                      ))}
                    </div>
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