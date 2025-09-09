import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const GenerateVideo = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const hasStartedGeneration = useRef(false);

  // Get parameters from URL
  const prompt = searchParams.get('prompt');
  const parametersString = searchParams.get('parameters');

  useEffect(() => {
    if (!prompt || !parametersString) {
      toast.error("Invalid generation parameters");
      navigate('/');
      return;
    }

    // Prevent multiple generations
    if (hasStartedGeneration.current) {
      return;
    }

    try {
      const parameters = JSON.parse(decodeURIComponent(parametersString));
      hasStartedGeneration.current = true;
      handleGenerate(prompt, parameters);
    } catch (error) {
      toast.error("Invalid parameters format");
      navigate('/');
    }
  }, [prompt, parametersString, navigate]);

  const handleGenerate = async (prompt: string, parameters: any) => {
    setIsGenerating(true);
    setGenerationError(null);

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

      toast.success(`${isVideo ? 'Video' : 'Image'} generated successfully!`);
      
      // Redirect to video display page after successful generation
      const redirectParams = new URLSearchParams({
        url: data.type === 'video' ? data.content : `data:image/${data.format};base64,${data.content}`,
        prompt: data.prompt,
        type: data.type,
        format: data.format,
        parameters: JSON.stringify(data.parameters)
      });
      
      // Small delay to show success message
      setTimeout(() => {
        navigate(`/video?${redirectParams.toString()}`);
      }, 1500);
    } catch (error: any) {
      console.error('Generation error:', error);
      setGenerationError(error.message || 'Failed to generate content');
      toast.error(error.message || 'Failed to generate content');
      hasStartedGeneration.current = false; // Allow retry
    } finally {
      setIsGenerating(false);
    }
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
          </div>

          {/* Generation Content */}
          <Card className="w-full">
            <CardContent className="p-8">
              {isGenerating && (
                <div className="text-center py-16">
                  <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
                  <h2 className="text-2xl font-semibold mb-2">
                    Generating Content...
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    This may take up to 2 minutes. Please be patient while we create your content.
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
                  <Button onClick={goBack} variant="outline">
                    Go Back
                  </Button>
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