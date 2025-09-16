import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation schema
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

function validateRequest(body: any): GenerationRequest {
  if (!body || typeof body !== 'object') {
    throw new Error('Request body must be a valid JSON object');
  }

  if (!body.prompt || typeof body.prompt !== 'string') {
    throw new Error('Prompt is required and must be a string');
  }

  if (body.prompt.length > 2000) {
    throw new Error('Prompt must be less than 2000 characters');
  }

  if (body.parameters && typeof body.parameters !== 'object') {
    throw new Error('Parameters must be an object if provided');
  }

  return {
    prompt: body.prompt.trim(),
    parameters: body.parameters || {}
  };
}

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const runwayApiKey = Deno.env.get('RUNWAY_API_KEY');
const falApiKey = Deno.env.get('FAL_API_KEY');
const lumaApiKey = Deno.env.get('LUMA_API_KEY');
const geminiApiKey = "AIzaSyDIBdPag5MJxyfmB7q5iM9CSdaKRJkHBfg";

interface DishInfo {
  name: string;
  canonicalIngredients: string[];
  forbiddenIngredients: string[];
  cuisine: string;
  type: string;
  signatureTechnique?: string;
  culturalContext?: string;
  visualSignature?: string;
  heroIngredients?: string[];
  textureKeywords?: string[];
}

// Enhanced dish database with signature techniques and visual focus for personalized video generation  
const DISH_DB: Record<string, DishInfo & { signatureTechnique: string; culturalContext: string; visualSignature: string; heroIngredients: string[]; textureKeywords: string[] }> = {
  // Italian Pasta Dishes
  'carbonara': {
    name: 'Carbonara',
    canonicalIngredients: ['fresh pasta', 'eggs', 'pecorino romano cheese', 'guanciale', 'black pepper'],
    forbiddenIngredients: ['cream', 'garlic', 'bacon', 'parmesan', 'peas', 'mushrooms'],
    cuisine: 'Italian',
    type: 'pasta',
    signatureTechnique: 'The Emulsion Moment - Raw eggs meeting hot pasta to create silky carbonara sauce through precise temperature control',
    culturalContext: 'Roman trattorias where shepherds created this dish using available ingredients',
    visualSignature: 'Creamy golden pasta ribbons coated in silky egg sauce, black pepper specks, crispy guanciale pieces',
    heroIngredients: ['silky egg sauce', 'crispy guanciale', 'al dente pasta'],
    textureKeywords: ['silky', 'creamy', 'al dente', 'crispy', 'glossy']
  },
  'aglio e olio': {
    name: 'Aglio e Olio',
    canonicalIngredients: ['spaghetti', 'garlic', 'olive oil', 'red pepper flakes', 'parsley'],
    forbiddenIngredients: ['cream', 'cheese', 'tomatoes', 'meat'],
    cuisine: 'Italian',
    type: 'pasta',
    signatureTechnique: 'The Golden Oil Dance - Garlic slowly transforming in olive oil, creating aromatic perfection without burning',
    culturalContext: 'Neapolitan midnight dish made from pantry staples',
    visualSignature: 'Golden spaghetti glistening with olive oil, golden garlic slivers, red pepper flakes, bright green parsley',
    heroIngredients: ['golden garlic slivers', 'glistening olive oil', 'perfectly cooked spaghetti'],
    textureKeywords: ['glistening', 'golden', 'aromatic', 'silky', 'al dente']
  },
  'cacio e pepe': {
    name: 'Cacio e Pepe',
    canonicalIngredients: ['spaghetti', 'pecorino romano', 'black pepper', 'pasta water'],
    forbiddenIngredients: ['garlic', 'oil', 'butter', 'cream', 'parmesan'],
    cuisine: 'Italian',
    type: 'pasta',
    signatureTechnique: 'The Mantecatura - Starchy pasta water binding with cheese to create creamy perfection without cream',
    culturalContext: 'Ancient Roman technique using sheep cheese and pepper from trade routes'
  },
  'amatriciana': {
    name: 'Amatriciana',
    canonicalIngredients: ['pasta', 'guanciale', 'tomatoes', 'pecorino romano', 'red pepper flakes'],
    forbiddenIngredients: ['garlic', 'onions', 'bacon', 'cream'],
    cuisine: 'Italian',
    type: 'pasta',
    signatureTechnique: 'Guanciale Rendering - Crispy pork jowl releasing its fat to create the sauce base',
    culturalContext: 'Shepherds from Amatrice using preserved pork and tomatoes'
  },
  'bolognese': {
    name: 'Bolognese',
    canonicalIngredients: ['ground beef', 'ground pork', 'carrots', 'celery', 'onions', 'tomatoes', 'red wine', 'milk'],
    forbiddenIngredients: ['garlic', 'herbs', 'bell peppers'],
    cuisine: 'Italian',
    type: 'pasta',
    signatureTechnique: 'The Soffritto Foundation - Holy trinity of vegetables building deep flavor through slow cooking',
    culturalContext: 'Bolognese kitchens where the sauce simmers for hours to achieve perfect richness'
  },

  // Asian Dishes
  'pad thai': {
    name: 'Pad Thai',
    canonicalIngredients: ['rice noodles', 'shrimp', 'tofu', 'eggs', 'bean sprouts', 'tamarind paste', 'fish sauce', 'palm sugar'],
    forbiddenIngredients: ['soy sauce', 'oyster sauce', 'broccoli'],
    cuisine: 'Thai',
    type: 'noodles',
    signatureTechnique: 'Wok Hei Fire Kiss - High-heat stir-frying imparting smoky essence and perfect texture',
    culturalContext: 'Bangkok street vendors mastering the balance of sweet, sour, salty, and spicy',
    visualSignature: 'Glossy rice noodles with caramelized edges, pink shrimp, golden tofu, fresh bean sprouts, lime wedge',
    heroIngredients: ['glossy rice noodles', 'caramelized shrimp', 'golden scrambled eggs'],
    textureKeywords: ['glossy', 'caramelized', 'smoky', 'tender', 'crisp']
  },
  'ramen': {
    name: 'Ramen',
    canonicalIngredients: ['ramen noodles', 'pork broth', 'chashu pork', 'soft-boiled eggs', 'green onions', 'nori', 'bamboo shoots'],
    forbiddenIngredients: ['chicken broth', 'beef', 'hard-boiled eggs'],
    cuisine: 'Japanese',
    type: 'noodles',
    signatureTechnique: 'Broth Layering Symphony - Each component building the perfect umami harmony',
    culturalContext: 'Japanese ramen masters spending decades perfecting their secret broth recipes'
  },
  'fried rice': {
    name: 'Fried Rice',
    canonicalIngredients: ['day-old rice', 'eggs', 'soy sauce', 'green onions', 'sesame oil'],
    forbiddenIngredients: ['fresh rice', 'cream', 'cheese'],
    cuisine: 'Chinese',
    type: 'rice',
    signatureTechnique: 'Day-Old Rice Resurrection - Individual grains separating and crisping in the wok\'s embrace',
    culturalContext: 'Chinese home cooks transforming leftover rice into golden perfection'
  },

  // Mexican Dishes
  'tacos': {
    name: 'Tacos',
    canonicalIngredients: ['corn tortillas', 'meat', 'onions', 'cilantro', 'lime', 'salsa'],
    forbiddenIngredients: ['flour tortillas', 'lettuce', 'cheese', 'sour cream'],
    cuisine: 'Mexican',
    type: 'tacos',
    signatureTechnique: 'Tortilla Warming Alchemy - Corn tortillas gaining flexibility and flavor over flame',
    culturalContext: 'Mexican taquerias where simplicity and quality ingredients create perfection'
  },
  'guacamole': {
    name: 'Guacamole',
    canonicalIngredients: ['avocados', 'lime juice', 'onions', 'cilantro', 'jalapeños', 'salt'],
    forbiddenIngredients: ['mayo', 'sour cream', 'peas'],
    cuisine: 'Mexican',
    type: 'other',
    signatureTechnique: 'The Molcajete Crush - Stone mortar releasing avocado oils while maintaining perfect texture',
    culturalContext: 'Aztec origins where avocados were prepared with volcanic stone tools'
  },

  // American Dishes
  'burger': {
    name: 'Burger',
    canonicalIngredients: ['ground beef', 'burger buns', 'lettuce', 'tomato', 'onions', 'pickles'],
    forbiddenIngredients: ['chicken', 'turkey'],
    cuisine: 'American',
    type: 'sandwich',
    signatureTechnique: 'The Maillard Sear - High-heat caramelization creating the perfect crust',
    culturalContext: 'American diners where the perfect patty meets flame for that iconic sear',
    visualSignature: 'Juicy beef patty with perfect sear marks, melted cheese dripping, fresh lettuce, ripe tomato slices, toasted bun',
    heroIngredients: ['seared beef patty', 'melted cheese', 'toasted brioche bun'],
    textureKeywords: ['juicy', 'seared', 'melted', 'crispy', 'toasted']
  },
  'mac and cheese': {
    name: 'Mac and Cheese',
    canonicalIngredients: ['macaroni', 'cheddar cheese', 'milk', 'butter', 'flour'],
    forbiddenIngredients: ['cream cheese', 'mozzarella only'],
    cuisine: 'American',
    type: 'pasta',
    signatureTechnique: 'Roux Foundation - Flour and butter creating the silky cheese sauce base',
    culturalContext: 'American comfort food tradition from colonial kitchens to modern tables'
  },

  // French Dishes
  'french omelette': {
    name: 'French Omelette',
    canonicalIngredients: ['eggs', 'butter', 'salt', 'chives'],
    forbiddenIngredients: ['milk', 'cream', 'cheese filling'],
    cuisine: 'French',
    type: 'other',
    signatureTechnique: 'The Gentle Scramble - Low heat and constant motion creating silk-like texture',
    culturalContext: 'French culinary schools where this technique separates novices from masters'
  },
  'croissant': {
    name: 'Croissant',
    canonicalIngredients: ['flour', 'butter', 'yeast', 'milk', 'sugar', 'salt'],
    forbiddenIngredients: ['oil', 'margarine'],
    cuisine: 'French',
    type: 'pastry',
    signatureTechnique: 'Lamination Magic - Butter layers creating hundreds of flaky sheets',
    culturalContext: 'Parisian bakeries where dawn brings the aroma of fresh-baked perfection'
  },

  // Indian Dishes
  'butter chicken': {
    name: 'Butter Chicken',
    canonicalIngredients: ['chicken', 'tomatoes', 'cream', 'butter', 'garam masala', 'ginger', 'garlic'],
    forbiddenIngredients: ['coconut milk', 'yogurt as base'],
    cuisine: 'Indian',
    type: 'curry',
    signatureTechnique: 'Tandoori Char Integration - Smoky grilled chicken melding with creamy tomato sauce',
    culturalContext: 'Delhi restaurants where Mughlai techniques meet modern innovation'
  },
  'biryani': {
    name: 'Biryani',
    canonicalIngredients: ['basmati rice', 'meat', 'saffron', 'yogurt', 'onions', 'whole spices'],
    forbiddenIngredients: ['regular rice', 'cream'],
    cuisine: 'Indian',
    type: 'rice',
    signatureTechnique: 'Dum Cooking Transformation - Steam pressure melding rice and meat into aromatic unity',
    culturalContext: 'Hyderabad kitchens where Persian techniques created the ultimate rice dish'
  }
};

