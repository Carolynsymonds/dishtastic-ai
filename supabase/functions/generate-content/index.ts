import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const runwayApiKey = Deno.env.get('RUNWAY_API_KEY');
const falApiKey = Deno.env.get('FAL_API_KEY');

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
    console.log('[generate-content]', { requestId, event: 'request_received', hasOPENAI: !!openAIApiKey, hasRUNWAY: !!runwayApiKey, hasFAL: !!falApiKey, parameters, promptPreview: (prompt || '').slice(0, 120) });

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
    return createTechniqueNarrative(prompt, parameters);
  }

  try {
const systemPrompt = `You are a master culinary cinematographer specializing in authentic, story-driven food videos. Create hyper-realistic video prompts that tell the cultural story of each dish through its signature cooking technique.

STORYTELLING PRINCIPLES:
- Focus on ONE authentic cooking technique that defines the dish
- Tell the cultural story of how this dish comes alive
- Show realistic cooking processes with proper timing
- Use only authentic ingredients and traditional methods
- Avoid any artificial, floating, or unrealistic elements
- Create emotional connection through technique mastery

REALISM REQUIREMENTS:
- Hands must move naturally and purposefully
- Ingredients behave with realistic physics
- Cooking surfaces, tools, and environment must be authentic
- Steam, sizzling, and heat effects appear naturally
- Timing matches real cooking processes
- No CGI-like effects or impossible movements

DISH-SPECIFIC STORYTELLING:
Identify the dish and focus on its signature moment:

PASTA: The precise technique (carbonara emulsion, cacio e pepe mantecatura, aglio e olio golden oil)
ASIAN: Wok mastery, knife skills, or traditional preparation methods
BAKING: Dough transformation, layering techniques, traditional shaping
GRILLING: Heat control, timing, and authentic preparation

FORBIDDEN ELEMENTS:
- Ingredients floating in air without support
- Unrealistic gravity-defying movements  
- Generic "food styling" without cultural context
- Inauthentic ingredients for the specific dish
- Artificial or CGI-like visual effects
- Multiple dishes or unrelated objects in frame

Schema (return JSON only):
{
  "story_framework": {
    "dish_identity": "specific dish name and cultural origin",
    "signature_technique": "the ONE defining cooking method",
    "cultural_narrative": "how this technique tells the dish's cultural story",
    "emotional_arc": "the transformation journey from ingredients to completed dish"
  },
  "realistic_cinematography": {
    "camera_behavior": "steady handheld | locked tripod | gentle tracking | intimate macro",
    "lighting": "natural kitchen | warm cooking light | authentic restaurant | traditional preparation space",
    "timing": "real cooking pace | slow technique focus | natural rhythm"
  },
  "authentic_elements": {
    "cooking_surface": "traditional cookware and appropriate cooking surface",
    "chef_hands": "realistic hand movements showing proper technique",
    "ingredient_physics": "natural falling, mixing, and cooking behaviors",
    "sound_design": "authentic cooking sounds - sizzling, chopping, mixing"
  },
  "technique_focus": {
    "critical_moment": "the 2-3 second technique that defines this dish",
    "ingredient_sequence": "realistic order of ingredient addition",
    "tool_usage": "authentic cooking tools used properly",
    "temperature_cues": "steam, color changes, texture transformation"
  },
  "runway_prompt": "story-driven realistic cooking video description focusing on authentic technique"
}

Instructions:
- FIRST identify the specific dish and its ONE signature technique
- Create a realistic narrative showing hands performing authentic technique
- Focus on the cultural story behind the cooking method
- runway_prompt must describe realistic cooking action with authentic timing
- Remove any elements that could create floating or unrealistic visuals
- Emphasize proper technique execution and cultural authenticity`;

    const userPrompt = `Create a realistic, story-driven video for: ${prompt}
    
Parameters:
- Format: ${parameters.Format || 'Video'}
- Aspect Ratio: ${parameters.Scale || '16:9'} 
- Duration: ${parameters.Length || '5s'}
- Style Focus: ${parameters['Video Style'] || 'Signature Technique'}
- Setting: ${parameters.Background || 'Professional Kitchen'}

Focus on authentic cooking technique and cultural storytelling. Make it look completely real with proper physics and timing.`;

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
    return createTechniqueNarrative(prompt, parameters);
  }
}

