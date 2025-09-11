-- Phase 1: Critical Security Fixes
-- Fix security definer views and enhance RLS policies

-- 1.1 Create secure access function for dish analysis verifications
CREATE OR REPLACE FUNCTION public.get_verification_by_token(p_token text)
RETURNS SETOF dish_analysis_verifications
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Rate limiting check
  IF NOT check_verification_rate_limit(
    COALESCE(current_setting('request.headers')::json->>'x-forwarded-for', '0.0.0.0')
  ) THEN
    RAISE EXCEPTION 'Rate limit exceeded';
  END IF;

  -- Log access attempt
  PERFORM log_verification_access_enhanced(
    '', 
    'token_access_attempt', 
    p_token,
    COALESCE(current_setting('request.headers')::json->>'x-forwarded-for', '0.0.0.0'),
    COALESCE(current_setting('request.headers')::json->>'user-agent', '')
  );

  -- Return verification if valid and not expired
  RETURN QUERY
  SELECT * FROM dish_analysis_verifications
  WHERE verification_token = p_token
    AND expires_at > now()
    AND verified_at IS NULL;
END;
$$;

-- 1.2 Enhanced security function for verification validation
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

  -- Log the validation attempt
  PERFORM log_verification_access_enhanced(
    COALESCE(p_email, verification_record.email, ''),
    'validation_attempt',
    p_token,
    COALESCE(current_setting('request.headers')::json->>'x-forwarded-for', '0.0.0.0'),
    COALESCE(current_setting('request.headers')::json->>'user-agent', '')
  );

  RETURN is_valid;
END;
$$;

-- 1.3 Create secure function for public content access
CREATE OR REPLACE FUNCTION public.get_public_static_content(p_content_type text DEFAULT NULL, p_site_id text DEFAULT 'smartstockiq')
RETURNS SETOF static_content
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log access
  PERFORM log_security_event('static_content_access', jsonb_build_object(
    'content_type', p_content_type,
    'site_id', p_site_id
  ));

  -- Return only public-safe content
  RETURN QUERY
  SELECT * FROM static_content
  WHERE site_id = p_site_id
    AND (p_content_type IS NULL OR content_type = p_content_type)
    -- Only return content that's meant for public consumption
    AND content_type NOT IN ('admin_config', 'internal_docs', 'api_keys');
END;
$$;

-- 1.4 Enhanced audit logging for sensitive operations
CREATE OR REPLACE FUNCTION public.audit_sensitive_operation(
  p_operation text,
  p_table_name text,
  p_record_id uuid DEFAULT NULL,
  p_details jsonb DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Enhanced logging with more context
  PERFORM log_security_event(
    'sensitive_operation',
    jsonb_build_object(
      'operation', p_operation,
      'table_name', p_table_name,
      'record_id', p_record_id,
      'user_id', auth.uid(),
      'session_id', current_setting('request.jwt.claims', true)::json->>'session_id',
      'ip_address', COALESCE(current_setting('request.headers')::json->>'x-forwarded-for', '0.0.0.0'),
      'user_agent', COALESCE(current_setting('request.headers')::json->>'user-agent', ''),
      'details', p_details
    )
  );
END;
$$;

-- Phase 2: Enhanced RLS Policies

-- 2.1 Tighten static_content access
DROP POLICY IF EXISTS "Static content is viewable by everyone" ON static_content;
CREATE POLICY "Public static content access via function"
ON static_content
FOR SELECT
USING (
  content_type NOT IN ('admin_config', 'internal_docs', 'api_keys', 'security_config')
  AND site_id = 'smartstockiq'
);

-- 2.2 Enhanced verification access policy
DROP POLICY IF EXISTS "Users can view verifications by valid token" ON dish_analysis_verifications;
CREATE POLICY "Verification access via secure function only"
ON dish_analysis_verifications
FOR SELECT
USING (false); -- Force all access through security definer functions

-- 2.3 Secure demo dishes access with monitoring
DROP POLICY IF EXISTS "Public can view demo dishes" ON demo_dishes;
CREATE POLICY "Public demo dishes with audit"
ON demo_dishes
FOR SELECT
USING (
  is_demo = true 
  AND (
    -- Log demo access for analytics
    log_security_event('demo_dish_access', jsonb_build_object(
      'dish_id', id,
      'dish_name', dish_name
    )) IS NOT NULL
    OR true -- Always allow after logging
  )
);

-- 2.4 Enhanced contact submissions security
DROP POLICY IF EXISTS "Contact submissions via secure function only fixed" ON contact_submissions;
CREATE POLICY "Secure contact submissions only"
ON contact_submissions
FOR INSERT
WITH CHECK (
  -- Only allow insertions via the secure processing function
  current_setting('app.bypass_rls', true) = 'contact_submission'
);

-- Phase 3: Security Monitoring Enhancement

-- 3.1 Create security metrics table for monitoring
CREATE TABLE IF NOT EXISTS public.security_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_type text NOT NULL,
  metric_value numeric NOT NULL DEFAULT 0,
  time_window text NOT NULL, -- 'hour', 'day', 'week'
  recorded_at timestamp with time zone NOT NULL DEFAULT now(),
  details jsonb DEFAULT '{}'::jsonb
);

-- Enable RLS on security metrics
ALTER TABLE public.security_metrics ENABLE ROW LEVEL SECURITY;

-- Only system functions can access security metrics
CREATE POLICY "System access only for security metrics"
ON public.security_metrics
FOR ALL
USING (false);

-- 3.2 Create function to record security metrics
CREATE OR REPLACE FUNCTION public.record_security_metric(
  p_metric_type text,
  p_metric_value numeric DEFAULT 1,
  p_time_window text DEFAULT 'hour',
  p_details jsonb DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.security_metrics (metric_type, metric_value, time_window, details)
  VALUES (p_metric_type, p_metric_value, p_time_window, p_details);
END;
$$;

-- 3.3 Enhanced rate limiting with better tracking
CREATE OR REPLACE FUNCTION public.check_advanced_rate_limit(
  p_identifier text,
  p_operation text,
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
  
  -- Record security metric
  PERFORM record_security_metric(
    'rate_limit_check',
    CASE WHEN rate_limited THEN 1 ELSE 0 END,
    'hour',
    jsonb_build_object(
      'operation', p_operation,
      'attempts', current_attempts,
      'limit', p_max_attempts,
      'blocked', rate_limited
    )
  );
  
  -- If rate limited, log security event
  IF rate_limited THEN
    PERFORM log_security_event('rate_limit_exceeded', jsonb_build_object(
      'operation', p_operation,
      'identifier_hash', left(identifier_hash, 16),
      'attempts', current_attempts,
      'limit', p_max_attempts
    ));
  END IF;
  
  RETURN NOT rate_limited;
END;
$$;

-- Log successful migration
PERFORM log_security_event('security_migration_completed', jsonb_build_object(
  'phase', 'critical_fixes',
  'timestamp', now(),
  'components', jsonb_build_array(
    'security_definer_functions',
    'enhanced_rls_policies', 
    'security_monitoring',
    'advanced_rate_limiting'
  )
));

RAISE LOG '[SECURITY_MIGRATION] ✅ Critical security fixes implemented successfully';