function parseDishName(prompt: string): DishInfo | null {
  const lowerPrompt = prompt.toLowerCase();
  
  // Try to find exact matches first
  for (const [key, dishInfo] of Object.entries(DISH_DB)) {
    if (lowerPrompt.includes(key)) {
      return dishInfo;
    }
  }
  
  // Try partial matches for compound names
  const dishNames = Object.keys(DISH_DB);
  for (const dishName of dishNames) {
    const words = dishName.split(' ');
    if (words.length > 1 && words.every(word => lowerPrompt.includes(word))) {
      return DISH_DB[dishName];
    }
  }
  
  return null;
}

function sanitizePromptForDish(prompt: string, originalPrompt: string): string {
  const dishInfo = parseDishName(originalPrompt);
  
  if (!dishInfo || dishInfo.forbiddenIngredients.length === 0) {
    return prompt;
  }
  
  let sanitizedPrompt = prompt;
  
  // Remove forbidden ingredients from the prompt
  for (const forbidden of dishInfo.forbiddenIngredients) {
    const regex = new RegExp(`\\b${forbidden.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    sanitizedPrompt = sanitizedPrompt.replace(regex, '');
  }
  
  // Clean up any double spaces or punctuation issues
  sanitizedPrompt = sanitizedPrompt.replace(/\s+/g, ' ').replace(/,\s*,/g, ',').trim();
  
  console.log(`Sanitized prompt for ${dishInfo.name}: removed [${dishInfo.forbiddenIngredients.join(', ')}]`);
  
  return sanitizedPrompt;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log(`[GENERATE-CONTENT] ${req.method} request received`);

  try {
    // Validate request method
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Parse and validate request body
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (e) {
      return new Response(JSON.stringify({ error: 'Invalid JSON in request body' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const validatedInput = validateRequest(requestBody);
    console.log(`[GENERATE-CONTENT] Processing request for prompt: ${validatedInput.prompt.substring(0, 50)}...`);

    const requestId = crypto.randomUUID();
    const startedAt = Date.now();
    const { prompt, parameters } = validatedInput;
    
    // First declare the variable
    const isVideoGeneration = parameters.Format === 'Video';
    
    console.log('[generate-content]', { requestId, event: 'request_received', hasOPENAI: !!openAIApiKey, hasRUNWAY: !!runwayApiKey, hasFAL: !!falApiKey, hasLUMA: !!lumaApiKey, parameters, promptPreview: (prompt || '').slice(0, 120) });

    console.log('[generate-content]', { 
      requestId,
      event: 'generation_start', 
      format: parameters.Format,
      isVideoGeneration,
      hasLuma: !!lumaApiKey,
      hasRunway: !!runwayApiKey,
      hasOpenAI: !!openAIApiKey,
      parameters: {
        Format: parameters.Format,
        Scale: parameters.Scale,
        Length: parameters.Length,
        uploadedImage: !!parameters.uploadedImage
      }
    });

    if (isVideoGeneration) {
      // Generate video using available services
      const videoStart = Date.now();
      console.log('[generate-content]', { 
        requestId, 
        event: 'video_generation_start',
        availableServices: {
          luma: !!lumaApiKey,
          runway: !!runwayApiKey
        }
      });
      
      const videoResult = await generateVideo(prompt, parameters);
      
      console.log('[generate-content]', { 
        requestId, 
        event: 'video_generation_complete',
        actualType: videoResult.type,
        actualFormat: videoResult.format,
        contentPreview: videoResult.content?.slice(0, 100),
        ms: Date.now() - videoStart,
        isActuallyVideo: videoResult.type === 'video'
      });
      
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
  if (!geminiApiKey) {
    throw new Error('Google AI Studio API key not configured');
  }

  // Map scale to image dimensions and aspect ratio for Google AI Studio Imagen 4.0
  const getDimensionsAndAspectRatio = (scale: string) => {
    switch (scale) {
      case 'Portrait':
        return { width: 1024, height: 1536, aspectRatio: "3:4" }; // Portrait: 3:4 aspect ratio
      case 'Landscape':
        return { width: 1792, height: 1024, aspectRatio: "16:9" }; // Landscape: 16:9 aspect ratio (optimal for food photography)
      case 'Square':
        return { width: 1024, height: 1024, aspectRatio: "1:1" }; // Square: 1:1 aspect ratio
      case '2:3': // Legacy support
        return { width: 1024, height: 1536, aspectRatio: "3:4" };
      case '16:9': // Legacy support
        return { width: 1792, height: 1024, aspectRatio: "16:9" };
      case '1:1': // Legacy support
        return { width: 1024, height: 1024, aspectRatio: "1:1" };
      default:
        return { width: 1792, height: 1024, aspectRatio: "16:9" }; // Default to landscape for images
    }
  };

  const { width, height, aspectRatio } = getDimensionsAndAspectRatio(parameters.Scale || 'Landscape');
  console.log('generateImage: prompt', { prompt });
  console.log('generateImage: Using dimensions and aspect ratio for Google AI Studio:', { width, height, aspectRatio, scale: parameters.Scale || 'Landscape' });
  

  // Enhanced marketing photography prompt
  const enhancedPrompt = `A photo of a restaurant marketing photography of ${prompt}. on a white dish. Make it look perfect and incredibly fresh as though it was just prepared.`
  // Debug log
  console.log('generateImage: using Google AI Studio Imagen 4.0', { enhancedPrompt });

  try {
    // Use the correct Google AI Studio endpoint for Imagen 4.0
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict`, {
      method: 'POST',
      headers: {
        'x-goog-api-key': geminiApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        instances: [
          {
            prompt: enhancedPrompt
          }
        ],
        parameters: {
          sampleCount: 1,
          aspectRatio: aspectRatio,
          dimension: {
            width: width,
            height: height
          }
        }
      }),
    });
    
    console.log('generateImage: Google AI Studio response', { status: response.status, statusText: response.statusText });
    
    // Get response text first to debug
    const responseText = await response.text();
    console.log('generateImage: Raw response text:', responseText.substring(0, 500));
    
    if (response.ok) {
      if (!responseText) {
        throw new Error('Google AI Studio returned empty response');
      }
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('generateImage: JSON parse error:', parseError);
        console.error('generateImage: Response text:', responseText);
        throw new Error('Invalid JSON response from Google AI Studio');
      }
      
      console.log('generateImage: Google AI Studio success, data structure:', Object.keys(data));
      
      // Check if the response has the expected structure for Imagen 4.0
      if (!data.predictions || !Array.isArray(data.predictions) || data.predictions.length === 0) {
        console.error('generateImage: Unexpected response structure:', data);
        throw new Error('Google AI Studio returned unexpected response format');
      }
      
      // Extract base64 image from response (Imagen 4.0 format)
      const prediction = data.predictions[0];
      const imageData = prediction.bytesBase64Encoded;
      
      if (!imageData) {
        console.error('generateImage: No image data in response:', prediction);
        throw new Error('Google AI Studio returned no image data');
      }
      
      return {
        type: 'image',
        content: imageData,
        format: 'png',
        parameters,
        prompt: enhancedPrompt
      };
    } else {
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch (parseError) {
        console.error('generateImage: Error response parse failed:', parseError);
        console.error('generateImage: Error response text:', responseText);
        throw new Error(`Google AI Studio API error (${response.status}): ${responseText}`);
      }
      console.error('generateImage: Google AI Studio failed:', errorData);
      throw new Error(`Google AI Studio API error: ${errorData.error?.message || 'Unknown error'}`);
    }
  } catch (error) {
    console.error('generateImage: Google AI Studio request failed:', error);
    throw error;
  }
}


