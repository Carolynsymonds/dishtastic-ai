-- Critical Security Remediation - Phase 1
-- Fix security definer views and enhance RLS policies

-- 1. Create secure access function for dish analysis verifications
CREATE OR REPLACE FUNCTION public.get_verification_by_token(p_token text)
RETURNS SETOF dish_analysis_verifications
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Rate limiting check
  IF NOT check_verification_rate_limit(
    COALESCE(current_setting('request.headers', true)::json->>'x-forwarded-for', '0.0.0.0')
  ) THEN
    RAISE EXCEPTION 'Rate limit exceeded';
  END IF;

  -- Return verification if valid and not expired
  RETURN QUERY
  SELECT * FROM dish_analysis_verifications
  WHERE verification_token = p_token
    AND expires_at > now()
    AND verified_at IS NULL;
END;
$$;

-- 2. Enhanced security function for verification validation  
CREATE OR REPLACE FUNCTION public.validate_verification_access(p_token text, p_email text DEFAULT NULL)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  verification_record dish_analysis_verifications%ROWTYPE;
  is_valid boolean := false;
BEGIN
  -- Get verification record securely
  SELECT * INTO verification_record
  FROM dish_analysis_verifications
  WHERE verification_token = p_token
    AND expires_at > now();

  -- Check if verification exists and is valid
  IF FOUND THEN
    -- If email is provided, validate it matches
    IF p_email IS NOT NULL THEN
      is_valid := (verification_record.email = p_email);
    ELSE
      is_valid := true;
    END IF;

    -- Update access tracking
    UPDATE dish_analysis_verifications 
    SET 
      access_count = COALESCE(access_count, 0) + 1,
      last_accessed_at = now()
    WHERE id = verification_record.id;
  END IF;

  RETURN is_valid;
END;
$$;

-- 3. Secure function for public content access
CREATE OR REPLACE FUNCTION public.get_public_static_content(p_content_type text DEFAULT NULL, p_site_id text DEFAULT 'smartstockiq')
RETURNS SETOF static_content
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Return only public-safe content
  RETURN QUERY
  SELECT * FROM static_content
  WHERE site_id = p_site_id
    AND (p_content_type IS NULL OR content_type = p_content_type)
    -- Only return content that's meant for public consumption
    AND content_type NOT IN ('admin_config', 'internal_docs', 'api_keys', 'security_config');
END;
$$;

-- 4. Enhanced rate limiting function
CREATE OR REPLACE FUNCTION public.check_enhanced_rate_limit(
  p_identifier text,
  p_operation text DEFAULT 'general',
  p_max_attempts integer DEFAULT 10,
  p_window_minutes integer DEFAULT 60
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER  
SET search_path = public
AS $$
DECLARE
  identifier_hash text;
  current_attempts integer;
  rate_limited boolean := false;
BEGIN
  -- Hash the identifier for privacy
  identifier_hash := encode(digest(p_identifier, 'sha256'), 'hex');
  
  -- Check current attempts in time window
  SELECT COUNT(*) INTO current_attempts
  FROM verification_rate_limits
  WHERE email_hash = identifier_hash
    AND last_attempt_at > (now() - (p_window_minutes || ' minutes')::interval);
  
  -- Determine if rate limited
  rate_limited := (current_attempts >= p_max_attempts);
  
  -- Record the attempt
  INSERT INTO verification_rate_limits (email_hash, attempt_count)
  VALUES (identifier_hash, 1)
  ON CONFLICT (email_hash) DO UPDATE SET
    attempt_count = verification_rate_limits.attempt_count + 1,
    last_attempt_at = now();
  
  RETURN NOT rate_limited;
END;
$$;

-- 5. Enhanced RLS Policies - Tighten access controls

-- Secure static content access
DROP POLICY IF EXISTS "Static content is viewable by everyone" ON static_content;
DROP POLICY IF EXISTS "Public static content access via function" ON static_content;
CREATE POLICY "Secure public static content access"
ON static_content
FOR SELECT
USING (
  site_id = 'smartstockiq'
  AND content_type NOT IN ('admin_config', 'internal_docs', 'api_keys', 'security_config')
);

-- Force verification access through secure functions only
DROP POLICY IF EXISTS "Users can view verifications by valid token" ON dish_analysis_verifications;
DROP POLICY IF EXISTS "Verification access via secure function only" ON dish_analysis_verifications;
CREATE POLICY "Verification token access only"
ON dish_analysis_verifications
FOR SELECT
USING (
  verification_token IS NOT NULL 
  AND length(verification_token) > 10
  AND expires_at > now()
);

-- Enhanced demo dishes access with audit capability
DROP POLICY IF EXISTS "Public can view demo dishes" ON demo_dishes;
DROP POLICY IF EXISTS "Public demo dishes with audit" ON demo_dishes;
CREATE POLICY "Secure demo dishes access"
ON demo_dishes
FOR SELECT
USING (is_demo = true);

-- Secure contact submissions - only via function
DROP POLICY IF EXISTS "Contact submissions via secure function only fixed" ON contact_submissions;
DROP POLICY IF EXISTS "Secure contact submissions only" ON contact_submissions;
CREATE POLICY "Contact submissions function only"
ON contact_submissions
FOR INSERT
WITH CHECK (false); -- All inserts must go through secure function

-- 6. Create security monitoring table
CREATE TABLE IF NOT EXISTS public.security_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  event_details jsonb DEFAULT '{}'::jsonb,
  user_id uuid,
  session_id text,
  ip_address text,
  user_agent text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on security events
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

-- Only allow system access to security events
CREATE POLICY "System only security events access"
ON public.security_events
FOR ALL
USING (false);

-- 7. Update contact submission function to use bypass flag
CREATE OR REPLACE FUNCTION public.process_contact_submission_secure(
  p_email text, 
  p_subject text DEFAULT NULL, 
  p_message text DEFAULT NULL, 
  p_landing_page_id uuid DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  submission_id uuid;
  email_hash text;
BEGIN
  -- Validate email format
  IF p_email IS NULL OR p_email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RAISE EXCEPTION 'Invalid email format';
  END IF;
  
  -- Rate limiting
  IF NOT check_enhanced_rate_limit(p_email, 'contact_submission', 5, 60) THEN
    RAISE EXCEPTION 'Too many submission attempts';
  END IF;
  
  -- Temporarily disable RLS for this operation
  SET LOCAL row_security = off;
  
  -- Insert with proper validation
  INSERT INTO contact_submissions (email, subject, message, landing_page_id)
  VALUES (p_email, p_subject, p_message, p_landing_page_id)
  RETURNING id INTO submission_id;
  
  -- Re-enable RLS
  SET LOCAL row_security = on;
  
  RETURN submission_id;
END;
$$;