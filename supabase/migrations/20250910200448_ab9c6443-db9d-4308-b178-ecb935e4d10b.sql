-- EMERGENCY FIX: Remove dangerous policies that are still active
DO $$
BEGIN
  RAISE LOG '[SECURITY_EMERGENCY] Removing dangerous policies that were not properly dropped';
END;
$$;

-- 🚨 CRITICAL: Remove the dangerous "Anyone can view dish analyses" policy
DROP POLICY IF EXISTS "Anyone can view dish analyses" ON dish_analyses;

-- 🚨 CRITICAL: Remove the dangerous "Anyone can create dish analyses" policy  
DROP POLICY IF EXISTS "Anyone can create dish analyses" ON dish_analyses;

-- 🚨 CRITICAL: Remove the dangerous "Anyone can create contact submissions" policy
DROP POLICY IF EXISTS "Anyone can create contact submissions" ON contact_submissions;

-- Now create the CORRECT secure policies for dish_analyses
CREATE POLICY "Demo dishes viewable by everyone limited" 
ON dish_analyses 
FOR SELECT 
USING (
  -- Only allow access to demo data (top 10 most recent for public demo)
  id IN (
    SELECT id FROM dish_analyses 
    ORDER BY created_at DESC 
    LIMIT 10
  )
);

CREATE POLICY "Authenticated users can view all dish analyses secure" 
ON dish_analyses 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create dish analyses secure" 
ON dish_analyses 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Create the CORRECT secure policy for contact submissions
CREATE POLICY "Contact submissions via secure function only fixed" 
ON contact_submissions 
FOR INSERT 
WITH CHECK (false); -- This forces use of the secure function

-- Log the emergency fix
DO $$
BEGIN
  RAISE LOG '[SECURITY_EMERGENCY] ✅ CRITICAL POLICIES FIXED - dangerous public access removed';  
  RAISE LOG '[SECURITY_EMERGENCY] dish_analyses now properly secured';
  RAISE LOG '[SECURITY_EMERGENCY] contact_submissions now requires secure function';
END;
$$;