async function enhancePromptWithAI(prompt: string, parameters: any): Promise<string> {
  if (!openAIApiKey) {
    console.log('OpenAI API key not available, using enhanced fallback');
    return createRestaurantMarketingPrompt(prompt, parameters);
  }

  try {
const systemPrompt = `You are a master dish-focused video marketing specialist creating appetite-inducing content that showcases food as the hero. Your priority is making the DISH the absolute star, with everything else supporting its visual appeal.

DISH-FIRST MARKETING HIERARCHY:
1. DISH DOMINANCE - The dish occupies 90% of visual focus and storytelling
2. INGREDIENT HERO SHOTS - Each key ingredient gets its moment to shine  
3. TEXTURE STORYTELLING - Show the dish's unique textures and transformations
4. APPETITE TRIGGERS - Steam, sizzling, melting, perfect doneness
5. MINIMAL BACKGROUND - Simple, non-competing environments that enhance the dish

DISH-CENTRIC REQUIREMENTS:
- Lead with the dish name and its most appetizing characteristics
- Prioritize ingredient close-ups and texture details over environment
- Show the dish's signature technique or transformation moment
- Focus on what makes this specific dish irresistible and unique
- Eliminate competing visual elements that distract from the food

VISUAL COMPOSITION RULES:
- 90% dish/ingredients, 10% context/background
- Simple, neutral backgrounds (clean white plate, dark surface, natural wood)
- Lighting that enhances food colors and textures
- Camera angles that showcase the dish's most appetizing features
- Steam, melted elements, and perfect doneness as focal points

FORBIDDEN ELEMENTS:
- Busy backgrounds that compete with the dish
- Excessive props or elaborate table settings
- Multiple dishes competing for attention
- Generic cooking without dish-specific focus
- Environments that overshadow the food's visual appeal

Schema (return JSON only):
{
  "dish_focus": {
    "dish_identity": "specific dish name with key visual characteristics",
    "hero_ingredients": "2-3 most visually appealing ingredients that define this dish",
    "signature_moment": "the dish's most appetizing visual transformation or perfect state",
    "texture_story": "specific textures that make this dish irresistible (creamy, crispy, melted, etc.)"
  },
  "visual_hierarchy": {
    "primary_focus": "dish and its key ingredients (90% of visual weight)",
    "secondary_elements": "minimal supporting context (10% of visual weight)",
    "background": "simple, non-competing surface that enhances dish colors",
    "lighting": "focused on highlighting dish textures and colors"
  },
  "appetite_triggers": {
    "steam_effects": "natural steam or heat indicators from the dish",
    "perfect_doneness": "visual cues showing the dish at its optimal state",
    "key_textures": "melted, crispy, glossy, or other appetite-inducing textures",
    "color_vibrancy": "the dish's most appetizing color elements"
  },
  "dish_story": {
    "transformation": "how ingredients become this perfect dish",
    "signature_technique": "what makes this dish preparation special",
    "final_presentation": "the dish at its most irresistible moment"
  },
  "runway_prompt": "dish-focused video showcasing [dish name] as the undisputed hero with minimal distracting elements"
}

Instructions:
- Start every description with the dish name and its visual signature
- Prioritize dish-specific details over generic food styling
- Make the dish 90% of the visual story, background 10%
- Focus on what makes THIS dish unique and appetizing
- runway_prompt must lead with the dish and its hero ingredients
- Eliminate any elements that don't directly enhance the dish's appeal`;

    const userPrompt = `Create a dish-focused marketing video for: ${prompt}
    
Parameters:
- Format: ${parameters.Format || 'Video'}
- Aspect Ratio: ${parameters.Scale || '16:9'} 
- Duration: ${parameters.Length || '5s'}
- Style Focus: ${parameters['Video Style'] || 'Hero Shot'}
- Background: ${parameters.Background || 'Simple Clean Surface'}

CRITICAL: Make the dish the absolute hero (90% visual focus). Background should be minimal and non-competing. Focus on the dish's unique characteristics and what makes it irresistible. Lead with the dish name and prioritize its signature ingredients and textures.`;

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

      // Sanitize the runway_prompt to remove forbidden ingredients
      const sanitizedPrompt = sanitizePromptForDish(runwayPrompt, prompt);

      console.log('Using sanitized runway_prompt:', sanitizedPrompt);
      return sanitizedPrompt;
      
    } catch (parseError) {
      console.error('Failed to parse JSON response:', parseError);
      console.error('Raw response was:', jsonResponse);
      // Fallback to basic enhancement
      throw parseError;
    }

  } catch (error) {
    console.error('Error enhancing prompt with AI:', error);
    // Fallback to enhanced motion-specific prompt
    return createRestaurantMarketingPrompt(prompt, parameters);
  }
}

function createRestaurantMarketingPrompt(prompt: string, parameters: any): string {
  const actionStyle = parameters['Video Style'];
  const background = parameters.Background;
  
  // Parse dish to get enhanced presentation information
  const dishInfo = parseDishName(prompt);
  let dishSpecificContent = prompt;
  
  if (dishInfo) {
    // Start with dish name and visual signature for immediate focus
    const visualSig = dishInfo.visualSignature || `beautifully prepared ${dishInfo.name}`;
    const heroIngredients = dishInfo.heroIngredients?.slice(0, 2).join(' and ') || dishInfo.canonicalIngredients.slice(0, 2).join(' and ');
    const keyTextures = dishInfo.textureKeywords?.slice(0, 2).join(', ') || 'perfect textures';
    
    dishSpecificContent = `${dishInfo.name}. ${visualSig} with ${keyTextures}`;
    console.log(`Dish-focused marketing for ${dishInfo.name}: ${heroIngredients} as heroes`);
  }
  
  // Dish-focused narratives that prioritize the food over environment
  const getDishFocusedStory = (dishInfo: DishInfo | null, actionStyle: string): string => {
    if (!dishInfo) return 'Perfectly presented dish as the undisputed hero, clean simple background, focused lighting that makes the food irresistible.';
    
    // Dish-hero marketing narratives
    const dishHeroNarratives: Record<string, string> = {
      'Hero Shot': `${dishInfo.name} dominates the frame as the absolute hero. ${dishInfo.visualSignature || 'Perfect presentation'} on a clean, simple surface. Every texture and color optimized to create instant craving. Background stays minimal so the dish commands complete attention.`,
      
      'Ingredient Drop': `${dishInfo.name} as the star while ${dishInfo.heroIngredients?.[0] || 'signature ingredient'} adds the final perfect touch. The dish remains the focus, simple background, clean presentation that showcases food artistry.`,
      
      'Steam Rising': `${dishInfo.name} center stage with natural steam creating appetite appeal. ${dishInfo.textureKeywords?.join(', ') || 'Perfect textures'} highlighted against a clean, non-competing background. The dish tells its own delicious story.`,
      
      'Cheese Pull': dishInfo.canonicalIngredients.some(ing => ing.includes('cheese')) ?
        `${dishInfo.name} featured prominently with melted cheese creating that perfect stretch. Simple background lets the dish be the hero, focused lighting on the food's irresistible textures.` :
        `${dishInfo.name} showcasing its signature stretch and textures as the undisputed hero.`,
    };
    
    return dishHeroNarratives[actionStyle] || 
           `${dishInfo.name} as the hero dish, ${dishInfo.visualSignature || 'perfectly presented'}, clean minimal background, dish dominates 90% of visual focus.`;
  };
  
  const dishStory = getDishFocusedStory(dishInfo, actionStyle);
  
  // Simple background that enhances the dish rather than competing
  const simpleBackground = background === 'Chef\'s Pass' ? 
    'Clean professional surface that enhances the dish colors.' : 
    'Simple neutral background that makes the dish pop.';
  
  let finalPrompt = `${dishSpecificContent} ${dishStory} ${simpleBackground}

DISH-FIRST REQUIREMENTS: The dish is the absolute hero occupying 90% of visual focus. Lighting highlights food textures and colors. Background stays simple and non-competing. Every element serves to make the dish more appetizing.

FORBIDDEN: Busy backgrounds, excessive props, multiple dishes, anything that distracts from the hero dish. Keep it clean and dish-focused.`;
  
  // Add dish-specific enhancements
  if (dishInfo) {
    if (dishInfo.signatureTechnique) {
      finalPrompt += ` SIGNATURE APPEAL: ${dishInfo.signatureTechnique}`;
    }
    
    if (dishInfo.forbiddenIngredients.length > 0) {
      finalPrompt += ` EXCLUDE: ${dishInfo.forbiddenIngredients.slice(0, 2).join(', ')}`;
    }
  }
  
  return finalPrompt;
}

