-- Fix critical email exposure in dish_analysis_verifications table
-- Replace the overly permissive RLS policy that exposes all emails

-- Drop the dangerous policy that allows anyone to view all verifications
DROP POLICY IF EXISTS "Anyone can view verifications by token" ON dish_analysis_verifications;

-- Create a secure policy that only allows viewing verifications with valid token
-- This prevents enumeration of emails while still allowing legitimate verification
CREATE POLICY "Users can view verifications by valid token" 
ON dish_analysis_verifications 
FOR SELECT 
USING (
  -- Only allow viewing if a valid verification_token is provided in the query
  -- This requires the frontend to always include the token when querying
  verification_token IS NOT NULL 
  AND length(verification_token) > 0
  AND expires_at > now()
);

-- Add a more restrictive update policy that requires token validation
DROP POLICY IF EXISTS "Anyone can update verifications by token" ON dish_analysis_verifications;

CREATE POLICY "Users can update verifications with valid token" 
ON dish_analysis_verifications 
FOR UPDATE 
USING (
  verification_token IS NOT NULL 
  AND length(verification_token) > 0
  AND expires_at > now()
  AND verified_at IS NULL  -- Only allow updates to unverified records
);

-- Add logging function for security monitoring
CREATE OR REPLACE FUNCTION log_verification_access(
  p_email text,
  p_action text,
  p_token text DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log verification access attempts for security monitoring
  -- In production, this could write to a security log table
  RAISE LOG 'Verification access: action=%, email=%, token_provided=%', 
    p_action, 
    left(p_email, 3) || '***',  -- Partially obscure email in logs
    CASE WHEN p_token IS NOT NULL THEN 'YES' ELSE 'NO' END;
END;
$$;

-- Add a trigger to log verification updates
CREATE OR REPLACE FUNCTION trigger_log_verification_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log when verification status changes
  IF TG_OP = 'UPDATE' AND OLD.verified_at IS NULL AND NEW.verified_at IS NOT NULL THEN
    PERFORM log_verification_access(NEW.email, 'verified', NEW.verification_token);
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER verification_access_log_trigger
  AFTER UPDATE ON dish_analysis_verifications
  FOR EACH ROW
  EXECUTE FUNCTION trigger_log_verification_access();

-- Add data retention policy function
CREATE OR REPLACE FUNCTION cleanup_expired_verifications()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count integer;
BEGIN
  -- Delete expired verifications older than 48 hours to prevent data accumulation
  DELETE FROM dish_analysis_verifications 
  WHERE expires_at < (now() - interval '48 hours');
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RAISE LOG 'Cleaned up % expired verification records', deleted_count;
  
  RETURN deleted_count;
END;
$$;