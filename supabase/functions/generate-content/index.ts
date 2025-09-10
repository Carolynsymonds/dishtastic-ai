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
    const requestId = crypto.randomUUID();
    const startedAt = Date.now();
    const { prompt, parameters }: GenerationRequest = await req.json();
    console.log('[generate-content]', { requestId, event: 'request_received', hasOPENAI: !!openAIApiKey, hasRUNWAY: !!runwayApiKey, parameters, promptPreview: (prompt || '').slice(0, 120) });

    const isVideoGeneration = parameters.Format === 'Video';

    if (isVideoGeneration) {
      // Generate video using Runway ML
      const videoStart = Date.now();
      const videoResult = await generateVideo(prompt, parameters);
      console.log('[generate-content]', { requestId, event: 'video_generated', ms: Date.now() - videoStart });
      return new Response(JSON.stringify(videoResult), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json', 'x-request-id': requestId },
      });
    } else {
      // Generate image using OpenAI
      const imageStart = Date.now();
      const imageResult = await generateImage(prompt, parameters);
      console.log('[generate-content]', { requestId, event: 'image_generated', ms: Date.now() - imageStart });
      return new Response(JSON.stringify(imageResult), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json', 'x-request-id': requestId },
      });
    }
  } catch (error) {
    const err = error as any;
    console.error('[generate-content]', { event: 'error', message: err?.message, stack: err?.stack });
    return new Response(JSON.stringify({ 
      error: 'Generation failed', 
      details: err?.message || 'Unknown error' 
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
  console.log('generateImage: dimensions/scale/bg', { dimensions, scale: parameters.Scale || '1:1', background: parameters.Background || 'none' });
  // Enhance prompt for food photography
  const enhancedPrompt = `Professional food photography: ${prompt}. ${parameters.Background ? `Background: ${parameters.Background}.` : ''} Studio lighting, high resolution, appetizing presentation, commercial quality.`;
  
  // Try gpt-image-1 first, fallback to dall-e-3 if org verification fails
  console.log('generateImage: trying gpt-image-1 first');
  try {
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
    console.log('generateImage: gpt-image-1 response', { status: response.status, statusText: response.statusText });
    
    if (response.ok) {
      const data = await response.json();
      console.log('generateImage: gpt-image-1 success');
      return {
        type: 'image',
        content: data.data[0].b64_json,
        format: 'png',
        parameters,
        prompt: enhancedPrompt
      };
    } else {
      const errorData = await response.json();
      console.log('generateImage: gpt-image-1 failed, checking if org verification issue');
      
      // Check if it's an organization verification error
      if (errorData.error?.message?.includes('organization must be verified')) {
        console.log('generateImage: org verification issue detected, falling back to dall-e-3');
        // Fall back to dall-e-3
        return await generateImageFallback(enhancedPrompt, parameters);
      } else {
        console.error('generateImage: gpt-image-1 failed with other error:', errorData);
        throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
      }
    }
  } catch (error) {
    console.error('generateImage: gpt-image-1 request failed:', error);
    console.log('generateImage: falling back to dall-e-3');
    return await generateImageFallback(enhancedPrompt, parameters);
  }
}

async function generateImageFallback(prompt: string, parameters: any) {
  console.log('generateImageFallback: using dall-e-3');

  // DALL-E-3 only supports 1024x1024, 1792x1024, 1024x1792
  const scale = parameters.Scale || '1:1';
  const size = scale === '2:3' ? '1024x1792' : scale === '16:9' ? '1792x1024' : '1024x1024';
  console.log('generateImageFallback: resolved size for dall-e-3', { scale, size });

  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'dall-e-3',
      prompt: prompt,
      n: 1,
      size,
      quality: 'hd',
      response_format: 'b64_json',
    }),
  });
  
  console.log('generateImageFallback: dall-e-3 response', { status: response.status, statusText: response.statusText });
  if (!response.ok) {
    const errorData = await response.json();
    console.error('generateImageFallback: dall-e-3 failed:', errorData);
    throw new Error(`DALL-E-3 API error: ${errorData.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();
  console.log('generateImageFallback: dall-e-3 success');

  return {
    type: 'image',
    content: data.data[0].b64_json,
    format: 'png',
    parameters,
    prompt: prompt
  };
}

async function enhancePromptWithAI(prompt: string, parameters: any): Promise<string> {
  if (!openAIApiKey) {
    console.log('OpenAI API key not available, using enhanced fallback');
    return createMotionPrompt(prompt, parameters);
  }

  try {
    const systemPrompt = `You are a professional food content creator specializing in realistic, appetizing culinary visuals. Convert the user's description and parameters into a JSON creative brief for photoreal, mouth-watering food imagery that focuses on authentic cooking processes and natural food behavior.

Rules:
- Return **valid JSON only**, no explanations.
- Follow this schema exactly:

{
  "mode": "video | image",
  "dish": {
    "name": "string",
    "cuisine": "string | null",
    "dish_type": "pasta | soup | noodles | steak | dessert | pastry | salad | pizza | bowl | sandwich | rice | fries | seafood | tacos | bbq | curry | other",
    "key_ingredients": ["string"],
    "textures": ["string"]
  },
  "visual_direction": {
    "motion_style": "Ingredient Cascade | Steam Rising | Liquid Flow | Cheese Stretch | Sizzle Effect | Natural Motion | Falling Elements | Texture Reveal | Color Enhancement | Aromatic Steam | none",
    "framing": "macro close-up | three-quarter | overhead | side-on",
    "angle": "eye-level | top-down | 45-degree"
  },
  "setting": {
    "background": "Plain | Home Kitchen | Chef's Pass | Fine Dining | Farm Table | Coffee Shop | Garden Picnic | Rooftop Bar | Market Stand | Fastfood Venue | Hotel Buffet | Food Truck | Casual Diner | Family Dinner",
    "servingware": "string",
    "props": ["string"],
    "lighting": "string",
    "mood": "string"
  },
  "tabletop": {
    "surface_material": "marble | rustic wood | lacquered wood | slate | stainless steel | terrazzo | linen-covered | laminate | bamboo",
    "surface_color": "string",
    "linens": "none | natural linen napkin | crisp white tablecloth | paper liner",
    "cutlery": "polished stainless | brushed brass | black matte | stainless chopsticks & spoon | none",
    "glassware": "none | water tumbler | wine glass | beer glass | tea cup",
    "plate_style": "classic white rimmed | rustic stoneware | modern coupe | bamboo tray | cast-iron skillet | diner china | lacquered tray",
    "garnish_style": "minimalist | abundant | rustic scatter | fine-dining microgreens",
    "color_palette": ["string"]
  },
  "people": {
    "presence": "none | chef hands | diners",
    "action": "string | null"
  },
  "tech": {
    "aspect_ratio": "16:9 | 3:2 | 1:1 | 2:3 | 9:16",
    "duration_seconds": "number | null",
    "fps": "number | null",
    "style_strength": "realistic | cinematic | stylized",
    "lens": "string",
    "depth_of_field": "shallow | medium | deep",
    "negative_prompts": ["string"]
  },
  "runway_prompt": "string",
  "runway_params": {
    "aspect_ratio": "16:9 | 3:2 | 1:1 | 2:3 | 9:16",
    "seconds": "number | null",
    "seed": "number"
  }
}

Heuristics:
- If Format = "Video", set "mode": "video" and use Length (in seconds) as "duration_seconds".  
- If Format = "Image", set "mode": "image" and "duration_seconds": null.  
- Map Video Style to "motion_style" focusing on food behavior, not filming techniques.  
- Use Background for "setting.background".  
- Infer plateware & tabletop style from cuisine, dish_type, and background.  
- Focus on realistic food physics: steam rising naturally, ingredients falling gracefully, liquids flowing smoothly, cheese stretching authentically.  
- Always include tabletop details that enhance food presentation.  
- Negative prompts: artificial look, plastic appearance, unrealistic proportions, equipment visible, technical gear.  
- runway_prompt must describe **realistic food behavior and cooking processes** - steam patterns, ingredient interactions, natural textures, authentic colors, and appetizing motion without mentioning filming equipment.`;

    const userPrompt = `User description: ${prompt}
Format: ${parameters.Format || 'Image'}
Scale: ${parameters.Scale || '1:1'}
Length: ${parameters.Length || '5s'}
Video Style: ${parameters['Video Style'] || 'none'}
Background: ${parameters.Background || 'Plain'}`;

    console.log('Sending enhanced prompt request to OpenAI');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_completion_tokens: 800,
      }),
    });
    console.log('enhancePromptWithAI: OpenAI chat response', { status: response.status, statusText: response.statusText });

    if (!response.ok) {
      console.error('OpenAI API error, falling back to basic enhancement');
      throw new Error('OpenAI API error');
    }

    const data = await response.json();
    let jsonResponse = data.choices[0].message.content;

    console.log('Raw OpenAI response:', jsonResponse);

    // Clean up the response in case it has markdown formatting
    jsonResponse = jsonResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    try {
      const parsedJson = JSON.parse(jsonResponse);
      console.log('Successfully parsed JSON response:', parsedJson);
      
      // Extract the runway_prompt from the JSON
      const runwayPrompt = parsedJson.runway_prompt;
      
      if (!runwayPrompt) {
        console.warn('No runway_prompt found in JSON, falling back');
        throw new Error('Missing runway_prompt in JSON response');
      }

      console.log('Using runway_prompt:', runwayPrompt);
      return runwayPrompt;
      
    } catch (parseError) {
      console.error('Failed to parse JSON response:', parseError);
      console.error('Raw response was:', jsonResponse);
      // Fallback to basic enhancement
      throw parseError;
    }

  } catch (error) {
    console.error('Error enhancing prompt with AI:', error);
    // Fallback to enhanced motion-specific prompt
    return createMotionPrompt(prompt, parameters);
  }
}

function createMotionPrompt(prompt: string, parameters: any): string {
  const videoStyle = parameters['Video Style'];
  const background = parameters.Background;
  
  // Realistic food behavior instructions for each video style
  const motionInstructions = {
    'Ingredient Drop': 'Fresh ingredients gracefully cascading through the air with natural physics, landing softly into the dish creating beautiful splashes and gentle movements as they settle into place',
    'Slow-Mo Pour': 'Liquid flowing in elegant slow motion with smooth, natural curves and realistic viscosity, creating mesmerizing patterns as it streams into the dish with authentic splash dynamics',
    'Steam Rising': 'Delicate steam naturally rising from hot food in organic, wispy patterns, dancing upward with realistic heat convection, creating an appetizing visual of freshly prepared warmth',
    'Cheese Pull': 'Melted cheese stretching authentically with golden, elastic strands that flow naturally with realistic texture, showing the perfect melt and appetizing stretch without any artificial tension',
    'Sizzle Effect': 'Food naturally sizzling with authentic bubbling, gentle steam wisps, and realistic heat effects that create an appetizing sensory experience of active cooking',
    'Garnish Drop': 'Fresh herbs or seasonings gently falling through the air with natural grace, landing delicately on the dish surface with realistic scatter patterns',
    'Liquid Drizzle': 'Sauce, oil, or honey flowing in smooth streams with natural viscosity and authentic dripping patterns that enhance the dish\'s appetizing appearance',
    'Whisk Action': 'Ingredients naturally swirling and blending with realistic fluid dynamics, creating appetizing textures and natural mixing patterns'
  };
  
  const motionInstruction = motionInstructions[videoStyle as keyof typeof motionInstructions] || 'natural, appetizing food motion with realistic cooking behavior and authentic culinary physics';
  
  // Background-specific enhancements
  const backgroundEnhancement = background ? `Set in a beautiful ${background} environment that complements the food presentation.` : '';
  
  // Create realistic food behavior prompt
  return `Stunning food videography showcasing: ${prompt}. ${backgroundEnhancement} The scene features ${motionInstruction}. Professional lighting highlights natural textures, vibrant colors, and appetizing details. The focus is on authentic cooking processes and realistic food physics that make the dish look incredibly fresh and delicious.`;
}

function createMotionImagePrompt(prompt: string, parameters: any): string {
  const videoStyle = parameters['Video Style'];
  const background = parameters.Background;
  
  // Create image prompts optimized for realistic motion generation
  const motionSetups = {
    'Ingredient Drop': 'Fresh ingredients naturally positioned above the dish with perfect spacing for graceful falling motion, arranged to showcase natural physics and authentic ingredient behavior',
    'Slow-Mo Pour': 'Liquid captured at the perfect pouring moment with realistic trajectory, positioned for smooth, natural flowing motion with authentic viscosity and stream patterns',
    'Steam Rising': 'Freshly prepared hot dish with natural steam patterns beginning to rise, positioned to show authentic heat emanation and organic vapor movement',
    'Cheese Pull': 'Perfectly melted cheese in natural stretch position with golden, elastic texture, arranged for authentic cheese-pulling motion that showcases realistic dairy physics',
    'Sizzle Effect': 'Food positioned in hot cooking environment with natural heat effects and authentic bubbling patterns that suggest realistic cooking processes',
    'Garnish Drop': 'Fresh herbs or seasonings naturally positioned above the dish with perfect spacing for graceful falling motion and authentic scatter patterns',
    'Liquid Drizzle': 'Sauce, honey, or oil positioned for natural drizzling motion with realistic viscosity patterns and authentic flow behavior',
    'Whisk Action': 'Ingredients arranged in natural mixing position with authentic textures that suggest realistic blending and fluid dynamics'
  };
  
  const motionSetup = motionSetups[videoStyle as keyof typeof motionSetups] || 'Food beautifully arranged for natural, appetizing motion and authentic culinary behavior';
  const backgroundEnhancement = background ? `Set in a stunning ${background} environment that enhances the food presentation.` : '';
  
  return `Professional food photography: ${prompt}. ${backgroundEnhancement} ${motionSetup}. The composition emphasizes realistic food physics and natural culinary processes with perfect lighting that showcases authentic textures, vibrant colors, and appetizing details optimized for the most realistic motion generation.`;
}

async function generateImageWithPrompt(customPrompt: string, parameters: any) {
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
  
  // Try gpt-image-1 first, fallback to dall-e-3 if org verification fails
  try {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-image-1',
        prompt: customPrompt,
        n: 1,
        size: `${dimensions.width}x${dimensions.height}`,
        quality: 'high',
        output_format: 'png',
      }),
    });
    
    if (response.ok) {
      const data = await response.json();
      return {
        type: 'image',
        content: data.data[0].b64_json,
        format: 'png',
        parameters,
        prompt: customPrompt
      };
    } else {
      // Fall back to dall-e-3
      return await generateImageFallback(customPrompt, parameters);
    }
  } catch (error) {
    return await generateImageFallback(customPrompt, parameters);
  }
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

  // Map scale to aspect ratio (must match Runway exact requirements: 768:1280 or 1280:768 only)
  const getAspectRatio = (scale: string) => {
    switch (scale) {
      case 'Portrait':
      case '2:3': 
      case '9:16': 
        return '768:1280'; // Portrait
      case 'Landscape':
      case '16:9': 
        return '1280:768'; // Landscape
      case 'Square':
      case '1:1': 
      default: 
        return '768:1280'; // Default to portrait since 1:1 not supported
    }
  };

  const duration = getDuration(parameters.Length || '5s');
  const aspectRatio = getAspectRatio(parameters.Scale || '1:1');
  console.log('generateVideo: config', { duration, aspectRatio, length: parameters.Length || '5s', scale: parameters.Scale || '1:1' });
  
  // Enhance prompt using OpenAI or fallback
  const enhancedPrompt = await enhancePromptWithAI(prompt, parameters);

  // Generate a motion-optimized starter image to satisfy Runway's promptImage requirement
  const motionImagePrompt = createMotionImagePrompt(prompt, parameters);
  const starterImage = await generateImageWithPrompt(motionImagePrompt, parameters);
  const promptImage = `data:image/${starterImage.format || 'png'};base64,${starterImage.content}`;

  console.log('Generating video with Runway:', { duration, aspectRatio, promptUsed: enhancedPrompt ? 'enhanced' : 'basic' });

  try {
    // Create video generation task
    const createResponse = await fetch('https://api.dev.runwayml.com/v1/image_to_video', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${runwayApiKey}`,
        'Content-Type': 'application/json',
        'X-Runway-Version': '2024-11-06',
      },
        body: JSON.stringify({
          promptImage,
          promptText: enhancedPrompt,
          model: 'gen3a_turbo',
          duration: duration,
          ratio: aspectRatio,
          seed: Math.floor(Math.random() * 1000000),
        }),
    });
    console.log('Runway create task response', { status: createResponse.status, statusText: createResponse.statusText, triedRatio: aspectRatio });

    if (!createResponse.ok) {
      let errorPayload: any = null;
      try { errorPayload = await createResponse.json(); } catch (_) { errorPayload = { raw: await createResponse.text() }; }
      console.error('Runway API error (create) payload:', errorPayload);
      throw new Error(`Runway API error: ${errorPayload?.message || errorPayload?.error || 'Unknown error'}`);
    }

    const createData = await createResponse.json();
    const taskId = createData.id;
    console.log('Runway task created:', taskId);

    // Poll for completion
    let attempts = 0;
    const maxAttempts = 60; // 5 minutes max wait time
    
    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
      
      const statusResponse = await fetch(`https://api.dev.runwayml.com/v1/tasks/${taskId}`, {
        headers: {
          'Authorization': `Bearer ${runwayApiKey}`,
          'X-Runway-Version': '2024-11-06',
        },
      });

      if (!statusResponse.ok) {
        console.error('Failed to check task status', { attempt: attempts + 1 });
        attempts++;
        continue;
      }

      const statusData = await statusResponse.json();
      console.log(`Task status (attempt ${attempts + 1}):`, statusData.status, statusData.failure_reason ? `reason: ${statusData.failure_reason}` : '');
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
  } catch (err) {
    console.error('[generate-content] Runway video generation failed, falling back to starter image', { error: (err as any)?.message || String(err), triedRatio: aspectRatio, duration });
    // Graceful fallback: return the starter image so the UI can still render
    return {
      type: 'image',
      content: starterImage.content,
      format: starterImage.format || 'png',
      parameters,
      prompt: enhancedPrompt,
      // @ts-ignore - extra metadata for debugging
      fallback: true,
      // @ts-ignore
      fallback_reason: 'runway_error'
    };
  }
}