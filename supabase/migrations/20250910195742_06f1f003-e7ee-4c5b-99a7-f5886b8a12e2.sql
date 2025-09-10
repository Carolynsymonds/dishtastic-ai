-- Fix policy conflicts and continue with critical fixes
DO $$
BEGIN
  RAISE LOG '[SECURITY_MIGRATION] Fixing policy conflicts and continuing critical fixes';
END;
$$;

-- Drop all existing policies on users table to avoid conflicts
DROP POLICY IF EXISTS "Users can update their own record" ON users;
DROP POLICY IF EXISTS "Users can view their own record" ON users;
DROP POLICY IF EXISTS "Anyone can create provisional users" ON users;

-- Create secure user policies (fixed)
CREATE POLICY "Users can view only their own record secure" 
ON users 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND (
    auth.uid()::text = id::text 
    OR auth.email() = email::text
  )
);

CREATE POLICY "Provisional users can be created with validation secure" 
ON users 
FOR INSERT 
WITH CHECK (
  status = 'provisional'::text
  AND email IS NOT NULL
  AND email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
);

CREATE POLICY "Users can update their own record secure" 
ON users 
FOR UPDATE 
USING (
  auth.uid() IS NOT NULL 
  AND (
    auth.uid()::text = id::text 
    OR auth.email() = email::text
  )
);

-- 🔥 CRITICAL FIX #4: LEADS TABLE - SECURE USER TRACKING DATA
DO $$
BEGIN
  RAISE LOG '[SECURITY_MIGRATION] 🔥 CRITICAL: Securing leads table user tracking data';
END;
$$;

-- Update leads policies for better security
DROP POLICY IF EXISTS "Anyone can create leads" ON leads;

CREATE POLICY "Leads can be created with validation" 
ON leads 
FOR INSERT 
WITH CHECK (
  email IS NOT NULL 
  AND length(email) > 5 
  AND email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
  AND user_id IS NOT NULL
);

-- Keep existing secure policies for leads viewing and updating
-- (These were already properly scoped to user_id = auth.uid())

-- 🔥 CRITICAL FIX #5: MENU_UPLOADS - ENHANCE FILE SECURITY
DO $$
BEGIN
  RAISE LOG '[SECURITY_MIGRATION] 🔥 CRITICAL: Enhancing menu_uploads file security';
END;
$$;

-- Add user_id column to menu_uploads if it doesn't exist
ALTER TABLE menu_uploads ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

-- Create migration function to link existing uploads
CREATE OR REPLACE FUNCTION migrate_menu_uploads_to_user_ids()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  updated_count integer;
BEGIN
  -- Link existing uploads to users based on email
  UPDATE menu_uploads 
  SET user_id = users.id
  FROM users 
  WHERE menu_uploads.user_email = users.email
  AND menu_uploads.user_id IS NULL;
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  
  PERFORM log_security_event('menu_uploads_migration', jsonb_build_object(
    'updated_count', updated_count
  ));
  
  RAISE LOG '[SECURITY_MIGRATION] Linked % menu uploads to user IDs', updated_count;
  
  RETURN updated_count;
END;
$$;

-- Run migration
SELECT migrate_menu_uploads_to_user_ids();

-- Update menu_uploads RLS policies
DROP POLICY IF EXISTS "Users can view their own menu uploads" ON menu_uploads;
DROP POLICY IF EXISTS "Users can update their own menu uploads" ON menu_uploads;
DROP POLICY IF EXISTS "Users can create their own menu uploads" ON menu_uploads;

CREATE POLICY "Users can view their own menu uploads secure" 
ON menu_uploads 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND (
    user_id = auth.uid()
    OR (user_id IS NULL AND user_email = auth.email())
  )
);

CREATE POLICY "Users can update their own menu uploads secure" 
ON menu_uploads 
FOR UPDATE 
USING (
  auth.uid() IS NOT NULL 
  AND (
    user_id = auth.uid()
    OR (user_id IS NULL AND user_email = auth.email())
  )
);

CREATE POLICY "Users can create their own menu uploads secure" 
ON menu_uploads 
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND user_id = auth.uid()
  AND user_email = auth.email()
);

-- Log completion of critical fixes
DO $$
BEGIN
  RAISE LOG '[SECURITY_MIGRATION] ✅ PHASE 3 COMPLETED: All critical RLS policies secured';
END;
$$;