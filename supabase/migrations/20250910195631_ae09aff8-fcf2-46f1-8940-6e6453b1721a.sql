-- PHASE 3: CRITICAL RLS POLICY FIXES
DO $$
BEGIN
  RAISE LOG '[SECURITY_MIGRATION] Phase 3: Implementing critical RLS policy fixes - THIS IS THE MAIN SECURITY FIX';
END;
$$;

-- 🔥 CRITICAL FIX #1: DISH_ANALYSES TABLE - PREVENT BUSINESS DATA THEFT
DO $$
BEGIN
  RAISE LOG '[SECURITY_MIGRATION] 🔥 CRITICAL: Fixing dish_analyses public exposure';
END;
$$;

-- Remove the dangerous public access policy
DROP POLICY IF EXISTS "Anyone can view dish analyses" ON dish_analyses;

-- Create secure policies for dish_analyses
CREATE POLICY "Demo dishes are viewable by everyone via view" 
ON dish_analyses 
FOR SELECT 
USING (
  -- Only allow access to demo data (top 10 most recent)
  id IN (
    SELECT id FROM dish_analyses 
    ORDER BY created_at DESC 
    LIMIT 10
  )
);

CREATE POLICY "Authenticated users can view all dish analyses" 
ON dish_analyses 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create dish analyses" 
ON dish_analyses 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Log the critical fix
DO $$
BEGIN
  RAISE LOG '[SECURITY_MIGRATION] ✅ CRITICAL FIX: dish_analyses now secure - business data protected';
END;
$$;

-- 🔥 CRITICAL FIX #2: USERS TABLE - PREVENT USER DATA EXPOSURE
DO $$
BEGIN
  RAISE LOG '[SECURITY_MIGRATION] 🔥 CRITICAL: Fixing users table public exposure';
END;
$$;

-- Remove the dangerous user data exposure policy
DROP POLICY IF EXISTS "Users can view their own record" ON users;
DROP POLICY IF EXISTS "Anyone can create provisional users" ON users;

-- Create secure user policies
CREATE POLICY "Users can view only their own record" 
ON users 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND (
    auth.uid()::text = id::text 
    OR auth.email() = email::text
  )
);

CREATE POLICY "Provisional users can be created with validation" 
ON users 
FOR INSERT 
WITH CHECK (
  status = 'provisional'::text
  AND email IS NOT NULL
  AND email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
);

CREATE POLICY "Users can update their own record" 
ON users 
FOR UPDATE 
USING (
  auth.uid() IS NOT NULL 
  AND (
    auth.uid()::text = id::text 
    OR auth.email() = email::text
  )
);

-- Log the critical fix
DO $$
BEGIN
  RAISE LOG '[SECURITY_MIGRATION] ✅ CRITICAL FIX: users table now secure - user data protected';
END;
$$;

-- 🔥 CRITICAL FIX #3: CONTACT_SUBMISSIONS - PREVENT EMAIL HARVESTING
DO $$
BEGIN
  RAISE LOG '[SECURITY_MIGRATION] 🔥 CRITICAL: Fixing contact_submissions email exposure';
END;
$$;

-- Remove dangerous policies
DROP POLICY IF EXISTS "Anyone can create contact submissions" ON contact_submissions;
DROP POLICY IF EXISTS "Authenticated users can view their own contact submissions" ON contact_submissions;

-- Create secure contact submission policies
CREATE POLICY "Contact submissions via secure function only" 
ON contact_submissions 
FOR INSERT 
WITH CHECK (false); -- Force use of secure function

CREATE POLICY "Users can view their own verified contact submissions" 
ON contact_submissions 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND auth.email() = email 
  AND EXISTS (
    SELECT 1 FROM users 
    WHERE users.email = contact_submissions.email 
    AND users.id = auth.uid()
  )
);

-- Log the critical fix
DO $$
BEGIN
  RAISE LOG '[SECURITY_MIGRATION] ✅ CRITICAL FIX: contact_submissions now secure - email harvesting prevented';
END;
$$;