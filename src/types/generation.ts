export interface GenerationParameters {
  Format?: string;
  Scale?: string;
  Length?: string;
  'Video Style'?: string;
  Provider?: string; // Video provider: 'veo', 'luma', 'runway'
  Background?: string;
  uploadedImage?: string; // base64 encoded image data
}

export interface GenerationResult {
  type: 'image' | 'video';
  content: string;
  format: string;
  parameters: GenerationParameters;
  prompt: string;
  duration?: number;
  taskId?: string;
}

// Comprehensive JSON schema types for advanced prompt enhancement
export interface Dish {
  name: string;
  cuisine: string | null;
  dish_type: 'pasta' | 'soup' | 'noodles' | 'steak' | 'dessert' | 'pastry' | 'salad' | 'pizza' | 'bowl' | 'sandwich' | 'rice' | 'fries' | 'seafood' | 'tacos' | 'bbq' | 'curry' | 'other';
  key_ingredients: string[];
  textures: string[];
}

export interface VisualDirection {
  camera_move: 'Push-In Close' | 'Pull-Back Reveal' | 'Overhead Top-Down' | '360° Dish Orbit' | 'Table Slide' | 'Tilt-Down Reveal' | 'Tilt-Up Reveal' | 'Rack Focus Shift' | 'Slow-Mo Pour' | 'Ingredient Drop' | 'Handheld Lifestyle' | 'Whip Pan' | 'Speed Ramp' | 'Drone Establishing' | 'Chef POV' | 'none';
  framing: 'macro close-up' | 'three-quarter' | 'overhead' | 'side-on';
  angle: 'eye-level' | 'top-down' | '45-degree';
}

export interface Setting {
  background: 'Plain' | 'Home Kitchen' | 'Chef\'s Pass' | 'Fine Dining' | 'Farm Table' | 'Coffee Shop' | 'Garden Picnic' | 'Rooftop Bar' | 'Market Stand' | 'Fastfood Venue' | 'Hotel Buffet' | 'Food Truck' | 'Casual Diner' | 'Family Dinner';
  servingware: string;
  props: string[];
  lighting: string;
  mood: string;
}

export interface Tabletop {
  surface_material: 'marble' | 'rustic wood' | 'lacquered wood' | 'slate' | 'stainless steel' | 'terrazzo' | 'linen-covered' | 'laminate' | 'bamboo';
  surface_color: string;
  linens: 'none' | 'natural linen napkin' | 'crisp white tablecloth' | 'paper liner';
  cutlery: 'polished stainless' | 'brushed brass' | 'black matte' | 'stainless chopsticks & spoon' | 'none';
  glassware: 'none' | 'water tumbler' | 'wine glass' | 'beer glass' | 'tea cup';
  plate_style: 'classic white rimmed' | 'rustic stoneware' | 'modern coupe' | 'bamboo tray' | 'cast-iron skillet' | 'diner china' | 'lacquered tray';
  garnish_style: 'minimalist' | 'abundant' | 'rustic scatter' | 'fine-dining microgreens';
  color_palette: string[];
}

export interface People {
  presence: 'none' | 'chef hands' | 'diners';
  action: string | null;
}

export interface Tech {
  aspect_ratio: '16:9' | '3:2' | '1:1' | '2:3' | '9:16';
  duration_seconds: number | null;
  fps: number | null;
  style_strength: 'realistic' | 'cinematic' | 'stylized';
  lens: string;
  depth_of_field: 'shallow' | 'medium' | 'deep';
  negative_prompts: string[];
}

export interface RunwayParams {
  aspect_ratio: '16:9' | '3:2' | '1:1' | '2:3' | '9:16';
  seconds: number | null;
  seed: number;
}

export interface FoodVideoPromptResult {
  mode: 'video' | 'image';
  dish: Dish;
  visual_direction: VisualDirection;
  setting: Setting;
  tabletop: Tabletop;
  people: People;
  tech: Tech;
  runway_prompt: string;
  runway_params: RunwayParams;
}