function createMarketingImagePrompt(prompt: string, parameters: any): string {
  const videoStyle = parameters['Video Style'];
  const background = parameters.Background;
  
  // Parse dish to get specific ingredients for marketing
  const dishInfo = parseDishName(prompt);
  let dishSpecificContent = prompt;
  
  if (dishInfo) {
    // Create marketing-focused description with premium ingredients
    const premiumIngredients = dishInfo.canonicalIngredients.join(', ');
    dishSpecificContent = `${dishInfo.name}: Premium ${dishInfo.cuisine} ${dishInfo.type} featuring ${premiumIngredients}`;
    console.log(`Marketing image for ${dishInfo.name}: showcasing [${premiumIngredients}]`);
  }
  
  // Create finished dish presentations optimized for restaurant marketing
  const getMarketingImageSetup = (dishInfo: DishInfo | null): string => {
    if (!dishInfo) return 'Beautifully plated restaurant dish presented at its most appetizing angle with perfect garnish and professional presentation';
    
    const marketingSetups: Record<string, string> = {
      'Carbonara': 'Perfectly plated carbonara with steam gently rising, creamy sauce glistening under warm restaurant lighting, fresh cracked black pepper and grated pecorino romano artistically placed, golden pasta beautifully twirled in an elegant bowl - restaurant-quality presentation that screams premium dining',
      'Aglio e Olio': 'Expertly plated spaghetti aglio e olio with golden olive oil creating an appetizing sheen, perfectly minced garlic visible throughout, red pepper flakes adding color contrast, fresh parsley garnish artistically scattered - simple elegance that showcases premium ingredients',
      'Cacio e Pepe': 'Restaurant-quality cacio e pepe with perfectly melted pecorino creating a glossy, creamy coating, freshly cracked black pepper providing visual and aromatic appeal, pasta expertly twirled and presented in a warm ceramic bowl with gentle steam rising',
      'Pad Thai': 'Vibrant pad thai beautifully arranged with colorful ingredients artfully distributed, fresh bean sprouts adding crisp texture, lime wedge positioned for perfect squeeze, shrimp and garnishes creating an appetizing color palette in authentic Thai restaurant style',
      'Ramen': 'Stunning ramen presentation with perfectly arranged toppings - silky chashu slices, soft-boiled egg cut to show golden yolk, fresh green onions and nori creating visual interest, all floating in rich, steaming broth that looks absolutely irresistible',
      'Tacos': 'Three perfectly assembled tacos showcased on authentic servingware, colorful fillings beautifully distributed, fresh cilantro and diced onions adding vibrant contrast, lime wedges positioned for optimal visual appeal - street food elevated to restaurant quality'
    };
    
    return marketingSetups[dishInfo.name] || `${dishInfo.canonicalIngredients.join(', ')} beautifully arranged and plated in restaurant-quality presentation, showcasing premium ingredients and professional culinary artistry`;
  };

  // Create marketing image prompts optimized for appetite appeal
  const marketingSetups = {
    'Hero Shot': `Premium restaurant presentation: ${getMarketingImageSetup(dishInfo)}. Perfect plating with professional lighting that showcases every appetizing detail. The ultimate marketing shot that makes customers order immediately.`,
    'Ingredient Drop': `Final garnish moment: ${getMarketingImageSetup(dishInfo)} with fresh herbs or premium toppings being delicately placed as the finishing touch. Restaurant-quality presentation showing attention to detail and culinary artistry.`,
    'Slow-Mo Pour': `Luxurious sauce application: Perfectly plated dish ready for signature sauce drizzle, positioned for elegant pouring motion that enhances the premium presentation and appetite appeal.`,
    'Steam Rising': `Hot, fresh presentation: ${getMarketingImageSetup(dishInfo)} with natural steam rising, proving the dish is served at perfect temperature and freshly prepared to order.`,
    'Cheese Pull': dishInfo?.canonicalIngredients.some(ing => ing.includes('cheese'))
      ? `Perfect cheese moment: ${getMarketingImageSetup(dishInfo)} with melted ${dishInfo.canonicalIngredients.find(ing => ing.includes('cheese'))} ready for that satisfying stretch that makes every cheese lover crave this dish`
      : `Irresistible melted elements: Perfectly prepared dish with melted components ready for that satisfying stretch moment that creates immediate appetite appeal`,
    'Sizzle Effect': `Fresh from kitchen: ${getMarketingImageSetup(dishInfo)} still gently sizzling, showcasing the made-to-order quality that premium restaurants are known for.`,
    'Garnish Drop': `Finishing touches: ${getMarketingImageSetup(dishInfo)} ready for final artistic garnish placement that completes the premium restaurant presentation.`,
    'Liquid Drizzle': `Signature finishing: Beautifully plated dish positioned for artistic sauce or oil application in the restaurant\'s signature style.`,
    'Whisk Action': `Perfect texture achieved: ${getMarketingImageSetup(dishInfo)} showcasing the smooth, creamy perfection that demonstrates restaurant-quality preparation and premium ingredients.`
  };
  
  const marketingSetup = marketingSetups[videoStyle as keyof typeof marketingSetups] || `Restaurant-quality presentation of ${dishSpecificContent} that creates immediate appetite appeal and ordering desire.`;
  const backgroundEnhancement = background ? `Set in an elegant ${background} environment that enhances the premium dining experience and restaurant atmosphere.` : '';
  
  let finalPrompt = `Restaurant marketing photography: ${dishSpecificContent}. ${backgroundEnhancement} ${marketingSetup}. Professional presentation with perfect lighting that showcases premium quality, vibrant colors, and appetizing textures optimized to create immediate craving and drive orders.`;
  
  // Add negative prompts for forbidden ingredients if we have dish info
  if (dishInfo && dishInfo.forbiddenIngredients.length > 0) {
    finalPrompt += ` Never include: ${dishInfo.forbiddenIngredients.join(', ')}.`;
  }
  
  return finalPrompt;
}

