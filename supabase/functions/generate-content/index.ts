import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const runwayApiKey = Deno.env.get('RUNWAY_API_KEY');

interface GenerationRequest {
  prompt: string;
  parameters: {
    Format?: string;
    Scale?: string;
    Length?: string;
    'Video Style'?: string;
    Background?: string;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, parameters }: GenerationRequest = await req.json();
    console.log('Generation request:', { prompt, parameters });

    const isVideoGeneration = parameters.Format === 'Video';

    if (isVideoGeneration) {
      // Generate video using Runway ML
      const videoResult = await generateVideo(prompt, parameters);
      return new Response(JSON.stringify(videoResult), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      // Generate image using OpenAI
      const imageResult = await generateImage(prompt, parameters);
      return new Response(JSON.stringify(imageResult), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error('Error in generate-content function:', error);
    return new Response(JSON.stringify({ 
      error: 'Generation failed', 
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function generateImage(prompt: string, parameters: any) {
  if (!openAIApiKey) {
    throw new Error('OpenAI API key not configured');
  }

  // Map scale to image dimensions
  const getDimensions = (scale: string) => {
    switch (scale) {
      case '2:3': return { width: 1024, height: 1536 };
      case '16:9': return { width: 1792, height: 1024 };
      case '1:1':
      default: return { width: 1024, height: 1024 };
    }
  };

  const dimensions = getDimensions(parameters.Scale || '1:1');
  
  // Enhance prompt for food photography
  const enhancedPrompt = `Professional food photography: ${prompt}. ${parameters.Background ? `Background: ${parameters.Background}.` : ''} Studio lighting, high resolution, appetizing presentation, commercial quality.`;

  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-image-1',
      prompt: enhancedPrompt,
      n: 1,
      size: `${dimensions.width}x${dimensions.height}`,
      quality: 'high',
      output_format: 'png',
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error('OpenAI API error:', errorData);
    throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();
  console.log('OpenAI response received');

  return {
    type: 'image',
    content: data.data[0].b64_json,
    format: 'png',
    parameters,
    prompt: enhancedPrompt
  };
}

async function generateVideo(prompt: string, parameters: any) {
  if (!runwayApiKey) {
    throw new Error('Runway API key not configured');
  }

  // Map length to duration
  const getDuration = (length: string) => {
    switch (length) {
      case '1s': return 1;
      case '2s': return 2;
      case '5s': return 5;
      case '10s': return 10;
      case '15s': return 15;
      default: return 5;
    }
  };

  // Map scale to aspect ratio
  const getAspectRatio = (scale: string) => {
    switch (scale) {
      case '2:3': return '768:1344';
      case '16:9': return '1408:768';
      case '1:1':
      default: return '1024:1024';
    }
  };

  const duration = getDuration(parameters.Length || '5s');
  const aspectRatio = getAspectRatio(parameters.Scale || '1:1');
  
  // Enhance prompt for food video
  const enhancedPrompt = `${prompt}. ${parameters['Video Style'] ? `Style: ${parameters['Video Style']}.` : ''} ${parameters.Background ? `Background: ${parameters.Background}.` : ''} High quality food cinematography, smooth motion, professional lighting.`;

  console.log('Generating video with Runway:', { duration, aspectRatio, prompt: enhancedPrompt });

  // Create video generation task
  const createResponse = await fetch('https://api.runwayml.com/v1/image_to_video', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${runwayApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      promptText: enhancedPrompt,
      model: 'gen3a_turbo',
      duration: duration,
      ratio: aspectRatio,
      seed: Math.floor(Math.random() * 1000000),
    }),
  });

  if (!createResponse.ok) {
    const errorData = await createResponse.json();
    console.error('Runway API error (create):', errorData);
    throw new Error(`Runway API error: ${errorData.message || 'Unknown error'}`);
  }

  const createData = await createResponse.json();
  const taskId = createData.id;
  console.log('Runway task created:', taskId);

  // Poll for completion
  let attempts = 0;
  const maxAttempts = 60; // 5 minutes max wait time
  
  while (attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
    
    const statusResponse = await fetch(`https://api.runwayml.com/v1/tasks/${taskId}`, {
      headers: {
        'Authorization': `Bearer ${runwayApiKey}`,
      },
    });

    if (!statusResponse.ok) {
      console.error('Failed to check task status');
      attempts++;
      continue;
    }

    const statusData = await statusResponse.json();
    console.log(`Task status (attempt ${attempts + 1}):`, statusData.status);

    if (statusData.status === 'SUCCEEDED') {
      return {
        type: 'video',
        content: statusData.output?.[0],
        format: 'mp4',
        parameters,
        prompt: enhancedPrompt,
        duration,
        taskId
      };
    } else if (statusData.status === 'FAILED') {
      throw new Error(`Video generation failed: ${statusData.failure_reason || 'Unknown error'}`);
    }

    attempts++;
  }

  throw new Error('Video generation timed out');
}