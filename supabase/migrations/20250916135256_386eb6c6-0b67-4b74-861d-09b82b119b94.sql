-- Create table to store dish prompts when generate button is clicked
CREATE TABLE public.dish_prompts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  prompt TEXT NOT NULL,
  generation_type TEXT NOT NULL CHECK (generation_type IN ('image', 'video')),
  parameters JSONB,
  user_ip TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.dish_prompts ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can create their own dish prompts" 
ON public.dish_prompts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can view their own dish prompts" 
ON public.dish_prompts 
FOR SELECT 
USING (auth.uid() = user_id OR user_id IS NULL);

-- Create index for performance
CREATE INDEX idx_dish_prompts_user_id ON public.dish_prompts(user_id);
CREATE INDEX idx_dish_prompts_created_at ON public.dish_prompts(created_at DESC);