function createTechniqueNarrative(prompt: string, parameters: any): string {
  const actionStyle = parameters['Video Style'];
  const background = parameters.Background;
  
  // Parse dish to get technique information
  const dishInfo = parseDishName(prompt);
  let dishSpecificContent = prompt;
  
  if (dishInfo) {
    // Create realistic technique-focused description
    const ingredientList = dishInfo.canonicalIngredients.slice(0, 3).join(', '); // Limit to core ingredients
    dishSpecificContent = `${dishInfo.name}: authentic ${dishInfo.cuisine} preparation showcasing ${ingredientList}`;
    
    console.log(`Realistic technique for ${dishInfo.name}: ${dishInfo.signatureTechnique || 'traditional method'}`);
  }
  
  // Realistic story-driven narratives focusing on authentic technique
  const getRealisticStory = (dishInfo: DishInfo | null, actionStyle: string): string => {
    if (!dishInfo) return 'Professional chef hands performing authentic cooking technique with realistic timing and natural movements. Focus on proper tool usage and ingredient interaction with natural physics.';
    
    // Story-driven technique narratives with realism emphasis
    const realisticNarratives: Record<string, string> = {
      'Signature Technique': `${dishInfo.signatureTechnique || 'Traditional preparation'} - Professional chef hands demonstrating the authentic ${dishInfo.cuisine} technique. Each movement precise and purposeful, ingredients responding naturally to heat and handling. The camera captures the cultural mastery behind this time-honored cooking method.`,
      
      'Cultural Story': `${dishInfo.culturalContext || `Traditional ${dishInfo.cuisine} kitchen story`} - Experienced hands recreating generations of culinary wisdom. The scene tells the story of how ${dishInfo.name} comes alive through authentic technique, with realistic cooking timing and natural ingredient transformation.`,
      
      'Transformation Drama': `The pivotal moment when ${dishInfo.canonicalIngredients.slice(0, 2).join(' meets ')} through precise ${dishInfo.cuisine} technique. Professional hands guide the natural transformation with realistic timing - no artificial effects, just authentic cooking mastery creating ${dishInfo.name}.`,
      
      'Sensory Journey': `Experiencing authentic ${dishInfo.name} creation through sound, texture, and aroma. Professional technique creates natural steam, realistic sizzling, and proper color changes as ingredients transform through traditional ${dishInfo.cuisine} methods.`
    };
    
    // Enhanced legacy style mapping with realism focus
    const realisticStyleMap: Record<string, string> = {
      'Ingredient Drop': `Professional chef assembly of ${dishInfo.name}: expert hands guiding ingredients into proper position with natural timing and realistic physics. Each ${dishInfo.canonicalIngredients.slice(0, 2).join(' and ')} element placed with traditional technique precision, creating authentic cooking motion without artificial floating or CGI effects.`,
      
      'Slow-Mo Pour': `The signature pouring technique for ${dishInfo.name} - liquid ingredients flowing naturally with proper viscosity and realistic behavior. Professional hands control the pour with authentic ${dishInfo.cuisine} technique, creating natural patterns and textures.`,
      
      'Steam Rising': `Natural steam formation from properly heated ${dishInfo.name} preparation. Authentic cooking temperature creates realistic vapor patterns, showing the energy and heat of traditional ${dishInfo.cuisine} technique with natural timing and dissipation.`,
      
      'Cheese Pull': dishInfo.canonicalIngredients.some(ing => ing.includes('cheese')) ?
        `Natural cheese stretch showcasing perfect ${dishInfo.canonicalIngredients.find(ing => ing.includes('cheese'))} texture achieved through proper heating technique. Professional hands demonstrate authentic stretching motion with realistic cheese behavior and natural breaking point.` :
        'Realistic melted element stretching with natural texture physics and authentic cooking technique.',
      
      'Sizzle Effect': `Authentic sizzling sounds and visual effects from properly heated ${dishInfo.name} preparation. Natural oil behavior, realistic bubble formation, and genuine cooking reactions create the sensory experience of traditional ${dishInfo.cuisine} technique.`,
      
      'Garnish Drop': `Final traditional presentation touches for ${dishInfo.name} - professional hands adding authentic garnishes with precise placement technique. Each element added with cultural accuracy and realistic settling behavior.`,
      
      'Liquid Drizzle': `Traditional sauce or oil application for ${dishInfo.name} using authentic ${dishInfo.cuisine} technique. Natural liquid flow with proper viscosity, creating realistic patterns and absorption into ingredients.`,
      
      'Whisk Action': `Professional whisking technique transforming ${dishInfo.canonicalIngredients.slice(0, 2).join(' and ')} with authentic ${dishInfo.cuisine} method. Natural mixing motion creating realistic texture changes and proper ingredient integration.`
    };
    
    return realisticNarratives[actionStyle] || realisticStyleMap[actionStyle] || 
           `${dishInfo.signatureTechnique || 'Authentic cooking technique'} - Professional demonstration with realistic timing, natural hand movements, and traditional ${dishInfo.cuisine} cultural precision.`;
  };
  
  const realisticStory = getRealisticStory(dishInfo, actionStyle);
  const culturalSetting = background ? `Set in an authentic ${background} that honors ${dishInfo?.cuisine || 'culinary'} tradition.` : '';
  
  let finalPrompt = `Hyper-realistic culinary storytelling: ${dishSpecificContent}. ${culturalSetting} ${realisticStory} 

TECHNICAL REQUIREMENTS: Professional cinematography with natural lighting. Steady camera work capturing authentic technique. All ingredients behave with realistic physics - no floating elements or artificial movements. Steam, heat effects, and cooking sounds occur naturally. Chef hands move with professional precision and cultural authenticity.

FORBIDDEN: Artificial floating ingredients, CGI-like effects, unrealistic gravity, multiple unrelated dishes, inauthentic cooking methods, generic food styling without cultural context.`;
  
  // Add authenticity notes and forbidden ingredient removal
  if (dishInfo) {
    if (dishInfo.forbiddenIngredients.length > 0) {
      finalPrompt += ` EXCLUDE completely: ${dishInfo.forbiddenIngredients.join(', ')} - these are inauthentic for ${dishInfo.name}.`;
    }
    if (dishInfo.culturalContext) {
      finalPrompt += ` Cultural authenticity: ${dishInfo.culturalContext}`;
    }
  }
  
  return finalPrompt;
}