async function generateImageWithPrompt(customPrompt: string, parameters: any) {
  if (!geminiApiKey) {
    throw new Error('Google AI Studio API key not configured');
  }

  // Map scale to image dimensions and aspect ratio for Google AI Studio Imagen 4.0
  const getDimensionsAndAspectRatio = (scale: string) => {
    switch (scale) {
      case 'Portrait':
        return { width: 1024, height: 1536, aspectRatio: "3:4" }; // Portrait: 3:4 aspect ratio
      case 'Landscape':
        return { width: 1792, height: 1024, aspectRatio: "16:9" }; // Landscape: 16:9 aspect ratio (optimal for food photography)
      case 'Square':
        return { width: 1024, height: 1024, aspectRatio: "1:1" }; // Square: 1:1 aspect ratio
      case '2:3': // Legacy support
        return { width: 1024, height: 1536, aspectRatio: "3:4" };
      case '16:9': // Legacy support
        return { width: 1792, height: 1024, aspectRatio: "16:9" };
      case '1:1': // Legacy support
        return { width: 1024, height: 1024, aspectRatio: "1:1" };
      default:
        return { width: 1792, height: 1024, aspectRatio: "16:9" }; // Default to landscape for images
    }
  };

  const { width, height, aspectRatio } = getDimensionsAndAspectRatio(parameters.Scale || 'Landscape');
  console.log('generateImageWithPrompt: Using dimensions and aspect ratio for Google AI Studio:', { width, height, aspectRatio, scale: parameters.Scale || 'Landscape' });
  
  console.log('generateImageWithPrompt: using Google AI Studio Imagen 4.0');
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict`, {
      method: 'POST',
      headers: {
        'x-goog-api-key': geminiApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        instances: [
          {
            prompt: customPrompt
          }
        ],
        parameters: {
          sampleCount: 1,
          aspectRatio: aspectRatio,
          dimension: {
            width: width,
            height: height
          }
        }
      }),
    });
    
    console.log('generateImageWithPrompt: Google AI Studio response', { status: response.status, statusText: response.statusText });
    
    // Get response text first to debug
    const responseText = await response.text();
    console.log('generateImageWithPrompt: Raw response text:', responseText.substring(0, 500));
    
    if (response.ok) {
      if (!responseText) {
        throw new Error('Google AI Studio returned empty response');
      }
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('generateImageWithPrompt: JSON parse error:', parseError);
        console.error('generateImageWithPrompt: Response text:', responseText);
        throw new Error('Invalid JSON response from Google AI Studio');
      }
      
      console.log('generateImageWithPrompt: Google AI Studio success, data structure:', Object.keys(data));
      
      // Check if the response has the expected structure for Imagen 4.0
      if (!data.predictions || !Array.isArray(data.predictions) || data.predictions.length === 0) {
        console.error('generateImageWithPrompt: Unexpected response structure:', data);
        throw new Error('Google AI Studio returned unexpected response format');
      }
      
      // Extract base64 image from response (Imagen 4.0 format)
      const prediction = data.predictions[0];
      const imageData = prediction.bytesBase64Encoded;
      
      if (!imageData) {
        console.error('generateImageWithPrompt: No image data in response:', prediction);
        throw new Error('Google AI Studio returned no image data');
      }
      
      return {
        type: 'image',
        content: imageData,
        format: 'png',
        parameters,
        prompt: customPrompt
      };
    } else {
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch (parseError) {
        console.error('generateImageWithPrompt: Error response parse failed:', parseError);
        console.error('generateImageWithPrompt: Error response text:', responseText);
        throw new Error(`Google AI Studio API error (${response.status}): ${responseText}`);
      }
      console.error('generateImageWithPrompt: Google AI Studio failed:', errorData);
      throw new Error(`Google AI Studio API error: ${errorData.error?.message || 'Unknown error'}`);
    }
  } catch (error) {
    console.error('generateImageWithPrompt: Google AI Studio request failed:', error);
    throw error;
  }
}

// ===== ENHANCED LUMA DREAM MACHINE INTEGRATION =====

async function generateVideoWithLuma(prompt: string, parameters: any, generationMode: 'text-to-video' | 'image-to-video' = 'text-to-video', starterImageUrl?: string) {
  const requestId = crypto.randomUUID();
  const startTime = Date.now();
  
  console.log('[LUMA-VIDEO]', { 
    requestId, 
    event: 'generation_start', 
    mode: generationMode,
    hasStarterImage: !!starterImageUrl,
    parameters,
    promptPreview: prompt.slice(0, 100)
  });

  if (!lumaApiKey) {
    console.error('[LUMA-VIDEO]', { requestId, event: 'error', error: 'Luma API key not configured' });
    throw new Error('Luma API key not configured');
  }

  // Enhanced parameter mapping with detailed logging
  const aspectRatio = mapScaleToAspectRatio(parameters.Scale || '16:9');
  const duration = mapLengthToDuration(parameters.Length || '5s');
  const shouldLoop = shouldEnableLoop(parameters);
  
  console.log('[LUMA-VIDEO]', { 
    requestId, 
    event: 'parameters_mapped', 
    aspectRatio, 
    duration,
    shouldLoop,
    originalScale: parameters.Scale,
    originalLength: parameters.Length
  });

  // Enhanced prompt creation with Luma-specific optimizations
  let enhancedPrompt: string;
  try {
    const promptStart = Date.now();
    enhancedPrompt = await createLumaOptimizedPrompt(prompt, parameters, generationMode);
    console.log('[LUMA-VIDEO]', { 
      requestId, 
      event: 'prompt_enhanced', 
      ms: Date.now() - promptStart,
      originalLength: prompt.length,
      enhancedLength: enhancedPrompt.length
    });
  } catch (error) {
    console.warn('[LUMA-VIDEO]', { requestId, event: 'prompt_enhancement_failed', fallback: 'basic_enhancement' });
    enhancedPrompt = createBasicLumaPrompt(prompt, parameters, generationMode);
  }

  // Prepare API request body for direct Luma API
  const lumaModel = 'ray-1-6';
  const requestBody: any = {
    model: lumaModel,
    prompt: enhancedPrompt,
    aspect_ratio: aspectRatio
  };
  // Only include loop when true to avoid API rejections
  if (shouldLoop) {
    requestBody.loop = true;
  }

  // Add starter image for image-to-video mode
  if (generationMode === 'image-to-video' && starterImageUrl) {
    requestBody.keyframes = {
      frame0: {
        type: "image",
        url: starterImageUrl
      }
    };
    console.log('[LUMA-VIDEO]', { requestId, event: 'image_to_video_mode', starterImageUrl: starterImageUrl.slice(0, 100) });
  }

  console.log('[LUMA-VIDEO]', { 
    requestId, 
    event: 'api_request_start', 
    endpoint: 'luma-dream-machine-direct',
    requestBodySize: JSON.stringify(requestBody).length
  });

  try {
    // Step 1: Create generation task using direct Luma API
    const apiCallStart = Date.now();
    console.log('[LUMA-VIDEO]', { 
      requestId, 
      event: 'api_call_details', 
      endpoint: 'https://api.lumalabs.ai/dream-machine/v1/generations',
      method: 'POST',
      bodyPreview: JSON.stringify(requestBody).slice(0, 200)
    });
    
    const createResponse = await fetch('https://api.lumalabs.ai/dream-machine/v1/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lumaApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('[LUMA-VIDEO]', { 
      requestId, 
      event: 'create_response', 
      status: createResponse.status, 
      statusText: createResponse.statusText,
      ms: Date.now() - apiCallStart
    });

    if (!createResponse.ok) {
      const errorData = await createResponse.json();
      console.error('[LUMA-VIDEO]', { 
        requestId, 
        event: 'create_error', 
        status: createResponse.status,
        error: errorData
      });
      throw new Error(`Luma Dream Machine API error: ${errorData.error || errorData.detail || 'Unknown error'}`);
    }

    const createData = await createResponse.json();
    const generationId = createData.id;
    
    console.log('[LUMA-VIDEO]', { 
      requestId, 
      event: 'generation_created', 
      generationId: generationId,
      state: createData.state
    });

    // Step 2: Poll for completion
    const maxAttempts = 120; // 10 minutes max (5 second intervals)
    let attempts = 0;
    let lastState = '';

    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
      attempts++;

      try {
        const statusResponse = await fetch(`https://api.lumalabs.ai/dream-machine/v1/generations/${generationId}`, {
          headers: { 
            'Authorization': `Bearer ${lumaApiKey}`,
            'Content-Type': 'application/json'
          },
        });

        if (!statusResponse.ok) {
          console.warn('[LUMA-VIDEO]', { requestId, event: 'status_check_failed', attempt: attempts, generationId });
          continue;
        }

        const statusData = await statusResponse.json();
        
        if (statusData.state !== lastState) {
          console.log('[LUMA-VIDEO]', { 
            requestId, 
            event: 'status_update', 
            attempt: attempts, 
            state: statusData.state,
            generationId: generationId,
            hasVideo: !!statusData.assets?.video
          });
          lastState = statusData.state;
        }

        if (statusData.state === 'completed' && statusData.assets?.video) {
          console.log('[LUMA-VIDEO]', { 
            requestId, 
            event: 'generation_success', 
            attempts,
            totalMs: Date.now() - startTime,
            videoUrl: statusData.assets.video.slice(0, 100)
          });

          return {
            type: 'video',
            content: statusData.assets.video,
            format: 'mp4',
            parameters,
            prompt: enhancedPrompt,
            taskId: generationId,
            generationMode,
            aspectRatio
          };
        }

        if (statusData.state === 'failed') {
          console.error('[LUMA-VIDEO]', { 
            requestId, 
            event: 'generation_failed_status', 
            attempts, 
            generationId,
            failure_reason: statusData.failure_reason || 'Unknown failure'
          });
          throw new Error(`Generation failed: ${statusData.failure_reason || 'Unknown failure'}`);
        }
      } catch (pollError) {
        console.warn('[LUMA-VIDEO]', { requestId, event: 'polling_error', attempt: attempts, error: (pollError as Error).message });
      }
    }

    // Timeout
    console.error('[LUMA-VIDEO]', { 
      requestId, 
      event: 'generation_timeout', 
      attempts, 
      generationId,
      totalMs: Date.now() - startTime
    });
    throw new Error('Generation timed out after 10 minutes');

  } catch (error) {
    const totalTime = Date.now() - startTime;
    console.error('[LUMA-VIDEO]', { 
      requestId, 
      event: 'generation_failed', 
      error: (error as Error).message,
      totalMs: totalTime
    });
    throw error;
  }
}

async function generateImageToVideoWithLuma(prompt: string, parameters: any) {
  const requestId = crypto.randomUUID();
  console.log('[LUMA-I2V]', { requestId, event: 'start', prompt: prompt.slice(0, 100) });

  try {
    // First, generate a high-quality starter image
    const imageStart = Date.now();
    console.log('[LUMA-I2V]', { requestId, event: 'starter_image_generation_start' });
    
    const starterImagePrompt = createMotionOptimizedImagePrompt(prompt, parameters);
    const starterImage = await generateImageWithPrompt(starterImagePrompt, parameters);
    
    console.log('[LUMA-I2V]', { 
      requestId, 
      event: 'starter_image_generated', 
      ms: Date.now() - imageStart,
      hasImage: !!starterImage
    });

    // Convert base64 to URL for Luma API
    const imageUrl = `data:image/${starterImage.format};base64,${starterImage.content}`;
    
    // Generate video from the starter image
    return await generateVideoWithLuma(prompt, parameters, 'image-to-video', imageUrl);
    
  } catch (error) {
    console.error('[LUMA-I2V]', { requestId, event: 'failed', error: (error as Error).message });
    throw new Error(`Image-to-video generation failed: ${(error as Error).message}`);
  }
}

