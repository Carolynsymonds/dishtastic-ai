import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const runwayApiKey = Deno.env.get('RUNWAY_API_KEY');
const falApiKey = Deno.env.get('FAL_API_KEY');
const lumaApiKey = Deno.env.get('LUMA_API_KEY');

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

interface DishInfo {
  name: string;
  canonicalIngredients: string[];
  forbiddenIngredients: string[];
  cuisine: string;
  type: string;
  signatureTechnique?: string;
  culturalContext?: string;
}

// Enhanced dish database with signature techniques for personalized video generation  
const DISH_DB: Record<string, DishInfo & { signatureTechnique: string; culturalContext: string }> = {
  // Italian Pasta Dishes
  'carbonara': {
    name: 'Carbonara',
    canonicalIngredients: ['fresh pasta', 'eggs', 'pecorino romano cheese', 'guanciale', 'black pepper'],
    forbiddenIngredients: ['cream', 'garlic', 'bacon', 'parmesan', 'peas', 'mushrooms'],
    cuisine: 'Italian',
    type: 'pasta',
    signatureTechnique: 'The Emulsion Moment - Raw eggs meeting hot pasta to create silky carbonara sauce through precise temperature control',
    culturalContext: 'Roman trattorias where shepherds created this dish using available ingredients'
  },
  'aglio e olio': {
    name: 'Aglio e Olio',
    canonicalIngredients: ['spaghetti', 'garlic', 'olive oil', 'red pepper flakes', 'parsley'],
    forbiddenIngredients: ['cream', 'cheese', 'tomatoes', 'meat'],
    cuisine: 'Italian',
    type: 'pasta',
    signatureTechnique: 'The Golden Oil Dance - Garlic slowly transforming in olive oil, creating aromatic perfection without burning',
    culturalContext: 'Neapolitan midnight dish made from pantry staples'
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
    culturalContext: 'Bangkok street vendors mastering the balance of sweet, sour, salty, and spicy'
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
    culturalContext: 'American diners where the perfect patty meets flame for that iconic sear'
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

  try {
    const requestId = crypto.randomUUID();
    const startedAt = Date.now();
    const { prompt, parameters }: GenerationRequest = await req.json();
    
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
  // Enhance prompt for restaurant marketing photography
  const enhancedPrompt = `Restaurant marketing photography: ${prompt}. ${parameters.Background ? `Setting: ${parameters.Background}.` : ''} Professional restaurant lighting, premium presentation, appetite-inducing quality, social media ready.`;
  
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
    return createRestaurantMarketingPrompt(prompt, parameters);
  }

  try {
const systemPrompt = `You are a master restaurant marketing videographer specializing in appetite-driven promotional content that sells dishes. Create hyper-realistic video prompts that showcase the final dish as an irresistible hero product that customers want to order immediately.

RESTAURANT MARKETING OBJECTIVES:
- Showcase the dish as the star product ready to be served
- Create maximum appetite appeal and craving generation
- Focus on the most photogenic moment of the finished dish
- Highlight premium quality, freshness, and restaurant presentation
- Make viewers want to order this dish right now
- Generate content perfect for social media and marketing campaigns

VISUAL MARKETING REQUIREMENTS:
- Show perfectly plated, ready-to-eat final dish
- Professional restaurant-quality presentation and lighting
- Focus on steam, melted elements, and appetizing textures
- Capture the "hero shot" angle that looks most delicious
- Emphasize premium ingredients and careful plating
- Create scroll-stopping, craving-inducing visuals

APPETITE-DRIVEN FOCUS:
Identify the dish and showcase its most appetizing elements:

PASTA: Perfectly twirled portions with melted cheese, steam, glossy sauce
PIZZA: Melted cheese stretching, golden crust, fresh toppings glistening
BURGERS: Juicy layers stacked high, melted cheese dripping, perfect assembly
ASIAN: Beautiful plating with garnish, steam rising, vibrant colors
DESSERTS: Perfect presentation with textures, glazes, and artistic plating
GRILLED: Perfect grill marks, juices, optimal doneness showcase

FORBIDDEN MARKETING ELEMENTS:
- Raw ingredients or cooking process footage
- Educational cooking technique demonstrations
- Multiple dishes competing for attention
- Messy or unprofessional presentation
- Generic food styling without appetite appeal
- Anything that doesn't directly sell the finished dish

Schema (return JSON only):
{
  "marketing_framework": {
    "dish_identity": "specific dish name and cuisine style",
    "hero_moment": "the most appetizing visual moment of the finished dish",
    "appetite_triggers": "specific elements that create craving (steam, melting, textures)",
    "selling_proposition": "what makes this dish irresistible to order"
  },
  "restaurant_presentation": {
    "plating_style": "professional | rustic elegant | modern artistic | traditional authentic",
    "lighting": "warm restaurant | natural daylight | dramatic spotlight | cozy ambient",
    "camera_angle": "hero overhead | intimate close-up | appetizing side angle | social media perfect"
  },
  "appetite_elements": {
    "premium_presentation": "perfectly plated dish on appropriate restaurant servingware",
    "steam_effects": "natural steam rising from hot, fresh dish",
    "texture_highlights": "melted cheese, glossy sauces, crispy elements, fresh garnish",
    "color_vibrancy": "appetizing colors that pop and create craving"
  },
  "marketing_focus": {
    "hero_shot": "the 2-3 second moment that best sells this dish",
    "appetite_sequence": "steam, texture, garnish, perfect presentation angle",
    "serving_context": "restaurant table setting, appropriate ambiance",
    "craving_cues": "visual elements that make viewers hungry immediately"
  },
  "runway_prompt": "restaurant marketing video showcasing finished dish as irresistible hero product"
}

Instructions:
- FIRST identify the specific dish and its most appetizing presentation moment
- Create a marketing narrative showcasing the finished dish as hero product
- Focus on appetite appeal and craving generation, not cooking education
- runway_prompt must describe the perfect finished dish ready to be served
- Emphasize restaurant quality presentation and irresistible visual appeal
- Make the viewer want to order this dish immediately`;

    const userPrompt = `Create an appetizing restaurant marketing video for: ${prompt}
    
Parameters:
- Format: ${parameters.Format || 'Video'}
- Aspect Ratio: ${parameters.Scale || '16:9'} 
- Duration: ${parameters.Length || '5s'}
- Style Focus: ${parameters['Video Style'] || 'Hero Shot'}
- Setting: ${parameters.Background || 'Restaurant Table'}

Focus on finished dish presentation that creates maximum appetite appeal and makes viewers want to order immediately. Show the dish as an irresistible hero product.`;

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
  
  // Parse dish to get presentation information
  const dishInfo = parseDishName(prompt);
  let dishSpecificContent = prompt;
  
  if (dishInfo) {
    // Create marketing-focused description
    const keyIngredients = dishInfo.canonicalIngredients.slice(0, 3).join(', ');
    dishSpecificContent = `${dishInfo.name}: Premium ${dishInfo.cuisine} ${dishInfo.type} featuring ${keyIngredients}`;
    
    console.log(`Restaurant marketing for ${dishInfo.name}: showcasing finished presentation`);
  }
  
  // Marketing-focused narratives for finished dish presentation
  const getMarketingStory = (dishInfo: DishInfo | null, actionStyle: string): string => {
    if (!dishInfo) return 'Perfectly plated restaurant dish presented at its most appetizing moment. Professional presentation with steam rising, textures glistening, and premium quality evident in every detail.';
    
    // Restaurant marketing narratives focused on selling the dish
    const marketingNarratives: Record<string, string> = {
      'Hero Shot': `${dishInfo.name} presented as the ultimate hero dish - perfectly plated with restaurant-quality presentation. Steam gently rising from the hot, fresh ${dishInfo.cuisine} creation. Every element positioned to showcase premium quality and create immediate craving. The dish looks absolutely irresistible and ready to be served.`,
      
      'Appetite Builder': `Mouth-watering ${dishInfo.name} showcased at peak appetizing moment. Golden, glistening textures catch the light perfectly. Steam rises naturally from the hot, fresh dish while ${dishInfo.canonicalIngredients.slice(0, 2).join(' and ')} display their premium quality. This is the shot that makes customers order immediately.`,
      
      'Social Media Perfect': `Instagram-worthy ${dishInfo.name} captured at its most photogenic angle. Professional restaurant plating with vibrant colors and perfect garnish placement. The finished ${dishInfo.cuisine} dish looks absolutely delicious and share-worthy - guaranteed to generate likes and cravings.`,
      
      'Craving Generator': `Irresistible ${dishInfo.name} presented in all its glory. Melted elements stretch perfectly, steam creates atmosphere, and every ${dishInfo.canonicalIngredients.slice(0, 2).join(' and ')} element looks premium and fresh. The kind of presentation that makes viewers immediately want to place an order.`
    };
    
    // Enhanced style mapping for restaurant marketing
    const marketingStyleMap: Record<string, string> = {
      'Ingredient Drop': `Beautiful final presentation of ${dishInfo.name} with fresh garnish being delicately placed on top. Each ${dishInfo.canonicalIngredients.slice(-2).join(' and ')} element adds the perfect finishing touch to an already stunning restaurant-quality dish.`,
      
      'Slow-Mo Pour': `Luxurious sauce or dressing being artistically drizzled over perfectly plated ${dishInfo.name}. The liquid flows with perfect viscosity, creating beautiful patterns that enhance the premium restaurant presentation.`,
      
      'Steam Rising': `Hot, fresh ${dishInfo.name} with natural steam rising dramatically, showcasing how recently prepared and piping hot this restaurant-quality dish is. The steam creates an atmospheric effect that screams "order me now."`,
      
      'Cheese Pull': dishInfo.canonicalIngredients.some(ing => ing.includes('cheese')) ?
        `Perfect cheese stretch from expertly prepared ${dishInfo.name}. The ${dishInfo.canonicalIngredients.find(ing => ing.includes('cheese'))} melts beautifully, creating that satisfying stretch that makes every cheese lover's mouth water.` :
        'Satisfying stretch of melted elements creating that perfect, crave-worthy texture.',
      
      'Sizzle Effect': `${dishInfo.name} still gently sizzling from the kitchen, proving its fresh-from-the-grill quality. The authentic cooking sounds and visual effects demonstrate this is a premium, made-to-order restaurant dish.`,
      
      'Garnish Drop': `Final artistic touches being added to restaurant-quality ${dishInfo.name}. Fresh garnish drops gracefully onto the perfectly plated dish, completing the premium presentation that customers pay top dollar for.`,
      
      'Liquid Drizzle': `Signature sauce artistically applied to ${dishInfo.name} in the restaurant's signature style. The drizzle pattern showcases culinary artistry and premium attention to detail.`,
      
      'Whisk Action': `Final texture perfection achieved in ${dishInfo.name} preparation. The smooth, creamy consistency of ${dishInfo.canonicalIngredients.slice(0, 2).join(' and ')} demonstrates restaurant-quality technique and premium ingredients.`
    };
    
    return marketingNarratives[actionStyle] || marketingStyleMap[actionStyle] || 
           `Premium ${dishInfo.name} showcased in restaurant-quality presentation that creates immediate appetite appeal and ordering desire.`;
  };
  
  const marketingStory = getMarketingStory(dishInfo, actionStyle);
  const restaurantSetting = background ? `Beautifully presented in an elegant ${background} setting that enhances the premium dining experience.` : '';
  
  let finalPrompt = `Restaurant marketing hero shot: ${dishSpecificContent}. ${restaurantSetting} ${marketingStory} 

MARKETING REQUIREMENTS: Professional restaurant presentation with premium lighting. Perfect plating that showcases quality and craftsmanship. All elements positioned for maximum appetite appeal. Steam, textures, and colors optimized to create immediate craving and ordering desire.

FORBIDDEN: Raw ingredients, cooking process, messy presentation, educational content, anything that doesn't directly sell the finished dish as a premium restaurant product.`;
  
  // Add marketing enhancement notes and authenticity
  if (dishInfo) {
    if (dishInfo.forbiddenIngredients.length > 0) {
      finalPrompt += ` NEVER SHOW: ${dishInfo.forbiddenIngredients.join(', ')} - these are not part of authentic ${dishInfo.name} presentation.`;
    }
    if (dishInfo.culturalContext) {
      finalPrompt += ` Premium quality: This ${dishInfo.culturalContext} represents restaurant excellence and artisanal preparation.`;
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
  const basePrompt = `You are a master food video cinematographer specializing in hyper-realistic culinary storytelling for Luma Dream Machine. Create prompts that generate authentic cooking videos with cultural depth and realistic technique demonstration.

REALISM REQUIREMENTS FOR LUMA:
- All movements must be natural and physically accurate
- Ingredients behave with realistic physics (no floating elements)
- Chef hands move with professional precision and authentic technique
- Cooking timing matches real culinary processes
- Steam, heat effects, and sizzling occur naturally
- Tools and surfaces appropriate for the specific cuisine

STORYTELLING ELEMENTS:
- Focus on ONE signature technique that defines the dish
- Show the cultural story behind the cooking method  
- Capture the emotional journey from ingredients to completed dish
- Highlight authentic preparation methods from the dish's origin

TECHNICAL SPECIFICATIONS FOR LUMA:
- Use specific motion verbs: "stirring", "sautéing", "kneading", "chopping"
- Describe realistic timing: "slowly", "gradually", "with precision"
- Include natural physics: "steam rising naturally", "oil glistening"
- Specify authentic tools: "wooden spoon", "cast iron pan", "marble surface"
- Avoid generic terms: replace "food" with specific dish names

FORBIDDEN FOR REALISM:
- Ingredients floating without support or reason
- Multiple unrelated dishes in one frame
- Artificial or CGI-like movements
- Inauthentic ingredients for the specific dish
- Generic "food styling" without cultural context
- Unrealistic gravity or physics

OUTPUT FORMAT: Single paragraph, 200-400 characters, focusing on authentic technique demonstration with realistic motion and cultural storytelling.`;

  const modeSpecific = {
    'text-to-video': '\nVIDEO FOCUS: Describe the complete cooking technique sequence with natural timing and authentic hand movements.',
    'image-to-video': '\nMOTION FOCUS: Show how the static ingredients transform through realistic cooking technique with natural physics.',
    'text-to-image': '\nSTILL FOCUS: Capture the peak moment of technique execution with authentic setup and cultural context.'
  };

  return basePrompt + (modeSpecific[mode as keyof typeof modeSpecific] || '');
}

function createBasicLumaPrompt(prompt: string, parameters: any, mode: string): string {
  const dishInfo = parseDishName(prompt);
  const technique = dishInfo?.signatureTechnique || 'traditional cooking technique';
  
  const realisticMotion = mode === 'text-to-video' ? 
    ', professional hands demonstrating authentic technique with natural timing and realistic ingredient physics' : 
    ', positioned for authentic cooking action';
    
  const culturalContext = dishInfo?.cuisine ? `, ${dishInfo.cuisine} cultural authenticity` : '';
  const lighting = ', natural kitchen lighting, professional cinematography';
  const quality = ', hyper-realistic detail, no artificial effects';
  
  let enhancedPrompt = `${prompt}. ${technique}${realisticMotion}${culturalContext}${lighting}${quality}`;
  
  // Add forbidden ingredient exclusion
  if (dishInfo?.forbiddenIngredients.length > 0) {
    enhancedPrompt += `. EXCLUDE: ${dishInfo.forbiddenIngredients.slice(0, 3).join(', ')}`;
  }
  
  return enhancedPrompt.slice(0, 500);
}

function createMotionOptimizedImagePrompt(prompt: string, parameters: any): string {
  return `Professional food photography setup for video animation: ${prompt}. Perfect for motion generation, optimal ingredient placement, clear textures, studio lighting, ready for dynamic movement, high resolution commercial quality.`;
}


async function generateVideo(prompt: string, parameters: any) {
  const requestId = crypto.randomUUID();
  const startTime = Date.now();
  const strictVideo = parameters?.StrictVideo === true;
  
  console.log('[VIDEO-GEN]', { 
    requestId, 
    event: 'generation_start',
    hasLuma: !!lumaApiKey,
    hasRunway: !!runwayApiKey,
    parameters,
    promptPreview: prompt.slice(0, 100)
  });
  console.log('[VIDEO-GEN]', { requestId, event: 'strict_video_mode', strictVideo });

  // ===== INTELLIGENT ROUTING BASED on INPUT TYPE =====
  
  // Check if user uploaded an image
  const hasUploadedImage = parameters.uploadedImage;
  
  if (hasUploadedImage) {
    console.log('[VIDEO-GEN]', { requestId, event: 'image_uploaded_routing_to_image_to_video' });
    
    // Route 1: Image Upload → Image-to-Video Priority
    // 1. PRIMARY: Luma Image-to-Video (with uploaded image)
    if (lumaApiKey) {
      try {
        console.log('[VIDEO-GEN]', { requestId, event: 'trying_luma_image_to_video_with_upload' });
        const result = await generateVideoWithLuma(prompt, { 
          ...parameters,
          mode: 'image_to_video',
          image_url: parameters.uploadedImage 
        }, 'image-to-video');
        
        console.log('[VIDEO-GEN]', { 
          requestId, 
          event: 'luma_image_to_video_success',
          actualType: result.type,
          actualFormat: result.format,
          contentPreview: result.content?.slice(0, 100),
          totalMs: Date.now() - startTime
        });
        
        return result;
      } catch (error) {
        console.warn('[VIDEO-GEN]', { 
          requestId, 
          event: 'luma_image_to_video_failed', 
          error: (error as Error).message,
          fallback: 'runway_gen3'
        });
      }
    }
    
    // 2. SECONDARY: Runway Gen-3 Alpha (fallback for image uploads)
    if (runwayApiKey) {
      try {
        console.log('[VIDEO-GEN]', { requestId, event: 'trying_runway_gen3_after_luma_failed' });
        const result = await generateVideoWithRunway(prompt, parameters);
        
        console.log('[VIDEO-GEN]', { 
          requestId, 
          event: 'runway_gen3_success', 
          totalMs: Date.now() - startTime
        });
        
        return result;
      } catch (error) {
        console.warn('[VIDEO-GEN]', { 
          requestId, 
          event: 'runway_gen3_failed', 
          error: (error as Error).message,
          fallback: 'static_image'
        });
      }
    }
  } else {
    console.log('[VIDEO-GEN]', { requestId, event: 'text_only_routing_to_text_to_video' });
    
    // Route 2: Text Only → Text-to-Video Priority
    // 1. PRIMARY: Luma Text-to-Video
    if (lumaApiKey) {
      try {
        console.log('[VIDEO-GEN]', { requestId, event: 'trying_luma_text_to_video' });
        const result = await generateVideoWithLuma(prompt, parameters, 'text-to-video');
        
        console.log('[VIDEO-GEN]', { 
          requestId, 
          event: 'luma_text_to_video_success',
          actualType: result.type,
          actualFormat: result.format,
          contentPreview: result.content?.slice(0, 100),
          totalMs: Date.now() - startTime
        });
        
        return result;
      } catch (error) {
        console.warn('[VIDEO-GEN]', { 
          requestId, 
          event: 'luma_text_to_video_failed', 
          error: (error as Error).message,
          fallback: 'luma_image_to_video'
        });
      }
    }

    // 2. SECONDARY: Luma Image-to-Video (generate image first, then video)
    if (lumaApiKey) {
      try {
        console.log('[VIDEO-GEN]', { requestId, event: 'trying_luma_image_to_video_generated' });
        const result = await generateImageToVideoWithLuma(prompt, parameters);
        
        console.log('[VIDEO-GEN]', { 
          requestId, 
          event: 'luma_image_to_video_success',
          actualType: result.type,
          actualFormat: result.format,
          contentPreview: result.content?.slice(0, 100),
          totalMs: Date.now() - startTime
        });
        
        return result;
      } catch (error) {
        console.warn('[VIDEO-GEN]', { 
          requestId, 
          event: 'luma_image_to_video_failed', 
          error: (error as Error).message,
          fallback: 'runway_gen3'
        });
      }
    }

    // 3. TERTIARY: Runway Gen-3 Alpha (fallback after both Luma methods)
    if (runwayApiKey) {
      try {
        console.log('[VIDEO-GEN]', { requestId, event: 'trying_runway_gen3_after_luma_methods' });
        const result = await generateVideoWithRunway(prompt, parameters);
        
        console.log('[VIDEO-GEN]', { 
          requestId, 
          event: 'runway_gen3_success',
          actualType: result.type,
          actualFormat: result.format,
          contentPreview: result.content?.slice(0, 100),
          totalMs: Date.now() - startTime
        });
        
        return result;
      } catch (error) {
        console.warn('[VIDEO-GEN]', { 
          requestId, 
          event: 'runway_gen3_failed', 
          error: (error as Error).message,
          fallback: 'static_image'
        });
      }
    }
  }

  // 3. TERTIARY: Runway Gen-3 Alpha (fallback after Luma)
  if (runwayApiKey) {
    try {
      console.log('[VIDEO-GEN]', { requestId, event: 'trying_runway_gen3' });
      const result = await generateVideoWithRunway(prompt, parameters);
      
      console.log('[VIDEO-GEN]', { 
        requestId, 
        event: 'runway_gen3_success', 
        totalMs: Date.now() - startTime
      });
      
      return result;
    } catch (error) {
      console.warn('[VIDEO-GEN]', { 
        requestId, 
        event: 'runway_gen3_failed', 
        error: (error as Error).message,
        fallback: 'static_image'
      });
    }
  }

  // 4. FINAL FALLBACK: Static Image with Motion Hints (ONLY if video was requested but failed)
  if (!strictVideo && openAIApiKey) {
    console.warn('[VIDEO-GEN]', { 
      requestId, 
      event: 'falling_back_to_static_image',
      reason: 'all_video_methods_failed',
      availableApis: { 
        luma: !!lumaApiKey, 
        runway: !!runwayApiKey, 
        openai: !!openAIApiKey 
      }
    });
    
    try {
      console.log('[VIDEO-GEN]', { requestId, event: 'trying_static_image_fallback' });
      
      const motionPrompt = `${prompt}. Professional food photography optimized for potential video animation, perfect composition for motion graphics, studio lighting, high resolution commercial quality.`;
      const imageResult = await generateImage(motionPrompt, parameters);
      
      console.log('[VIDEO-GEN]', { 
        requestId, 
        event: 'static_image_fallback_success',
        actualType: 'image',
        actualFormat: imageResult.format,
        contentPreview: imageResult.content?.slice(0, 100),
        fallbackReason: 'video_generation_failed',
        totalMs: Date.now() - startTime
      });
      
      return {
        ...imageResult,
        type: 'image', // Explicitly set as image since video generation failed
        fallbackReason: 'video_generation_failed',
        suggestedAction: 'Check API keys: FAL_API_KEY and RUNWAY_API_KEY must be configured for video generation',
        availableApis: { 
          luma: !!lumaApiKey, 
          runway: !!runwayApiKey, 
          openai: !!openAIApiKey 
        }
      };
    } catch (error) {
      console.error('[VIDEO-GEN]', { 
        requestId, 
        event: 'all_fallbacks_failed', 
        error: (error as Error).message,
        totalMs: Date.now() - startTime
      });
    }
  } else {
    console.warn('[VIDEO-GEN]', { requestId, event: 'strict_video_no_image_fallback' });
    throw new Error('All video generation methods failed (strict mode).');
  }

  // If all methods fail
  console.error('[VIDEO-GEN]', { 
    requestId, 
    event: 'complete_failure', 
    availableApis: { luma: !!lumaApiKey, runway: !!runwayApiKey, openai: !!openAIApiKey },
    totalMs: Date.now() - startTime
  });
  
  throw new Error('All video generation methods failed. Please check API configurations and try again.');
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