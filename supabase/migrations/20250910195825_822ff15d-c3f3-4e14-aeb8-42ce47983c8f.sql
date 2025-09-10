-- PHASE 4: COMPLETE REMAINING RLS POLICY FIXES AND ONBOARDING SECURITY
DO $$
BEGIN
  RAISE LOG '[SECURITY_MIGRATION] Phase 4: Completing remaining RLS policy fixes and onboarding security';
END;
$$;

-- 🔥 CRITICAL FIX #6: USER_ONBOARDING_DRAFTS - ENHANCED USER VERIFICATION
DO $$
BEGIN
  RAISE LOG '[SECURITY_MIGRATION] 🔥 CRITICAL: Enhancing user_onboarding_drafts security';
END;
$$;

-- Update onboarding drafts policies with stronger verification
DROP POLICY IF EXISTS "Users can view their own onboarding drafts" ON user_onboarding_drafts;
DROP POLICY IF EXISTS "Users can update their own onboarding drafts" ON user_onboarding_drafts;
DROP POLICY IF EXISTS "Users can create their own onboarding drafts" ON user_onboarding_drafts;

CREATE POLICY "Users can view their own onboarding drafts verified" 
ON user_onboarding_drafts 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND user_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.id = user_onboarding_drafts.user_id
  )
);

CREATE POLICY "Users can update their own onboarding drafts verified" 
ON user_onboarding_drafts 
FOR UPDATE 
USING (
  auth.uid() IS NOT NULL 
  AND user_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.id = user_onboarding_drafts.user_id
  )
);

CREATE POLICY "Users can create their own onboarding drafts verified" 
ON user_onboarding_drafts 
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND user_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.id = user_onboarding_drafts.user_id
  )
);

-- 🔥 CRITICAL FIX #7: USER_ONBOARDING_PROGRESS - ENHANCED USER VERIFICATION
DO $$
BEGIN
  RAISE LOG '[SECURITY_MIGRATION] 🔥 CRITICAL: Enhancing user_onboarding_progress security';
END;
$$;

-- Update onboarding progress policies with stronger verification
DROP POLICY IF EXISTS "Users can view their own onboarding progress" ON user_onboarding_progress;
DROP POLICY IF EXISTS "Users can update their own onboarding progress" ON user_onboarding_progress;
DROP POLICY IF EXISTS "Users can create their own onboarding progress" ON user_onboarding_progress;

CREATE POLICY "Users can view their own onboarding progress verified" 
ON user_onboarding_progress 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND user_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.id = user_onboarding_progress.user_id
  )
);

CREATE POLICY "Users can update their own onboarding progress verified" 
ON user_onboarding_progress 
FOR UPDATE 
USING (
  auth.uid() IS NOT NULL 
  AND user_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.id = user_onboarding_progress.user_id
  )
);

CREATE POLICY "Users can create their own onboarding progress verified" 
ON user_onboarding_progress 
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND user_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.id = user_onboarding_progress.user_id
  )
);

-- Create comprehensive security audit function
CREATE OR REPLACE FUNCTION perform_security_audit()
RETURNS TABLE(
  table_name text,
  policy_name text,
  policy_permissive text,
  policy_cmd text,
  policy_qual text,
  security_status text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    schemaname || '.' || tablename as table_name,
    policyname as policy_name,
    CASE WHEN permissive THEN 'PERMISSIVE' ELSE 'RESTRICTIVE' END as policy_permissive,
    cmd as policy_cmd,
    qual as policy_qual,
    CASE 
      WHEN qual ILIKE '%true%' AND cmd = 'SELECT' THEN '🚨 CRITICAL - Public Read Access'
      WHEN qual ILIKE '%auth.uid()%' THEN '✅ SECURE - User-scoped'
      WHEN qual IS NULL THEN '⚠️  WARNING - No restrictions'
      ELSE '🔍 REVIEW - Check policy logic'
    END as security_status
  FROM pg_policies 
  WHERE schemaname = 'public'
  ORDER BY security_status DESC, table_name, policy_name;
END;
$$;

-- Log completion of Phase 4
DO $$
BEGIN
  RAISE LOG '[SECURITY_MIGRATION] ✅ PHASE 4 COMPLETED: All RLS policies secured with enhanced verification';
END;
$$;

-- FINAL VALIDATION: Run security audit
DO $$
DECLARE
  audit_result RECORD;
  critical_count INTEGER := 0;
BEGIN
  RAISE LOG '[SECURITY_MIGRATION] Running final security validation audit...';
  
  FOR audit_result IN SELECT * FROM perform_security_audit() LOOP
    IF audit_result.security_status LIKE '🚨 CRITICAL%' THEN
      critical_count := critical_count + 1;
      RAISE LOG '[SECURITY_AUDIT] CRITICAL: % - %', audit_result.table_name, audit_result.policy_name;
    END IF;
  END LOOP;
  
  IF critical_count = 0 THEN
    RAISE LOG '[SECURITY_MIGRATION] ✅ SECURITY VALIDATION PASSED: No critical vulnerabilities detected';
  ELSE
    RAISE LOG '[SECURITY_MIGRATION] ⚠️  SECURITY VALIDATION: % critical issues remaining', critical_count;
  END IF;
END;
$$;