function createMotionImagePrompt(prompt: string, parameters: any): string {
  const videoStyle = parameters['Video Style'];
  const background = parameters.Background;
  
  // Parse dish to get specific ingredients
  const dishInfo = parseDishName(prompt);
  let dishSpecificContent = prompt;
  
  if (dishInfo) {
    // Create dish-specific description with canonical ingredients
    const ingredientList = dishInfo.canonicalIngredients.join(', ');
    dishSpecificContent = `${dishInfo.name}: ${dishInfo.cuisine} ${dishInfo.type} featuring ${ingredientList}`;
    console.log(`Image prompt for ${dishInfo.name}: using [${ingredientList}]`);
  }
  
  // Create assembly-ready image compositions for realistic motion generation
  const getAssemblyImageSetup = (dishInfo: DishInfo | null): string => {
    if (!dishInfo) return 'Fresh ingredients naturally positioned above the dish with perfect spacing for assembly motion';
    
    const imageSetups: Record<string, string> = {
      'Carbonara': 'Hot steaming pasta suspended above a bowl at varying heights, with freshly cracked eggs positioned to pour in golden streams, grated pecorino romano ready to rain down and melt on contact, crispy guanciale pieces arranged to bounce naturally into place, black peppercorns positioned for final sprinkling cascade - all arranged for sequential dropping with realistic cooking physics',
      'Aglio e Olio': 'Al dente spaghetti hovering above a warm plate, with golden garlic-infused olive oil captured mid-drizzle trajectory, red pepper flakes positioned to scatter with natural bounce, fresh parsley leaves arranged to fall like confetti with authentic leaf physics',
      'Cacio e Pepe': 'Hot spaghetti suspended over a warm bowl with visible steam rising, pecorino romano cheese positioned at perfect melting height for heat contact, black peppercorns arranged in natural scattering formation ready to bounce and settle authentically',
      'Pad Thai': 'Rice noodles positioned above a sizzling hot wok, with tamarind sauce ready to splash down with realistic liquid physics, bean sprouts and shrimp arranged in natural dropping sequence, lime wedges positioned for dynamic juice spray finale',
      'Ramen': 'Fresh ramen noodles suspended above steaming rich broth, with chashu pork slices ready to settle naturally, halved soft-boiled eggs positioned to drop with authentic weight, green onions and nori sheets arranged for graceful floating descent',
      'Tacos': 'Warm tortillas laid flat with seasoned meat positioned for authentic gravity drop and natural spread, diced onions ready to scatter with realistic bounce physics, fresh cilantro arranged to fall like green confetti, lime juice captured in mid-spray droplets'
    };
    
    return imageSetups[dishInfo.name] || `${dishInfo.canonicalIngredients.join(', ')} positioned in assembly formation above the dish, arranged to show proper cooking sequence and authentic ingredient layering`;
  };

  // Create image prompts optimized for realistic motion generation
  const motionSetups = {
    'Ingredient Drop': `Dynamic chef assembly setup: ${getAssemblyImageSetup(dishInfo)}. Professional chef hands subtly visible, positioned to guide the authentic cooking process. Ingredients arranged at natural falling heights with realistic spacing for sequential dropping motion - heavier base ingredients positioned higher for impactful drops, delicate garnishes positioned for graceful cascading. The composition emphasizes realistic cooking physics and authentic ingredient interactions.`,
    'Slow-Mo Pour': 'Liquid captured at the perfect pouring moment with realistic trajectory, positioned for smooth, natural flowing motion with authentic viscosity and stream patterns',
    'Steam Rising': 'Freshly prepared hot dish with natural steam patterns beginning to rise, positioned to show authentic heat emanation and organic vapor movement',
    'Cheese Pull': dishInfo?.canonicalIngredients.some(ing => ing.includes('cheese'))
      ? `Perfectly melted ${dishInfo.canonicalIngredients.find(ing => ing.includes('cheese'))} in natural stretch position with golden, elastic texture, arranged for authentic cheese-pulling motion that showcases realistic dairy physics`
      : 'Perfectly melted cheese in natural stretch position with golden, elastic texture, arranged for authentic cheese-pulling motion that showcases realistic dairy physics',
    'Sizzle Effect': 'Food positioned in hot cooking environment with natural heat effects and authentic bubbling patterns that suggest realistic cooking processes',
    'Garnish Drop': dishInfo?.canonicalIngredients.slice(-2).join(' and ')
      ? `${dishInfo.canonicalIngredients.slice(-2).join(' and ')} naturally positioned above the dish with perfect spacing for graceful falling motion and authentic scatter patterns`
      : 'Fresh herbs or seasonings naturally positioned above the dish with perfect spacing for graceful falling motion and authentic scatter patterns',
    'Liquid Drizzle': 'Sauce, honey, or oil positioned for natural drizzling motion with realistic viscosity patterns and authentic flow behavior',
    'Whisk Action': dishInfo
      ? `${dishInfo.canonicalIngredients.slice(0, 2).join(' and ')} arranged in natural mixing position with authentic textures that suggest realistic blending and fluid dynamics`
      : 'Ingredients arranged in natural mixing position with authentic textures that suggest realistic blending and fluid dynamics'
  };
  
  const motionSetup = motionSetups[videoStyle as keyof typeof motionSetups] || 'Food beautifully arranged for natural, appetizing motion and authentic culinary behavior';
  const backgroundEnhancement = background ? `Set in a stunning ${background} environment that enhances the food presentation.` : '';
  
  let finalPrompt = `Professional food photography: ${dishSpecificContent}. ${backgroundEnhancement} ${motionSetup}. The composition emphasizes realistic food physics and natural culinary processes with perfect lighting that showcases authentic textures, vibrant colors, and appetizing details optimized for the most realistic motion generation.`;
  
  // Add negative prompts for forbidden ingredients if we have dish info
  if (dishInfo && dishInfo.forbiddenIngredients.length > 0) {
    finalPrompt += ` Avoid: ${dishInfo.forbiddenIngredients.join(', ')}.`;
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

  if (!falApiKey) {
    console.error('[LUMA-VIDEO]', { requestId, event: 'error', error: 'Fal.ai API key not configured' });
    throw new Error('Fal.ai API key not configured');
  }

  // Enhanced parameter mapping with detailed logging
  const aspectRatio = mapScaleToAspectRatio(parameters.Scale || '16:9');
  const duration = mapLengthToDuration(parameters.Length || 'Medium');
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

  // Prepare API request body
  const requestBody: any = {
    prompt: enhancedPrompt,
    aspect_ratio: aspectRatio,
    loop: shouldLoop,
  };

  // Add starter image for image-to-video mode
  if (generationMode === 'image-to-video' && starterImageUrl) {
    requestBody.image_url = starterImageUrl;
    console.log('[LUMA-VIDEO]', { requestId, event: 'image_to_video_mode', starterImageUrl: starterImageUrl.slice(0, 100) });
  }

  console.log('[LUMA-VIDEO]', { 
    requestId, 
    event: 'api_request_start', 
    endpoint: 'luma-dream-machine',
    requestBodySize: JSON.stringify(requestBody).length
  });

  try {
    const apiCallStart = Date.now();
    const response = await fetch('https://queue.fal.ai/fal-ai/luma-dream-machine', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${falApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('[LUMA-VIDEO]', { 
      requestId, 
      event: 'api_response', 
      status: response.status, 
      statusText: response.statusText,
      ms: Date.now() - apiCallStart
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('[LUMA-VIDEO]', { 
        requestId, 
        event: 'api_error', 
        status: response.status,
        error: errorData
      });
      throw new Error(`Luma Dream Machine API error: ${errorData.error || errorData.detail || 'Unknown error'}`);
    }

    const data = await response.json();
    const totalTime = Date.now() - startTime;
    
    console.log('[LUMA-VIDEO]', { 
      requestId, 
      event: 'generation_success', 
      totalMs: totalTime,
      videoUrl: data.video?.url?.slice(0, 100),
      hasTaskId: !!data.request_id
    });

    return {
      type: 'video',
      content: data.video.url,
      format: 'mp4',
      parameters,
      prompt: enhancedPrompt,
      duration: duration,
      taskId: data.request_id,
      generationMode,
      aspectRatio
    };

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

  if (!falApiKey) {
    throw new Error('Fal.ai API key not configured');
  }

  try {
    const enhancedPrompt = await createLumaOptimizedPrompt(prompt, parameters, 'text-to-image');
    const aspectRatio = mapScaleToAspectRatio(parameters.Scale || '1:1');
    
    console.log('[LUMA-T2I]', { 
      requestId, 
      event: 'api_request', 
      aspectRatio,
      promptLength: enhancedPrompt.length
    });

    const response = await fetch('https://queue.fal.ai/fal-ai/luma-photon', {
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
    '2:3': '2:3', 
    '9:16': '9:16',
    'Landscape': '16:9',
    '16:9': '16:9',
    'Square': '1:1',
    '1:1': '1:1',
    '4:3': '4:3'
  };
  
  const result = mapping[scale] || '16:9';
  console.log('[PARAM-MAP]', { event: 'aspect_ratio_mapped', input: scale, output: result });
  return result;
}

function mapLengthToDuration(length: string): number {
  const mapping: Record<string, number> = {
    'Short': 3,
    'Medium': 5, 
    'Long': 10
  };
  
  const result = mapping[length] || 5;
  console.log('[PARAM-MAP]', { event: 'duration_mapped', input: length, output: result });
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
        model: 'gpt-5-2025-08-07',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Create optimized prompt for: ${prompt}\nParameters: ${JSON.stringify(parameters)}` }
        ],
        max_tokens: 500,
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
  
  console.log('[VIDEO-GEN]', { 
    requestId, 
    event: 'generation_start', 
    hasLuma: !!falApiKey,
    hasRunway: !!runwayApiKey,
    parameters,
    promptPreview: prompt.slice(0, 100)
  });

  // ===== MULTI-API FALLBACK STRATEGY =====
  
  // 1. PRIMARY: Runway Gen-3 Alpha (fixed with proper headers)
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
        fallback: 'luma_text_to_video'
      });
    }
  }

  // 2. SECONDARY: Luma Dream Machine (Text-to-Video)
  if (falApiKey) {
    try {
      console.log('[VIDEO-GEN]', { requestId, event: 'trying_luma_text_to_video' });
      const result = await generateVideoWithLuma(prompt, parameters, 'text-to-video');
      
      console.log('[VIDEO-GEN]', { 
        requestId, 
        event: 'luma_text_to_video_success', 
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

  // 3. TERTIARY: Luma Dream Machine (Image-to-Video)
  if (falApiKey) {
    try {
      console.log('[VIDEO-GEN]', { requestId, event: 'trying_luma_image_to_video' });
      const result = await generateImageToVideoWithLuma(prompt, parameters);
      
      console.log('[VIDEO-GEN]', { 
        requestId, 
        event: 'luma_image_to_video_success', 
        totalMs: Date.now() - startTime
      });
      
      return result;
    } catch (error) {
      console.warn('[VIDEO-GEN]', { 
        requestId, 
        event: 'luma_image_to_video_failed', 
        error: (error as Error).message,
        fallback: 'static_image'
      });
    }
  }

  // 4. FINAL FALLBACK: Static Image with Motion Hints
  if (openAIApiKey) {
    try {
      console.log('[VIDEO-GEN]', { requestId, event: 'trying_static_image_fallback' });
      
      const motionPrompt = `${prompt}. Professional food photography optimized for potential video animation, perfect composition for motion graphics, studio lighting, high resolution commercial quality.`;
      const imageResult = await generateImage(motionPrompt, parameters);
      
      console.log('[VIDEO-GEN]', { 
        requestId, 
        event: 'static_image_fallback_success', 
        totalMs: Date.now() - startTime
      });
      
      return {
        ...imageResult,
        type: 'image', // Explicitly set as image since video generation failed
        fallbackReason: 'video_generation_unavailable',
        suggestedAction: 'retry_later_or_upgrade_api_keys'
      };
    } catch (error) {
      console.error('[VIDEO-GEN]', { 
        requestId, 
        event: 'all_fallbacks_failed', 
        error: (error as Error).message,
        totalMs: Date.now() - startTime
      });
    }
  }

  // If all methods fail
  console.error('[VIDEO-GEN]', { 
    requestId, 
    event: 'complete_failure', 
    availableApis: { luma: !!falApiKey, runway: !!runwayApiKey, openai: !!openAIApiKey },
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
    const imagePrompt = createMotionImagePrompt(prompt, parameters);
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
      
      // Return the starter image as fallback
      return {
        type: 'image',
        content: starterImage.content,
        format: starterImage.format,
        parameters,
        prompt: imagePrompt,
        fallbackReason: 'runway_task_creation_failed'
      };
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

    // Timeout or failure - return starter image
    console.warn('[RUNWAY]', { requestId, event: 'generation_timeout', attempts });
    return {
      type: 'image',
      content: starterImage.content,
      format: starterImage.format,
      parameters,
      prompt: imagePrompt,
      fallbackReason: 'runway_generation_timeout'
    };

  } catch (error) {
    console.error('[RUNWAY]', { requestId, event: 'generation_failed', error: (error as Error).message });
    throw error;
  }
}