async function generateTextToImageWithLuma(prompt: string, parameters: any) {
  const requestId = crypto.randomUUID();
  console.log('[LUMA-T2I]', { requestId, event: 'start', prompt: prompt.slice(0, 100) });

  if (!lumaApiKey) {
    throw new Error('Luma API key not configured');
  }

  try {
    const enhancedPrompt = await createLumaOptimizedPrompt(prompt, parameters, 'text-to-image');
    const aspectRatio = mapScaleToAspectRatio(parameters.Scale || '1:1');
    
    console.log('[LUMA-T2I]', { 
      requestId, 
      event: 'api_request_details', 
      aspectRatio,
      promptLength: enhancedPrompt.length,
      endpoint: 'https://queue.fal.run/fal-ai/luma-photon'
    });

    const response = await fetch('https://queue.fal.run/fal-ai/luma-photon', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${falApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: enhancedPrompt,
        aspect_ratio: aspectRatio,
        num_images: 1,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('[LUMA-T2I]', { requestId, event: 'api_error', error: errorData });
      throw new Error(`Luma Photon API error: ${errorData.error || 'Unknown error'}`);
    }

    const data = await response.json();
    console.log('[LUMA-T2I]', { requestId, event: 'success', hasImage: !!data.images?.[0]?.url });

    return {
      type: 'image',
      content: data.images[0].url,
      format: 'png',
      parameters,
      prompt: enhancedPrompt
    };

  } catch (error) {
    console.error('[LUMA-T2I]', { requestId, event: 'failed', error: (error as Error).message });
    throw error;
  }
}

// ===== ENHANCED PARAMETER MAPPING =====

function mapScaleToAspectRatio(scale: string): string {
  const mapping: Record<string, string> = {
    'Portrait': '9:16',
    '2:3': '9:16', // Luma does not support 2:3; remap to 9:16 portrait
    '9:16': '9:16',
    'Landscape': '16:9',
    '16:9': '16:9',
    'Square': '1:1',
    '1:1': '1:1',
    '4:3': '16:9' // Remap unsupported 4:3 to 16:9
  };
  
  const result = mapping[scale] || '16:9';
  console.log('[PARAM-MAP]', { event: 'aspect_ratio_mapped', input: scale, output: result });
  return result;
}

function mapLengthToDuration(length: string): string {
  // Handle time formats like "5s", "10s" etc. by extracting integer seconds
  if (length && /\d/.test(length)) {
    const numMatch = length.match(/(\d+)/);
    if (numMatch) {
      const duration = parseInt(numMatch[1]);
      // Luma accepts "5s", "9s", or "10s" strings; snap to nearest allowed value
      const validDuration = duration <= 5 ? "5s" : duration <= 9 ? "9s" : "10s";
      console.log('[PARAM-MAP]', { event: 'duration_mapped', input: length, output: validDuration, type: 'luma_string_format' });
      return validDuration;
    }
  }
  
  // Handle descriptive formats
  const mapping: Record<string, string> = {
    'Short': "5s",
    'Medium': "9s",
    'Long': "10s"
  };
  
  const result = mapping[length] || "9s";
  console.log('[PARAM-MAP]', { event: 'duration_mapped', input: length, output: result, type: 'descriptive_format' });
  return result;
}

function shouldEnableLoop(parameters: any): boolean {
  const videoStyle = parameters['Video Style']?.toLowerCase() || '';
  const shouldLoop = videoStyle.includes('loop') || videoStyle.includes('seamless');
  console.log('[PARAM-MAP]', { event: 'loop_decision', videoStyle, shouldLoop });
  return shouldLoop;
}

// ===== ENHANCED PROMPT OPTIMIZATION =====

async function createLumaOptimizedPrompt(prompt: string, parameters: any, mode: 'text-to-video' | 'image-to-video' | 'text-to-image'): Promise<string> {
  console.log('[PROMPT-OPT]', { event: 'optimization_start', mode, originalPrompt: prompt.slice(0, 100) });

  if (!openAIApiKey) {
    console.log('[PROMPT-OPT]', { event: 'no_openai_key', fallback: 'basic_prompt' });
    return createBasicLumaPrompt(prompt, parameters, mode);
  }

  const systemPrompt = getLumaSystemPrompt(mode);
  
  try {
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
          { role: 'user', content: `Create optimized prompt for: ${prompt}\nParameters: ${JSON.stringify(parameters)}` }
        ],
        max_completion_tokens: 500,
        temperature: 0.7
      }),
    });

    if (!response.ok) {
      console.error('[PROMPT-OPT]', { event: 'openai_error', status: response.status });
      return createBasicLumaPrompt(prompt, parameters, mode);
    }

    const data = await response.json();
    const optimizedPrompt = data.choices[0].message.content.trim();
    
    console.log('[PROMPT-OPT]', { 
      event: 'optimization_success', 
      inputLength: prompt.length,
      outputLength: optimizedPrompt.length
    });
    
    return optimizedPrompt;
    
  } catch (error) {
    console.error('[PROMPT-OPT]', { event: 'optimization_failed', error: (error as Error).message });
    return createBasicLumaPrompt(prompt, parameters, mode);
  }
}

function getLumaSystemPrompt(mode: string): string {
  const basePrompt = `You are a professional food videographer specializing in dish-focused marketing content that makes the FOOD the absolute hero. Your goal is creating appetite-inducing videos where the dish dominates 90% of the visual story.

DISH-FIRST PRIORITY SYSTEM:
1. DISH DOMINANCE - The specific dish is the undisputed visual star
2. INGREDIENT HEROES - Key ingredients get individual spotlight moments  
3. TEXTURE FOCUS - Show the dish's unique textures and perfect doneness
4. MINIMAL BACKGROUND - Simple, non-competing surfaces that enhance the dish
5. NO DISTRACTIONS - Eliminate anything that doesn't showcase the dish

DISH-CENTRIC MARKETING RULES:
- Lead every prompt with the dish name and its visual signature
- Prioritize the dish's unique characteristics over generic food styling
- Show ingredient transformations specific to this dish
- Focus on textures that make THIS dish irresistible (creamy, crispy, melted, etc.)
- Use simple backgrounds that make the dish colors pop
- Eliminate competing visual elements

VISUAL HIERARCHY FOR APPETITE:
- 90% visual weight: The dish and its hero ingredients
- 10% visual weight: Simple supporting context (clean plate, neutral surface)
- Steam, sizzling, and melting as natural appetite triggers
- Perfect doneness and ideal serving temperature visual cues
- Dish-specific garnishes and presentation elements

TECHNICAL EXECUTION FOR LUMA:
- Start with dish name: "[Dish Name]. [Key visual signature]"
- Use ingredient-specific motion: "golden cheese melting", "pasta twirling", "sauce coating"
- Show dish transformations: "ingredients becoming [dish name]", "[technique] creating perfect [dish]"
- Focus on dish textures: "silky", "crispy", "golden", "bubbling", "steaming"
- Simple backgrounds: "clean white surface", "dark stone", "natural wood grain"
- Eliminate props: No elaborate table settings, excessive garnishes, or competing elements

ABSOLUTELY FORBIDDEN:
- Busy backgrounds that compete with the dish
- Multiple dishes in the same frame
- Elaborate table settings or excessive props
- Generic cooking without dish-specific focus
- People or hands (they look artificial and distract from the dish)
- Anything that makes the dish secondary to its environment

OUTPUT FORMAT: Single focused paragraph, 300-500 characters, starting with the dish name and prioritizing its unique visual characteristics over background elements.`;

  const modeSpecific = {
    'text-to-video': '\nVIDEO FOCUS: Show the dish transforming from ingredients to perfect final presentation, with the dish name leading the visual story.',
    'image-to-video': '\nTRANSFORMATION FOCUS: Animate the dish becoming its most appetizing state, focusing on the specific dish characteristics.',
    'text-to-image': '\nSTILL FOCUS: Capture the dish at its most irresistible moment, with the dish name and signature elements prominently featured.'
  };

  return basePrompt + (modeSpecific[mode as keyof typeof modeSpecific] || '');
}

