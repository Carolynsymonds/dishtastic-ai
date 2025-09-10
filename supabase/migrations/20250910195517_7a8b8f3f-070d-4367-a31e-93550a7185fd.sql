-- PHASE 1: CREATE SECURE DEMO VIEW AND PUBLIC DATA SANITIZATION
-- Log: Starting security remediation implementation
DO $$
BEGIN
  RAISE LOG '[SECURITY_MIGRATION] Phase 1: Creating secure demo views and data sanitization';
END;
$$;

-- Create secure demo view for dish_analyses with sanitized data
CREATE OR REPLACE VIEW public.dish_analyses_demo AS 
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

-- Log successful view creation
DO $$
BEGIN
  RAISE LOG '[SECURITY_MIGRATION] ✅ Created dish_analyses_demo view with sanitized data';
END;
$$;

-- Create security event logging function
CREATE OR REPLACE FUNCTION log_security_event(
  event_type text,
  event_data jsonb DEFAULT '{}'::jsonb
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log security events (in production, this could write to a dedicated security_logs table)
  RAISE LOG '[SECURITY_EVENT] Type: %, Data: %, Timestamp: %, User: %', 
    event_type, 
    event_data,
    now(),
    COALESCE(auth.uid()::text, 'anonymous');
END;
$$;

-- Create contact submission processing function with security
CREATE OR REPLACE FUNCTION process_contact_submission(
  p_email text,
  p_subject text DEFAULT NULL,
  p_message text DEFAULT NULL,
  p_landing_page_id uuid DEFAULT NULL
) RETURNS uuid
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
  
  -- Generate hash for email (for deduplication without exposure)
  email_hash := encode(digest(lower(p_email), 'sha256'), 'hex');
  
  -- Insert with proper validation
  INSERT INTO contact_submissions (email, subject, message, landing_page_id)
  VALUES (p_email, p_subject, p_message, p_landing_page_id)
  RETURNING id INTO submission_id;
  
  -- Log submission event (without exposing email)
  PERFORM log_security_event('contact_submission', jsonb_build_object(
    'submission_id', submission_id,
    'email_hash', left(email_hash, 8),
    'has_subject', p_subject IS NOT NULL,
    'message_length', COALESCE(length(p_message), 0),
    'landing_page_id', p_landing_page_id
  ));
  
  RAISE LOG '[SECURITY_MIGRATION] ✅ Contact submission processed securely: %', submission_id;
  
  RETURN submission_id;
END;
$$;

-- Log completion of Phase 1
DO $$
BEGIN
  RAISE LOG '[SECURITY_MIGRATION] ✅ Phase 1 completed: Secure views and functions created';
END;
$$;