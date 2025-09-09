import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, ArrowLeft, Download, Share2, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface GenerationResult {
  type: 'image' | 'video';
  content: string;
  format: string;
  parameters: any;
  prompt: string;
  duration?: number;
  taskId?: string;
}

const GenerateVideo = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationResult, setGenerationResult] = useState<GenerationResult | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);

  // Get parameters from URL
  const prompt = searchParams.get('prompt');
  const parametersString = searchParams.get('parameters');
  const parameters = parametersString ? JSON.parse(decodeURIComponent(parametersString)) : null;

  useEffect(() => {
    if (!prompt || !parameters) {
      toast.error("Invalid generation parameters");
      navigate('/');
      return;
    }

    // Start generation when component mounts
    handleGenerate();
  }, [prompt, parameters]);

  const handleGenerate = async () => {
    if (!prompt || !parameters) return;

    setIsGenerating(true);
    setGenerationError(null);
    setGenerationResult(null);

    try {
      const isVideo = parameters.Format === 'Video';
      toast.info(isVideo ? "Generating video... This may take up to 2 minutes" : "Generating image...");
      
      const { data, error } = await supabase.functions.invoke('generate-content', {
        body: {
          prompt: prompt,
          parameters: parameters
        }
      });

      if (error) {
        throw error;
      }

      setGenerationResult(data);
      toast.success(`${isVideo ? 'Video' : 'Image'} generated successfully!`);
    } catch (error: any) {
      console.error('Generation error:', error);
      setGenerationError(error.message || 'Failed to generate content');
      toast.error(error.message || 'Failed to generate content');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadContent = () => {
    if (!generationResult) return;

    const link = document.createElement('a');
    if (generationResult.type === 'image') {
      link.href = `data:image/${generationResult.format};base64,${generationResult.content}`;
      link.download = `generated-dish.${generationResult.format}`;
    } else {
      link.href = generationResult.content;
      link.download = `generated-video.${generationResult.format}`;
    }
    link.click();
  };

  const handleShare = async () => {
    if (!generationResult) return;

    const shareData = {
      title: 'Generated Food Content',
      text: `Check out this ${generationResult.type} I generated: ${prompt}`,
      url: window.location.href
    };

    if (navigator.share && navigator.canShare?.(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.error('Error sharing:', error);
        // Fallback to clipboard
        navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard!');
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const handleRegenerate = () => {
    handleGenerate();
  };

  const goBack = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <Header />
      
      <main className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <Button 
              onClick={goBack}
              variant="ghost" 
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Button>
            
            {generationResult && (
              <div className="flex gap-2">
                <Button
                  onClick={handleShare}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </Button>
                <Button
                  onClick={downloadContent}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download
                </Button>
                <Button
                  onClick={handleRegenerate}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                  disabled={isGenerating}
                >
                  <RotateCcw className="w-4 h-4" />
                  Regenerate
                </Button>
              </div>
            )}
          </div>

          {/* Generation Content */}
          <Card className="w-full">
            <CardContent className="p-8">
              {isGenerating && (
                <div className="text-center py-16">
                  <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
                  <h2 className="text-2xl font-semibold mb-2">
                    {parameters?.Format === 'Video' ? 'Generating Video...' : 'Generating Image...'}
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    {parameters?.Format === 'Video' 
                      ? 'This may take up to 2 minutes. Please be patient while we create your video.'
                      : 'Creating your image now...'
                    }
                  </p>
                  <div className="bg-primary/10 rounded-lg p-4 max-w-md mx-auto">
                    <p className="text-sm font-medium">Prompt:</p>
                    <p className="text-sm text-muted-foreground">{prompt}</p>
                  </div>
                </div>
              )}

              {generationError && (
                <div className="text-center py-16">
                  <div className="bg-destructive/10 text-destructive p-6 rounded-lg mb-4 max-w-md mx-auto">
                    <h3 className="font-semibold mb-2">Generation Failed</h3>
                    <p className="text-sm">{generationError}</p>
                  </div>
                  <Button onClick={handleRegenerate} className="flex items-center gap-2">
                    <RotateCcw className="w-4 h-4" />
                    Try Again
                  </Button>
                </div>
              )}

              {generationResult && !isGenerating && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h2 className="text-2xl font-semibold mb-2">
                      {generationResult.type === 'video' ? 'Video Generated!' : 'Image Generated!'}
                    </h2>
                    <p className="text-muted-foreground">
                      Your {generationResult.type} has been successfully created.
                    </p>
                  </div>

                  {/* Display content */}
                  <div className="flex justify-center">
                    {generationResult.type === 'image' ? (
                      <img
                        src={`data:image/${generationResult.format};base64,${generationResult.content}`}
                        alt="Generated food dish"
                        className="max-w-full h-auto rounded-lg shadow-lg"
                        style={{ maxHeight: '70vh' }}
                      />
                    ) : (
                      <video
                        src={generationResult.content}
                        controls
                        autoPlay
                        loop
                        className="max-w-full h-auto rounded-lg shadow-lg"
                        style={{ maxHeight: '70vh' }}
                      >
                        Your browser does not support the video tag.
                      </video>
                    )}
                  </div>
                  
                  {/* Generation details */}
                  <div className="text-center space-y-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm font-medium mb-2">Generation Details</p>
                      <p className="text-sm text-muted-foreground mb-3">
                        <strong>Prompt:</strong> {generationResult.prompt}
                      </p>
                      <div className="flex flex-wrap justify-center gap-2">
                        {Object.entries(generationResult.parameters).map(([key, value]) => (
                          <span key={key} className="px-2 py-1 bg-primary/10 text-primary rounded text-xs">
                            {key}: {String(value)}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default GenerateVideo;