function createBasicLumaPrompt(prompt: string, parameters: any, mode: string): string {
  const dishInfo = parseDishName(prompt);
  
  // Start with dish name and visual signature
  let enhancedPrompt = prompt;
  
  if (dishInfo) {
    // Lead with dish identity and visual signature
    const visualSig = dishInfo.visualSignature || `${dishInfo.name} with ${dishInfo.heroIngredients?.join(', ') || 'signature ingredients'}`;
    const textures = dishInfo.textureKeywords?.slice(0, 3).join(', ') || 'perfectly prepared';
    
    enhancedPrompt = `${dishInfo.name}. ${visualSig}, ${textures} textures`;
    
    // Add signature technique focused on the dish
    if (dishInfo.signatureTechnique) {
      enhancedPrompt += `, ${dishInfo.signatureTechnique}`;
    }
    
    // Add simple, dish-enhancing context
    enhancedPrompt += ', clean white surface, focused lighting on dish';
    
    // Add motion for video mode
    if (mode === 'text-to-video') {
      enhancedPrompt += ', ingredients transforming into perfect presentation';
    }
    
    // Exclude forbidden elements
    if (dishInfo.forbiddenIngredients.length > 0) {
      enhancedPrompt += `. NO: ${dishInfo.forbiddenIngredients.slice(0, 2).join(', ')}`;
    }
  } else {
    // Fallback for unrecognized dishes - still dish-focused
    enhancedPrompt = `${prompt}, perfectly presented dish, clean simple background, focused lighting that highlights the food`;
    
    if (mode === 'text-to-video') {
      enhancedPrompt += ', natural ingredient movement and appetizing transformation';
    }
  }
  
  // Ensure dish focus and simplicity
  enhancedPrompt += ', minimal distracting elements, dish as hero';
  
  return enhancedPrompt.slice(0, 500);
}

function createMotionOptimizedImagePrompt(prompt: string, parameters: any): string {
  return `Professional food photography setup for video animation: ${prompt}. Perfect for motion generation, optimal ingredient placement, clear textures, studio lighting, ready for dynamic movement, high resolution commercial quality.`;
}

// Veo video generation with Google Gemini API
async function generateVideoWithVeo(prompt: string, parameters: any): Promise<any> {
  console.log('🎬 Starting Veo video generation...');
  
  try {
    if (!geminiApiKey) {
      throw new Error('Gemini API key not found. Please add GEMINI_API_KEY to your Supabase secrets.');
    }

    // Create enhanced prompt optimized for Veo
    const enhancedPrompt = await createVeoOptimizedPrompt(prompt, parameters);
    console.log('Enhanced Veo prompt:', enhancedPrompt);

    // Map parameters to Veo format
    const veoParams = mapParametersToVeo(parameters);
    console.log('Mapped Veo parameters:', veoParams);

    // Generate video with Veo through Gemini API
    const videoResponse = await callVeoAPI(enhancedPrompt, veoParams);
    
    console.log('✅ Veo video generation completed');
    return videoResponse;

  } catch (error) {
    console.error('❌ Veo video generation failed:', error);
    throw error;
  }
}

// Create Veo-optimized prompt
async function createVeoOptimizedPrompt(prompt: string, parameters: any): Promise<string> {
  if (!openAIApiKey) {
    return createBasicVeoPrompt(prompt, parameters);
  }

  try {
    const systemPrompt = getVeoSystemPrompt();
    
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
          { role: 'user', content: `Create a Veo-optimized video prompt for: "${prompt}"` }
        ],
        max_tokens: 500,
        temperature: 0.7
      }),
    });

    if (!response.ok) {
      console.log('OpenAI enhancement failed, using basic prompt');
      return createBasicVeoPrompt(prompt, parameters);
    }

    const data = await response.json();
    return data.choices[0].message.content;

  } catch (error) {
    console.error('Error enhancing prompt for Veo:', error);
    return createBasicVeoPrompt(prompt, parameters);
  }
}

// Veo system prompt for optimization
function getVeoSystemPrompt(): string {
  return `You are an expert at creating cinematic video prompts for Google's Veo model.

Veo excels at:
- Realistic camera movements and cinematography
- Natural lighting and shadows
- Fluid motion and physics
- High-quality textures and details
- Professional video production aesthetics

For food content, emphasize:
- Appetizing close-ups with shallow depth of field
- Natural lighting that highlights textures
- Smooth camera movements (pan, tilt, dolly)
- Steam, bubbling, or natural motion
- Professional food photography aesthetics

Create a concise, descriptive prompt (max 150 words) that leverages Veo's strengths.`;
}

// Create basic Veo prompt without AI enhancement
function createBasicVeoPrompt(prompt: string, parameters: any): string {
  const dishInfo = parseDishName(prompt);
  
  let enhancedPrompt = prompt;
  
  // Add cinematography elements
  enhancedPrompt += ', cinematic lighting, professional food photography';
  
  // Add camera movement based on parameters
  if (parameters.VideoStyle === 'dynamic') {
    enhancedPrompt += ', smooth camera movement, dynamic angles';
  } else {
    enhancedPrompt += ', steady camera, elegant composition';
  }
  
  // Add duration context
  if (parameters.Length === 'long') {
    enhancedPrompt += ', extended sequence showing preparation and final dish';
  } else {
    enhancedPrompt += ', focused shot highlighting the main subject';
  }
  
  return enhancedPrompt;
}

// Map current parameters to Veo format
function mapParametersToVeo(parameters: any): any {
  const veoParams: any = {
    resolution: "1080p",
    fps: 24
  };

  // Map aspect ratio from Scale parameter
  if (parameters.Scale) {
    switch (parameters.Scale.toLowerCase()) {
      case 'square':
      case '1:1':
        veoParams.aspect_ratio = "1:1";
        break;
      case 'landscape':
      case '16:9':
      case 'widescreen':
        veoParams.aspect_ratio = "16:9";
        break;
      case 'portrait':
      case '9:16':
      case 'vertical':
        veoParams.aspect_ratio = "9:16";
        break;
      default:
        veoParams.aspect_ratio = "16:9";
    }
  }

  // Map duration from Length parameter
  if (parameters.Length) {
    switch (parameters.Length.toLowerCase()) {
      case 'short':
        veoParams.duration = 5;
        break;
      case 'medium':
        veoParams.duration = 10;
        break;
      case 'long':
        veoParams.duration = 15;
        break;
      default:
        veoParams.duration = 8;
    }
  }

  // Map quality settings
  if (parameters.VideoStyle) {
    switch (parameters.VideoStyle.toLowerCase()) {
      case 'cinematic':
        veoParams.style = "cinematic";
        veoParams.quality = "high";
        break;
      case 'realistic':
        veoParams.style = "realistic";
        veoParams.quality = "high";
        break;
      case 'dynamic':
        veoParams.style = "dynamic";
        veoParams.camera_motion = "medium";
        break;
      default:
        veoParams.style = "realistic";
    }
  }

  return veoParams;
}

