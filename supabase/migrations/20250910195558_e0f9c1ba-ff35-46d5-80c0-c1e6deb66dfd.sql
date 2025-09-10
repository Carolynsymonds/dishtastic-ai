-- Fix security definer view issue and continue Phase 2
DO $$
BEGIN
  RAISE LOG '[SECURITY_MIGRATION] Fixing security definer view issue and continuing Phase 2';
END;
$$;

-- Drop and recreate the view without security definer to fix linter warning
DROP VIEW IF EXISTS public.dish_analyses_demo;

-- Create regular view (not security definer) for demo data
CREATE VIEW public.dish_analyses_demo AS 
SELECT 
  id,
  dish_name,
  -- Sanitize profit margins to ranges instead of exact values
  CASE 
    WHEN profit_margin < 15 THEN 'Low (10-15%)'
    WHEN profit_margin < 25 THEN 'Medium (15-25%)'
    WHEN profit_margin >= 25 THEN 'High (25%+)'
    ELSE 'Not Available'
  END as profit_range,
  -- Sanitize analysis results to show only safe public data
  CASE 
    WHEN analysis_result IS NOT NULL THEN
      jsonb_build_object(
        'category', COALESCE(analysis_result->>'category', 'General'),
        'difficulty', COALESCE(analysis_result->>'difficulty', 'Medium'),
        'cuisine_type', COALESCE(analysis_result->>'cuisine_type', 'International'),
        'popularity_score', COALESCE((analysis_result->>'popularity_score')::int, 5)
      )
    ELSE jsonb_build_object('category', 'General', 'difficulty', 'Medium')
  END as public_analysis,
  created_at,
  -- Add demo flag
  true as is_demo
FROM dish_analyses 
WHERE id IN (
  -- Only show curated demo dishes (latest 10 for demo purposes)
  SELECT id FROM dish_analyses 
  ORDER BY created_at DESC 
  LIMIT 10
)
ORDER BY created_at DESC;

-- PHASE 2: CREATE USER PROFILES TABLE FOR SECURE USER DATA
DO $$
BEGIN
  RAISE LOG '[SECURITY_MIGRATION] Phase 2: Creating user profiles table for secure user data management';
END;
$$;

-- Create user profiles table for safe public data
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  avatar_url text,
  bio text,
  public_email text, -- Optional public contact
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Secure policies for user profiles
CREATE POLICY "Profiles are viewable by everyone" 
ON user_profiles 
FOR SELECT 
USING (true);

CREATE POLICY "Users can update their own profile" 
ON user_profiles 
FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
ON user_profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can delete their own profile" 
ON user_profiles 
FOR DELETE 
USING (auth.uid() = id);

-- Create profile management trigger
CREATE OR REPLACE FUNCTION handle_new_user_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, display_name)
  VALUES (
    NEW.id, 
    COALESCE(
      NEW.raw_user_meta_data->>'display_name',
      NEW.raw_user_meta_data->>'full_name', 
      split_part(NEW.email, '@', 1)
    )
  )
  ON CONFLICT (id) DO NOTHING;
  
  PERFORM log_security_event('user_profile_created', jsonb_build_object(
    'user_id', NEW.id,
    'email_domain', split_part(NEW.email, '@', 2)
  ));
  
  RETURN NEW;
END;
$$;

-- Create trigger for automatic profile creation
DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;
CREATE TRIGGER on_auth_user_created_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user_profile();

-- Add updated_at trigger for profiles
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Log successful user profiles setup
DO $$
BEGIN
  RAISE LOG '[SECURITY_MIGRATION] ✅ User profiles table created with secure RLS policies';
END;
$$;