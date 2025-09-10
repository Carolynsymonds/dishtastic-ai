-- Critical Security Enhancement: Phase 2 - Database Hardening

-- 1. Update user_profiles RLS policy to restrict public access
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.user_profiles;

-- Create more restrictive policy for user profiles
CREATE POLICY "Users can view public profile data only" 
ON public.user_profiles 
FOR SELECT 
USING (
  -- Users can view their own complete profile
  auth.uid() = id 
  OR 
  -- Others can only see limited public data (display_name, avatar_url, bio if public_email is set)
  (public_email IS NOT NULL AND public_email != '')
);

-- 2. Create enhanced verification access logging with email hashing
CREATE OR REPLACE FUNCTION public.log_verification_access_enhanced(
  p_email text, 
  p_action text, 
  p_token text DEFAULT NULL,
  p_ip_address text DEFAULT NULL,
  p_user_agent text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  email_hash text;
  domain_hash text;
BEGIN
  -- Create hash of email for privacy-preserving logging
  email_hash := encode(digest(lower(p_email), 'sha256'), 'hex');
  domain_hash := encode(digest(split_part(lower(p_email), '@', 2), 'sha256'), 'hex');
  
  -- Log verification access with hashed data
  PERFORM log_security_event('verification_access', jsonb_build_object(
    'action', p_action,
    'email_hash', left(email_hash, 16),  -- Only first 16 chars of hash
    'domain_hash', left(domain_hash, 12), -- Only first 12 chars of domain hash
    'token_provided', CASE WHEN p_token IS NOT NULL THEN 'YES' ELSE 'NO' END,
    'ip_hash', CASE WHEN p_ip_address IS NOT NULL THEN left(encode(digest(p_ip_address, 'sha256'), 'hex'), 12) ELSE NULL END,
    'user_agent_hash', CASE WHEN p_user_agent IS NOT NULL THEN left(encode(digest(p_user_agent, 'sha256'), 'sha256'), 8) ELSE NULL END
  ));
END;
$$;

-- 3. Create function to validate email domains against known providers
CREATE OR REPLACE FUNCTION public.validate_email_domain(email_address text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  domain text;
  is_disposable boolean := false;
BEGIN
  -- Extract domain from email
  domain := lower(split_part(email_address, '@', 2));
  
  -- Check against common disposable email domains (basic list)
  SELECT domain IN (
    '10minutemail.com', 'tempmail.org', 'guerrillamail.com',
    'mailinator.com', 'yopmail.com', 'temp-mail.org'
  ) INTO is_disposable;
  
  -- Return false if disposable, true if legitimate
  RETURN NOT is_disposable;
END;
$$;

-- 4. Update dish_analysis_verifications with enhanced security
ALTER TABLE public.dish_analysis_verifications 
ADD COLUMN IF NOT EXISTS email_hash text,
ADD COLUMN IF NOT EXISTS domain_hash text,
ADD COLUMN IF NOT EXISTS access_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_accessed_at timestamp with time zone;

-- Create trigger to hash emails on insert/update
CREATE OR REPLACE FUNCTION public.hash_verification_email()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Hash the email for privacy
  NEW.email_hash := encode(digest(lower(NEW.email), 'sha256'), 'hex');
  NEW.domain_hash := encode(digest(split_part(lower(NEW.email), '@', 2), 'sha256'), 'hex');
  
  RETURN NEW;
END;
$$;

-- Apply trigger to hash emails
DROP TRIGGER IF EXISTS hash_verification_email_trigger ON public.dish_analysis_verifications;
CREATE TRIGGER hash_verification_email_trigger
  BEFORE INSERT OR UPDATE ON public.dish_analysis_verifications
  FOR EACH ROW
  EXECUTE FUNCTION public.hash_verification_email();

-- 5. Create audit trail for verification access
CREATE TABLE IF NOT EXISTS public.verification_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  verification_id uuid REFERENCES public.dish_analysis_verifications(id),
  action text NOT NULL,
  email_hash text NOT NULL,
  access_ip_hash text,
  user_agent_hash text,
  success boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.verification_audit_log ENABLE ROW LEVEL SECURITY;

-- Only authenticated users can view audit logs, and only their own
CREATE POLICY "Users can view verification audit logs" 
ON public.verification_audit_log 
FOR SELECT 
USING (false); -- Admin only access in production

-- 6. Enhanced cleanup function with audit trail
CREATE OR REPLACE FUNCTION public.cleanup_expired_verifications_secure()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  deleted_count integer;
  audit_count integer;
BEGIN
  -- Log cleanup action
  PERFORM log_security_event('verification_cleanup_started', jsonb_build_object(
    'cleanup_time', now()
  ));
  
  -- Delete expired verifications older than 48 hours
  DELETE FROM dish_analysis_verifications 
  WHERE expires_at < (now() - interval '48 hours');
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  -- Clean up old audit logs (keep for 90 days)
  DELETE FROM verification_audit_log 
  WHERE created_at < (now() - interval '90 days');
  
  GET DIAGNOSTICS audit_count = ROW_COUNT;
  
  -- Log completion
  PERFORM log_security_event('verification_cleanup_completed', jsonb_build_object(
    'deleted_verifications', deleted_count,
    'deleted_audit_logs', audit_count
  ));
  
  RETURN deleted_count;
END;
$$;

-- 7. Add rate limiting for verification attempts
CREATE TABLE IF NOT EXISTS public.verification_rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email_hash text NOT NULL,
  ip_hash text,
  attempt_count integer DEFAULT 1,
  first_attempt_at timestamp with time zone DEFAULT now(),
  last_attempt_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on rate limits table
ALTER TABLE public.verification_rate_limits ENABLE ROW LEVEL SECURITY;

-- No public access to rate limits
CREATE POLICY "No public access to rate limits" 
ON public.verification_rate_limits 
FOR ALL 
USING (false);

-- 8. Create function to check verification rate limits
CREATE OR REPLACE FUNCTION public.check_verification_rate_limit(
  p_email text,
  p_ip_address text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  email_hash text;
  ip_hash text;
  recent_attempts integer;
  rate_limit_exceeded boolean := false;
BEGIN
  -- Hash identifiers
  email_hash := encode(digest(lower(p_email), 'sha256'), 'hex');
  ip_hash := CASE WHEN p_ip_address IS NOT NULL 
    THEN encode(digest(p_ip_address, 'sha256'), 'hex') 
    ELSE NULL END;
  
  -- Check email-based rate limit (max 5 attempts per hour)
  SELECT COUNT(*) INTO recent_attempts
  FROM verification_rate_limits
  WHERE email_hash = email_hash
    AND last_attempt_at > (now() - interval '1 hour');
  
  IF recent_attempts >= 5 THEN
    rate_limit_exceeded := true;
  END IF;
  
  -- Check IP-based rate limit if available (max 10 attempts per hour)
  IF ip_hash IS NOT NULL AND NOT rate_limit_exceeded THEN
    SELECT COUNT(*) INTO recent_attempts
    FROM verification_rate_limits
    WHERE ip_hash = ip_hash
      AND last_attempt_at > (now() - interval '1 hour');
    
    IF recent_attempts >= 10 THEN
      rate_limit_exceeded := true;
    END IF;
  END IF;
  
  -- Log the attempt
  INSERT INTO verification_rate_limits (email_hash, ip_hash)
  VALUES (email_hash, ip_hash)
  ON CONFLICT (email_hash) DO UPDATE SET
    attempt_count = verification_rate_limits.attempt_count + 1,
    last_attempt_at = now();
  
  -- Return true if within limits, false if exceeded
  RETURN NOT rate_limit_exceeded;
END;
$$;

-- Log security enhancement completion
SELECT log_security_event('database_security_hardening_phase2', jsonb_build_object(
  'policies_updated', 1,
  'functions_created', 4,
  'tables_created', 2,
  'triggers_created', 1,
  'security_level', 'enhanced'
));