// Call Veo API through Gemini
async function callVeoAPI(prompt: string, parameters: any): Promise<any> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/veo-3:generateContent?key=${geminiApiKey}`;
  
  const requestBody = {
    contents: [{
      parts: [{
        text: prompt
      }]
    }],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 1000,
    },
    safetySettings: [
      {
        category: "HARM_CATEGORY_HARASSMENT",
        threshold: "BLOCK_MEDIUM_AND_ABOVE"
      }
    ]
  };

  console.log('Calling Veo API with params:', JSON.stringify(requestBody, null, 2));

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Veo API error response:', errorText);
    throw new Error(`Veo API error: ${response.status} - ${errorText}`);
  }

  const result = await response.json();
  console.log('Veo API response:', result);

  // Extract video URL from response
  if (result.candidates && result.candidates[0] && result.candidates[0].content) {
    const content = result.candidates[0].content;
    
    // For now, return the response structure - Veo integration may need polling
    return {
      type: 'video',
      content: content.parts[0].text || 'Video generation initiated',
      url: content.videoUrl || null, // This may not be immediately available
      format: 'mp4',
      parameters: parameters,
      prompt: prompt,
      provider: 'veo'
    };
  }

  throw new Error('Invalid response from Veo API');
}

async function generateVideo(prompt: string, parameters: any) {
  const requestId = crypto.randomUUID();
  const startTime = Date.now();
  const strictVideo = parameters?.StrictVideo === true;
  
  console.log('[VIDEO-GEN]', { 
    requestId, 
    event: 'generation_start',
    hasVeo: !!geminiApiKey,
    hasLuma: !!lumaApiKey,
    hasRunway: !!runwayApiKey,
    parameters,
    promptPreview: prompt.slice(0, 100)
  });
  console.log('[VIDEO-GEN]', { requestId, event: 'strict_video_mode', strictVideo });
  console.log('[VIDEO-GEN]', { requestId, event: 'provider_selection_policy', message: 'intelligent_provider_routing' });

  try {
    // Determine the best provider based on parameters and requirements
    const provider = selectVideoProvider(parameters);
    console.log('[VIDEO-GEN]', { requestId, event: 'provider_selected', provider });
    
    let result;
    
    switch (provider) {
      case 'veo':
        console.log('[VIDEO-GEN]', { requestId, event: 'generating_with_veo' });
        result = await generateVideoWithVeo(prompt, parameters);
        break;
      
      case 'luma':
        // Check if uploaded image exists for image-to-video
        if (parameters.uploadedImage) {
          console.log('[VIDEO-GEN]', { requestId, event: 'generating_luma_image_to_video' });
          result = await generateVideoWithLuma(prompt, { 
            ...parameters,
            mode: 'image_to_video',
            image_url: parameters.uploadedImage 
          }, 'image-to-video');
        } else {
          console.log('[VIDEO-GEN]', { requestId, event: 'generating_luma_text_to_video' });
          result = await generateVideoWithLuma(prompt, parameters, 'text-to-video');
        }
        break;
      
      case 'runway':
        console.log('[VIDEO-GEN]', { requestId, event: 'generating_with_runway' });
        result = await generateVideoWithRunway(prompt, parameters);
        break;
      
      default:
        console.log('[VIDEO-GEN]', { requestId, event: 'fallback_to_luma' });
        if (parameters.uploadedImage) {
          result = await generateVideoWithLuma(prompt, { 
            ...parameters,
            mode: 'image_to_video',
            image_url: parameters.uploadedImage 
          }, 'image-to-video');
        } else {
          result = await generateVideoWithLuma(prompt, parameters, 'text-to-video');
        }
    }

    console.log('[VIDEO-GEN]', {
      requestId,
      event: 'generation_success',
      provider,
      actualType: result.type,
      actualFormat: result.format,
      contentPreview: result.content?.slice(0, 100),
      totalMs: Date.now() - startTime
    });
    
    return result;
    
  } catch (error) {
    console.error('[VIDEO-GEN]', { requestId, event: 'primary_provider_failed', error: (error as Error).message });
    
    // If strictVideo is true, don't fallback
    if (strictVideo) {
      throw error;
    }
    
    // Fallback strategy: try Luma if other providers fail
    try {
      console.log('[VIDEO-GEN]', { requestId, event: 'attempting_fallback_to_luma' });
      
      let fallbackResult;
      if (parameters.uploadedImage) {
        fallbackResult = await generateVideoWithLuma(prompt, { 
          ...parameters,
          mode: 'image_to_video',
          image_url: parameters.uploadedImage 
        }, 'image-to-video');
      } else {
        fallbackResult = await generateVideoWithLuma(prompt, parameters, 'text-to-video');
      }
      
      console.log('[VIDEO-GEN]', {
        requestId,
        event: 'fallback_success',
        actualType: fallbackResult.type,
        actualFormat: fallbackResult.format,
        totalMs: Date.now() - startTime
      });
      
      return fallbackResult;
      
    } catch (fallbackError) {
      console.error('[VIDEO-GEN]', {
        requestId,
        event: 'generation_failed',
        error: (fallbackError as Error).message,
        totalMs: Date.now() - startTime
      });
      
      throw new Error(`Video generation failed: ${error.message}`);
    }
  }
}

// Select the best video provider based on parameters
function selectVideoProvider(parameters: any): string {
  // If user specifically requests a provider
  if (parameters.Provider) {
    const requestedProvider = parameters.Provider.toLowerCase();
    if (['veo', 'luma', 'runway'].includes(requestedProvider)) {
      console.log(`[VIDEO-GEN] User requested provider: ${requestedProvider}`);
      return requestedProvider;
    }
  }
  
  // If uploaded image exists, prefer Luma (has robust image-to-video support)
  if (parameters.uploadedImage) {
    console.log('[VIDEO-GEN] Uploaded image detected, preferring Luma');
    return 'luma';
  }
  
  // For high-quality cinematic videos, prefer Veo
  if (parameters.VideoStyle === 'cinematic' || parameters.Length === 'long') {
    console.log('[VIDEO-GEN] Cinematic/long content, preferring Veo');
    return 'veo';
  }
  
  // For quick/dynamic videos, prefer Luma
  if (parameters.VideoStyle === 'dynamic' || parameters.Length === 'short') {
    console.log('[VIDEO-GEN] Dynamic/short content, preferring Luma');
    return 'luma';
  }
  
  // Default to Veo for best quality (if available)
  if (geminiApiKey) {
    console.log('[VIDEO-GEN] Defaulting to Veo for optimal quality');
    return 'veo';
  }
  
  // Fallback to Luma if Veo not available
  console.log('[VIDEO-GEN] Veo not available, defaulting to Luma');
  return 'luma';
}

async function generateVideoWithRunway(prompt: string, parameters: any) {
  const requestId = crypto.randomUUID();
  console.log('[RUNWAY]', { requestId, event: 'generation_start', prompt: prompt.slice(0, 100) });

  if (!runwayApiKey) {
    throw new Error('Runway API key not configured');
  }

  // Map length to duration (handle both string formats like "5s" and descriptive names)
  const getDuration = (length: string) => {
    if (!length) return 10; // default
    
    // Handle time strings like "1s", "5s", "10s"
    const timeMatch = length.match(/(\d+)s?/);
    if (timeMatch) {
      return parseInt(timeMatch[1]);
    }
    
    // Handle descriptive names
    switch (length.toLowerCase()) {
      case 'short': return 5;
      case 'medium': return 10;
      case 'long': return 15;
      default: return 10;
    }
  };

  // Map scale to aspect ratio for Runway
  const getRatio = (scale: string) => {
    switch (scale) {
      case 'Portrait': 
      case '2:3': 
        return '768:1280'; // Portrait 9:16 equivalent
      case 'Square':
      case '1:1':
        return '768:768';  // Square
      case 'Landscape':
      case '16:9':
        return '1280:720'; // Landscape 16:9
      default: 
        return '768:768';  // Default square
    }
  };

  const duration = getDuration(parameters.Length || 'Medium');
  const ratio = getRatio(parameters.Scale || 'Square');
  console.log('[RUNWAY]', { 
    requestId, 
    event: 'parameters_mapped', 
    duration, 
    ratio,
    originalLength: parameters.Length,
    originalScale: parameters.Scale
  });

  // First, generate a starter image
  try {
    const imagePrompt = createMarketingImagePrompt(prompt, parameters);
    const starterImage = await generateImageWithPrompt(imagePrompt, parameters);
    
    console.log('[RUNWAY]', { requestId, event: 'starter_image_generated', hasImage: !!starterImage });

    // Create video generation task
    const taskResponse = await fetch('https://api.dev.runwayml.com/v1/image_to_video', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${runwayApiKey}`,
        'Content-Type': 'application/json',
        'X-Runway-Version': '2024-11-06', // Required header
      },
      body: JSON.stringify({
        promptImage: `data:image/${starterImage.format};base64,${starterImage.content}`,
        model: 'gen3a_turbo',
        promptText: prompt,
        duration: duration,
        ratio: ratio, // Use the properly mapped ratio
        seed: Math.floor(Math.random() * 1000000)
      }),
    });

    if (!taskResponse.ok) {
      const errorData = await taskResponse.json();
      console.error('[RUNWAY]', { requestId, event: 'task_creation_failed', error: errorData });
      throw new Error(`Runway task creation failed`);
    }

    const taskData = await taskResponse.json();
    const taskId = taskData.id;
    
    console.log('[RUNWAY]', { requestId, event: 'task_created', taskId });

    // Poll for completion with timeout
    const maxAttempts = 60; // 5 minutes max
    let attempts = 0;

    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
      attempts++;

      try {
        const statusResponse = await fetch(`https://api.dev.runwayml.com/v1/tasks/${taskId}`, {
          headers: { 
            'Authorization': `Bearer ${runwayApiKey}`,
            'X-Runway-Version': '2024-11-06' // Required header
          },
        });

        if (!statusResponse.ok) {
          console.warn('[RUNWAY]', { requestId, event: 'status_check_failed', attempt: attempts });
          continue;
        }

        const statusData = await statusResponse.json();
        console.log('[RUNWAY]', { 
          requestId, 
          event: 'status_check', 
          attempt: attempts, 
          status: statusData.status,
          progress: statusData.progress 
        });

        if (statusData.status === 'SUCCEEDED' && statusData.output?.[0]) {
          console.log('[RUNWAY]', { requestId, event: 'generation_success', attempts });
          return {
            type: 'video',
            content: statusData.output[0],
            format: 'mp4',
            parameters,
            prompt: imagePrompt,
            duration: duration,
            taskId: taskId
          };
        }

        if (statusData.status === 'FAILED') {
          console.error('[RUNWAY]', { requestId, event: 'task_failed', attempts, error: statusData.failure_reason });
          break;
        }
      } catch (pollError) {
        console.warn('[RUNWAY]', { requestId, event: 'polling_error', attempt: attempts, error: (pollError as Error).message });
      }
    }

    // Timeout or failure
    console.warn('[RUNWAY]', { requestId, event: 'generation_timeout', attempts });
    throw new Error('Runway generation timeout');

  } catch (error) {
    console.error('[RUNWAY]', { requestId, event: 'generation_failed', error: (error as Error).message });
  throw error;
}
}